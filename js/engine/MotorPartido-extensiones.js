/**
 * Extensiones de MotorPartido.js - Tarjetas, Lesiones y Dinámicas
 * Agregar estas funciones y lógica al motor existente
 */

// ============ CONSTANTES ============
const PROBABILIDAD_FALTA_BASE = 0.02; // 2% por tick
const PROBABILIDAD_TARJETA_AMARILLA = 0.7; // 70% de que sea amarilla
const DURACION_SUSPENSION_ROJA = 1; // 1 fecha

// ============ EXTENDER ESTADO DEL PARTIDO ============
// Agregar al estado inicial en crearEstadoPartido():
// estado.tarjetas = [];
// estado.lesiones = [];
// estado.expulsados = [];

// ============ DETECTAR FALTAS Y TARJETAS ============
export function detectarFaltasYTarjetas(estado) {
  estado.jugadoresEnCancha.forEach(jugador => {
    // Solo defensores pueden cometer faltas
    if (jugador.posicion === 'DEF' || jugador.posicion === 'MED') {
      // Probabilidad de falta inversamente proporcional a defensa
      const defensaEfectiva = jugador.defensa || 0.7;
      const probabilidadFalta = PROBABILIDAD_FALTA_BASE * (1 - defensaEfectiva);

      if (Math.random() < probabilidadFalta) {
        procesarFalta(estado, jugador);
      }
    }
  });
}

// ============ PROCESAR FALTA ============
function procesarFalta(estado, jugador) {
  const esAmarilla = Math.random() < PROBABILIDAD_TARJETA_AMARILLA;

  if (esAmarilla) {
    // Tarjeta amarilla
    jugador.tarjetasAmarillas = (jugador.tarjetasAmarillas || 0) + 1;

    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'TARJETA_AMARILLA',
      descripcion: `Tarjeta amarilla a ${jugador.nombre}`,
      autor: jugador.nombre,
      equipo: jugador.equipo
    });

    // Dos amarillas = expulsión
    if (jugador.tarjetasAmarillas >= 2) {
      expulsarJugador(estado, jugador, 'roja_acumulada');
    }
  } else {
    // Tarjeta roja directa
    expulsarJugador(estado, jugador, 'roja_directa');
  }

  estado.tarjetas.push({
    minuto: estado.minuto,
    jugador: jugador.nombre,
    equipo: jugador.equipo,
    tipo: esAmarilla ? 'amarilla' : 'roja'
  });
}

// ============ EXPULSAR JUGADOR ============
function expulsarJugador(estado, jugador, tipo) {
  estado.eventos.push({
    minuto: estado.minuto,
    tipo: 'EXPULSION',
    descripcion: `¡EXPULSIÓN! ${jugador.nombre} (${tipo === 'roja_directa' ? 'Roja directa' : 'Roja por acumulación'})`,
    autor: jugador.nombre,
    equipo: jugador.equipo
  });

  // Marcar como expulsado
  jugador.expulsado = true;
  jugador.suspendido = true; // Suspendido para próxima fecha

  // Remover del campo
  estado.expulsados.push({
    minuto: estado.minuto,
    jugador: jugador.nombre,
    equipo: jugador.equipo
  });
}

// ============ SIMULAR LESIÓN DURANTE PARTIDO ============
export function simularLesionesPartido(estado) {
  const PROBABILIDAD_LESION = 0.001; // 0.1% por tick

  estado.jugadoresEnCancha.forEach(jugador => {
    if (!jugador.lesionado && Math.random() < PROBABILIDAD_LESION) {
      // Lesión más probable con baja energía
      const probabilidadAjustada = PROBABILIDAD_LESION * (1 - (jugador.energia || 100) / 100);

      if (Math.random() < probabilidadAjustada) {
        jugador.lesionado = true;
        jugador.semanasLesion = Math.floor(Math.random() * 4) + 1;
        jugador.expulsado = true; // Remover del partido

        estado.lesiones.push({
          minuto: estado.minuto,
          jugador: jugador.nombre,
          equipo: jugador.equipo,
          semanasEstimadas: jugador.semanasLesion
        });

        estado.eventos.push({
          minuto: estado.minuto,
          tipo: 'LESION',
          descripcion: `¡LESIÓN! ${jugador.nombre} (${jugador.semanasLesion} semanas)`,
          autor: jugador.nombre,
          equipo: jugador.equipo
        });
      }
    }
  });
}

// ============ ACTUALIZAR ENERGÍA DURANTE PARTIDO ============
export function actualizarEnergia(estado) {
  estado.jugadoresEnCancha.forEach(jugador => {
    if (!jugador.expulsado) {
      // Reducir energía según actividad
      const reduccionEnergia = 0.3; // 0.3 puntos por tick
      jugador.energia = Math.max(0, (jugador.energia || 100) - reduccionEnergia);
    }
  });
}

// ============ APLICAR EFECTOS POST-PARTIDO ============
export function aplicarEfectosPostPartido(estado, equipoLocal, equipoVisitante) {
  const resultados = {
    lesionados: [],
    suspendidos: [],
    cambiosEnergia: []
  };

  // Procesar ambos equipos
  [equipoLocal, equipoVisitante].forEach(equipo => {
    equipo.plantel.forEach(jugador => {
      // Reducir energía post-partido
      const esfuerzo = 0.7;
      const reduccionEnergia = esfuerzo * (Math.random() * 30 + 20);
      jugador.energia = Math.max(0, (jugador.energia || 100) - reduccionEnergia);

      resultados.cambiosEnergia.push({
        jugador: jugador.nombre,
        energiaAnterior: jugador.energia + reduccionEnergia,
        energiaNueva: jugador.energia
      });

      // Probabilidad de lesión si energía muy baja
      const probabilidadLesion = (1 - jugador.energia / 100) * 0.1;
      if (Math.random() < probabilidadLesion && !jugador.lesionado) {
        jugador.lesionado = true;
        jugador.semanasLesion = Math.floor(Math.random() * 3) + 1;
        resultados.lesionados.push({
          jugador: jugador.nombre,
          semanas: jugador.semanasLesion
        });
      }

      // Procesar suspensiones por tarjetas
      if (jugador.suspendido) {
        resultados.suspendidos.push({
          jugador: jugador.nombre,
          razon: jugador.tarjetasAmarillas >= 2 ? 'Roja acumulada' : 'Roja directa'
        });
      }
    });
  });

  return resultados;
}

// ============ DECREMENTAR LESIONES Y SUSPENSIONES (FIN DE FECHA) ============
export function procesarFinDeFecha(plantel) {
  const cambios = {
    jugadoresRecuperados: [],
    jugadoresSuspendidosLiberados: []
  };

  plantel.forEach(jugador => {
    // Decrementar semanas de lesión
    if (jugador.lesionado && jugador.semanasLesion > 0) {
      jugador.semanasLesion--;

      if (jugador.semanasLesion === 0) {
        jugador.lesionado = false;
        jugador.energia = Math.min(100, (jugador.energia || 50) + 30);
        cambios.jugadoresRecuperados.push(jugador.nombre);
      }
    }

    // Liberar suspensión
    if (jugador.suspendido && jugador.tarjetasAmarillas === 0) {
      jugador.suspendido = false;
      cambios.jugadoresSuspendidosLiberados.push(jugador.nombre);
    }

    // Limpiar tarjetas al final de la temporada (simulado)
    // Descomentar si se implementa sistema de temporadas
    // if (esFinDeTemporada) {
    //   jugador.tarjetasAmarillas = 0;
    // }
  });

  return cambios;
}

// ============ VALIDAR ALINEACIÓN (EXCLUIR LESIONADOS/SUSPENDIDOS) ============
export function validarAlineacionDisponible(alineacion) {
  return alineacion.filter(jugador => !jugador.lesionado && !jugador.suspendido);
}

// ============ GENERAR REPORTE DE LESIONES ============
export function generarReporteLesiones(plantel) {
  const lesionados = plantel.filter(j => j.lesionado);
  const suspendidos = plantel.filter(j => j.suspendido && !j.lesionado);

  return {
    lesionados: lesionados.map(j => ({
      nombre: j.nombre,
      posicion: j.posicion,
      semanasRestantes: j.semanasLesion
    })),
    suspendidos: suspendidos.map(j => ({
      nombre: j.nombre,
      posicion: j.posicion,
      razon: j.tarjetasAmarillas >= 2 ? 'Roja acumulada' : 'Roja directa'
    })),
    disponibles: plantel.length - lesionados.length - suspendidos.length
  };
}

export {
  detectarFaltasYTarjetas,
  simularLesionesPartido,
  actualizarEnergia,
  aplicarEfectosPostPartido,
  procesarFinDeFecha,
  validarAlineacionDisponible,
  generarReporteLesiones
};
