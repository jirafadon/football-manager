/**
 * State Machine - Flujo de Control Principal del Juego
 * Gestiona transiciones entre estados: Menú → Simulación → Post-Partido
 */

// ============ ESTADOS DEL JUEGO ============
export const GAME_STATES = {
  MENU_PRINCIPAL: 'MENU_PRINCIPAL',
  GESTION_PLANTILLA: 'GESTION_PLANTILLA',
  MERCADO: 'MERCADO',
  SIMULACION_FECHA: 'SIMULACION_FECHA',
  PARTIDO_USUARIO: 'PARTIDO_USUARIO',
  POST_PARTIDO: 'POST_PARTIDO',
  FIN_TEMPORADA: 'FIN_TEMPORADA'
};

// ============ STATE MACHINE ============
export class GameStateMachine {
  constructor(equipo, liga, mercado) {
    this.equipo = equipo;
    this.liga = liga;
    this.mercado = mercado;
    this.estadoActual = GAME_STATES.MENU_PRINCIPAL;
    this.estadoAnterior = null;
    this.listeners = {};
    this.datosPartidoActual = null;
    this.resultadoPartidoUsuario = null;
  }

  // ============ CAMBIAR ESTADO ============
  cambiarEstado(nuevoEstado) {
    if (!Object.values(GAME_STATES).includes(nuevoEstado)) {
      console.error(`Estado inválido: ${nuevoEstado}`);
      return false;
    }

    this.estadoAnterior = this.estadoActual;
    this.estadoActual = nuevoEstado;

    console.log(`[STATE] ${this.estadoAnterior} → ${this.estadoActual}`);
    this.emitirEvento('estadoCambiado', { anterior: this.estadoAnterior, nuevo: nuevoEstado });

    return true;
  }

  // ============ SUSCRIBIRSE A EVENTOS ============
  on(evento, callback) {
    if (!this.listeners[evento]) {
      this.listeners[evento] = [];
    }
    this.listeners[evento].push(callback);
  }

  // ============ EMITIR EVENTOS ============
  emitirEvento(evento, datos = {}) {
    if (this.listeners[evento]) {
      this.listeners[evento].forEach(callback => callback(datos));
    }
  }

  // ============ INICIAR FECHA ============
  iniciarFecha() {
    this.cambiarEstado(GAME_STATES.SIMULACION_FECHA);

    // Obtener próximo partido del usuario
    const proximoPartido = this.liga.obtenerProximoPartido(this.equipo.id);
    if (!proximoPartido) {
      console.error('No hay próximo partido disponible');
      return;
    }

    this.datosPartidoActual = proximoPartido;
    this.emitirEvento('iniciarPartidoUsuario', { partido: proximoPartido });
  }

  // ============ REGISTRAR RESULTADO DEL USUARIO ============
  registrarResultadoUsuario(golesLocal, golesVisitante) {
    this.resultadoPartidoUsuario = {
      golesLocal,
      golesVisitante,
      fecha: this.liga.fechaActual
    };

    // Registrar en la liga
    this.liga.registrarPartidoUsuario(golesLocal, golesVisitante);

    this.cambiarEstado(GAME_STATES.POST_PARTIDO);
    this.emitirEvento('resultadoRegistrado', this.resultadoPartidoUsuario);
  }

  // ============ PROCESAR POST-PARTIDO ============
  procesarPostPartido(precioEntrada = 50) {
    // 1. Actualizar finanzas
    this.equipo.procesarBalanceFecha(precioEntrada);

    // 2. Reducir lesiones
    this.equipo.plantel.forEach(jugador => {
      if (jugador.lesionado && jugador.semanasLesion > 0) {
        jugador.semanasLesion--;
        if (jugador.semanasLesion === 0) {
          jugador.lesionado = false;
        }
      }
    });

    // 3. Simular partidos de fondo (IA)
    this.liga.simularFechaActual(this.equipo.id);

    // 4. Procesar mercado de IA
    if (this.mercado && this.mercado.procesarMercadoRival) {
      this.mercado.procesarMercadoRival(
        this.liga.equipos.filter(e => e.id !== this.equipo.id),
        this.mercado.poolJugadoresLibres || []
      );
    }

    // 5. Avanzar fecha
    this.liga.fechaActual++;

    this.emitirEvento('postPartidoProcesado', {
      resultados: this.resultadoPartidoUsuario,
      finanzas: {
        presupuesto: this.equipo.presupuesto,
        gastos: this.equipo.calcularGastosSueldos(),
        ingresos: this.equipo.estadio.capacidad * precioEntrada
      }
    });

    // 6. Verificar fin de temporada (38 fechas)
    if (this.liga.fechaActual > 38) {
      this.cambiarEstado(GAME_STATES.FIN_TEMPORADA);
      this.emitirEvento('finTemporada', { tabla: this.liga.obtenerTablaOrdenada() });
    } else {
      this.cambiarEstado(GAME_STATES.MENU_PRINCIPAL);
    }
  }

  // ============ VOLVER AL MENÚ ============
  volverAlMenu() {
    this.cambiarEstado(GAME_STATES.MENU_PRINCIPAL);
    this.datosPartidoActual = null;
    this.resultadoPartidoUsuario = null;
    this.emitirEvento('volverAlMenu', {});
  }

  // ============ ABRIR GESTIÓN DE PLANTILLA ============
  abrirGestionPlantilla() {
    this.cambiarEstado(GAME_STATES.GESTION_PLANTILLA);
    this.emitirEvento('abrirGestionPlantilla', { equipo: this.equipo });
  }

  // ============ CERRAR GESTIÓN DE PLANTILLA ============
  cerrarGestionPlantilla() {
    this.cambiarEstado(GAME_STATES.MENU_PRINCIPAL);
    this.emitirEvento('cerrarGestionPlantilla', {});
  }

  // ============ ABRIR MERCADO ============
  abrirMercado() {
    this.cambiarEstado(GAME_STATES.MERCADO);
    this.emitirEvento('abrirMercado', { mercado: this.mercado });
  }

  // ============ CERRAR MERCADO ============
  cerrarMercado() {
    this.cambiarEstado(GAME_STATES.MENU_PRINCIPAL);
    this.emitirEvento('cerrarMercado', {});
  }

  // ============ OBTENER TABLA ACTUALIZADA ============
  obtenerTablaActualizada() {
    return this.liga.obtenerTablaOrdenada();
  }

  // ============ OBTENER PRÓXIMO PARTIDO ============
  obtenerProximoPartido() {
    return this.liga.obtenerProximoPartido(this.equipo.id);
  }

  // ============ OBTENER ESTADO ACTUAL ============
  getEstadoActual() {
    return this.estadoActual;
  }

  // ============ OBTENER DATOS EQUIPO ============
  obtenerDatosEquipo() {
    return {
      nombre: this.equipo.nombre,
      presupuesto: this.equipo.presupuesto,
      gastosSueldos: this.equipo.calcularGastosSueldos(),
      rating: this.equipo.ratingEquipo(),
      plantilla: this.equipo.plantel.length,
      titulares: (this.equipo.alineacionTitular || []).length
    };
  }

  // ============ OBTENER POSICIÓN EN TABLA ============
  obtenerPosicionTabla() {
    const tabla = this.obtenerTablaActualizada();
    const posicion = tabla.findIndex(e => e.id === this.equipo.id);
    return posicion >= 0 ? posicion + 1 : null;
  }

  // ============ OBTENER INFORMACIÓN DE FECHA ============
  obtenerInfoFecha() {
    return {
      fechaActual: this.liga.fechaActual,
      totalFechas: 38,
      proximoPartido: this.obtenerProximoPartido(),
      posicion: this.obtenerPosicionTabla()
    };
  }
}

export default GameStateMachine;
