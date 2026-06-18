/**
 * Persistencia.js - Guardado y Carga de Partida en localStorage
 * Serializa/deserializa equipos, jugadores y liga con reconstitución de métodos
 */

const STORAGE_KEY = 'manager_save';
const VERSION = 1;

// ============ GUARDAR PARTIDA ============
export function guardarPartida(equipoUsuario, liga) {
  try {
    const datosPartida = {
      version: VERSION,
      timestamp: new Date().toISOString(),
      equipo: serializarEquipo(equipoUsuario),
      liga: serializarLiga(liga)
    };

    const jsonString = JSON.stringify(datosPartida);
    localStorage.setItem(STORAGE_KEY, jsonString);

    console.log('[PERSISTENCIA] Partida guardada exitosamente');
    return true;
  } catch (error) {
    console.error('[PERSISTENCIA] Error al guardar:', error);
    return false;
  }
}

// ============ CARGAR PARTIDA ============
export function cargarPartida() {
  try {
    const jsonString = localStorage.getItem(STORAGE_KEY);

    if (!jsonString) {
      console.log('[PERSISTENCIA] No hay partida guardada');
      return null;
    }

    const datosPartida = JSON.parse(jsonString);

    if (datosPartida.version !== VERSION) {
      console.warn('[PERSISTENCIA] Versión de guardado diferente');
    }

    const equipoUsuario = deserializarEquipo(datosPartida.equipo);
    const liga = deserializarLiga(datosPartida.liga);

    console.log('[PERSISTENCIA] Partida cargada exitosamente');
    return { equipoUsuario, liga };
  } catch (error) {
    console.error('[PERSISTENCIA] Error al cargar:', error);
    return null;
  }
}

// ============ ELIMINAR PARTIDA ============
export function eliminarPartida() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[PERSISTENCIA] Partida eliminada');
    return true;
  } catch (error) {
    console.error('[PERSISTENCIA] Error al eliminar:', error);
    return false;
  }
}

// ============ VERIFICAR SI EXISTE PARTIDA ============
export function existePartida() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// ============ SERIALIZAR EQUIPO ============
function serializarEquipo(equipo) {
  return {
    id: equipo.id,
    nombre: equipo.nombre,
    presupuesto: equipo.presupuesto,
    estadio: {
      nombre: equipo.estadio?.nombre || 'Estadio',
      capacidad: equipo.estadio?.capacidad || 50000
    },
    reputacion: equipo.reputacion || 50,
    plantel: equipo.plantel.map(j => serializarJugador(j)),
    alineacionTitular: (equipo.alineacionTitular || []).map(j => j.id),
    historialTransacciones: equipo.historialTransacciones || []
  };
}

// ============ SERIALIZAR JUGADOR ============
function serializarJugador(jugador) {
  return {
    id: jugador.id,
    nombre: jugador.nombre,
    posicion: jugador.posicion,
    edad: jugador.edad,
    sueldo: jugador.sueldo,
    atributos: {
      velocidad: jugador.atributos?.velocidad || 70,
      remate: jugador.atributos?.remate || 70,
      pase: jugador.atributos?.pase || 70,
      defensa: jugador.atributos?.defensa || 70,
      fisico: jugador.atributos?.fisico || 70
    },
    energia: jugador.energia || 100,
    lesionado: jugador.lesionado || false,
    semanasLesion: jugador.semanasLesion || 0,
    tarjetasAmarillas: jugador.tarjetasAmarillas || 0,
    suspendido: jugador.suspendido || false,
    moral: jugador.moral || 100,
    valorMercado: jugador.valorMercado || 0
  };
}

// ============ SERIALIZAR LIGA ============
function serializarLiga(liga) {
  return {
    nombre: liga.nombre,
    fechaActual: liga.fechaActual || 1,
    equipos: liga.equipos.map(e => ({ id: e.id, nombre: e.nombre })),
    fixture: (liga.fixture || []).map(p => ({
      id: p.id,
      fecha: p.fecha,
      local: { id: p.local.id, nombre: p.local.nombre },
      visitante: { id: p.visitante.id, nombre: p.visitante.nombre },
      jugado: p.jugado || false,
      resultado: p.resultado || null
    }))
  };
}

// ============ DESERIALIZAR EQUIPO ============
function deserializarEquipo(datosEquipo) {
  // Reconstruir jugadores con métodos
  const jugadores = datosEquipo.plantel.map(j => deserializarJugador(j));

  // Crear instancia de Equipo (asumiendo que existe clase Equipo)
  const equipo = {
    id: datosEquipo.id,
    nombre: datosEquipo.nombre,
    presupuesto: datosEquipo.presupuesto,
    estadio: datosEquipo.estadio,
    reputacion: datosEquipo.reputacion,
    plantel: jugadores,
    alineacionTitular: [],
    historialTransacciones: datosEquipo.historialTransacciones,

    // Métodos de Equipo
    calcularGastosSueldos: function() {
      return this.plantel.reduce((sum, j) => sum + (j.sueldo || 0), 0);
    },

    ratingEquipo: function() {
      if (this.alineacionTitular.length === 0) return 70;
      const suma = this.alineacionTitular.reduce((sum, j) => sum + j.calcularPromedio(), 0);
      return suma / this.alineacionTitular.length;
    },

    procesarBalanceFecha: function(precioEntrada = 50) {
      const ingresos = this.estadio.capacidad * precioEntrada * (0.7 + Math.random() * 0.3);
      const gastos = this.calcularGastosSueldos();
      this.presupuesto += ingresos - gastos;
      this.historialTransacciones.push({
        fecha: new Date().toISOString(),
        tipo: 'balance',
        ingresos,
        gastos,
        saldo: this.presupuesto
      });
    },

    agregarJugador: function(jugador) {
      if (!this.plantel.find(j => j.id === jugador.id)) {
        this.plantel.push(jugador);
      }
    }
  };

  // Restaurar alineación titular
  equipo.alineacionTitular = datosEquipo.alineacionTitular
    .map(idJugador => jugadores.find(j => j.id === idJugador))
    .filter(Boolean);

  return equipo;
}

// ============ DESERIALIZAR JUGADOR ============
function deserializarJugador(datosJugador) {
  return {
    id: datosJugador.id,
    nombre: datosJugador.nombre,
    posicion: datosJugador.posicion,
    edad: datosJugador.edad,
    sueldo: datosJugador.sueldo,
    atributos: datosJugador.atributos,
    energia: datosJugador.energia,
    lesionado: datosJugador.lesionado,
    semanasLesion: datosJugador.semanasLesion,
    tarjetasAmarillas: datosJugador.tarjetasAmarillas,
    suspendido: datosJugador.suspendido,
    moral: datosJugador.moral,
    valorMercado: datosJugador.valorMercado,

    // Métodos de Jugador
    calcularPromedio: function() {
      const { velocidad, remate, pase, defensa, fisico } = this.atributos;
      return (velocidad + remate + pase + defensa + fisico) / 5;
    },

    calcularAtributoEfectivo: function(atributo) {
      let valor = this.atributos[atributo] || 50;
      if (this.lesionado) {
        valor *= (1 - (this.semanasLesion / 4) * 0.3);
      }
      valor *= (this.energia / 100);
      return valor;
    },

    rendimientoEfectivo: function(atributo) {
      return this.calcularAtributoEfectivo(atributo);
    }
  };
}

// ============ DESERIALIZAR LIGA ============
function deserializarLiga(datosLiga) {
  return {
    nombre: datosLiga.nombre,
    fechaActual: datosLiga.fechaActual,
    equipos: datosLiga.equipos,
    fixture: datosLiga.fixture,

    // Métodos de Liga
    obtenerTablaOrdenada: function() {
      const tabla = this.equipos.map(e => ({
        id: e.id,
        nombre: e.nombre,
        PJ: 0,
        PG: 0,
        PE: 0,
        PP: 0,
        GF: 0,
        GC: 0,
        DG: 0,
        puntos: 0
      }));

      this.fixture.forEach(partido => {
        if (!partido.jugado || !partido.resultado) return;

        const local = tabla.find(e => e.id === partido.local.id);
        const visitante = tabla.find(e => e.id === partido.visitante.id);

        if (local) {
          local.PJ++;
          local.GF += partido.resultado.golesLocal;
          local.GC += partido.resultado.golesVisitante;

          if (partido.resultado.golesLocal > partido.resultado.golesVisitante) {
            local.PG++;
            local.puntos += 3;
          } else if (partido.resultado.golesLocal === partido.resultado.golesVisitante) {
            local.PE++;
            local.puntos += 1;
          } else {
            local.PP++;
          }
        }

        if (visitante) {
          visitante.PJ++;
          visitante.GF += partido.resultado.golesVisitante;
          visitante.GC += partido.resultado.golesLocal;

          if (partido.resultado.golesVisitante > partido.resultado.golesLocal) {
            visitante.PG++;
            visitante.puntos += 3;
          } else if (partido.resultado.golesLocal === partido.resultado.golesVisitante) {
            visitante.PE++;
            visitante.puntos += 1;
          } else {
            visitante.PP++;
          }
        }
      });

      tabla.forEach(e => {
        e.DG = e.GF - e.GC;
      });

      return tabla.sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.DG !== a.DG) return b.DG - a.DG;
        return b.GF - a.GF;
      });
    },

    obtenerProximoPartido: function(idEquipo) {
      return this.fixture.find(p => 
        !p.jugado && (p.local.id === idEquipo || p.visitante.id === idEquipo)
      );
    },

    registrarPartidoUsuario: function(golesLocal, golesVisitante) {
      const proximoPartido = this.fixture.find(p => 
        !p.jugado && (p.local.id === equipoUsuario?.id || p.visitante.id === equipoUsuario?.id)
      );
      if (proximoPartido) {
        proximoPartido.jugado = true;
        proximoPartido.resultado = { golesLocal, golesVisitante };
      }
    },

    simularFechaActual: function(idEquipoUsuario) {
      const partidosNoJugados = this.fixture.filter(p => 
        !p.jugado && p.fecha === this.fechaActual &&
        p.local.id !== idEquipoUsuario && p.visitante.id !== idEquipoUsuario
      );

      partidosNoJugados.forEach(partido => {
        partido.jugado = true;
        const ratingLocal = 70;
        const ratingVisitante = 70;
        const probabilidadLocal = (ratingLocal * 1.15) / (ratingLocal * 1.15 + ratingVisitante);
        partido.resultado = {
          golesLocal: Math.random() < probabilidadLocal ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2),
          golesVisitante: Math.random() < (1 - probabilidadLocal) ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2)
        };
      });
    }
  };
}

export { STORAGE_KEY, VERSION };
