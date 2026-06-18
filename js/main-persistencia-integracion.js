// ============ 4 LÍNEAS DE CÓDIGO A AGREGAR AL INICIO DE main.js ============

// Importar módulo de persistencia
import { cargarPartida, guardarPartida } from './data/Persistencia.js';

// Intentar cargar partida guardada, si no existe usar datos por defecto
const datosGuardados = cargarPartida();
const { equipoUsuario, liga } = datosGuardados || { equipoUsuario: crearEquipoUsuario(), liga: crearLigaDefault() };

// ============ EXPLICACIÓN ============
// Línea 1: Importa funciones de persistencia
// Línea 2: Intenta cargar partida del localStorage
// Línea 3-4: Si cargarPartida() devuelve null, usa funciones por defecto
//
// Resultado: equipoUsuario y liga están disponibles globalmente
// Si hay partida guardada: se cargan los datos serializados
// Si NO hay partida guardada: se crean datos nuevos

// ============ FUNCIONES AUXILIARES (SI NO EXISTEN) ============

function crearEquipoUsuario() {
  return {
    id: 'usuario_' + Math.random().toString(36).substr(2, 9),
    nombre: 'Mi Equipo',
    presupuesto: 100,
    estadio: { nombre: 'Mi Estadio', capacidad: 50000 },
    reputacion: 50,
    plantel: generarJugadoresEjemplo(20),
    alineacionTitular: [],
    historialTransacciones: [],
    calcularGastosSueldos: function() {
      return this.plantel.reduce((sum, j) => sum + (j.sueldo || 0), 0);
    },
    procesarBalanceFecha: function(precioEntrada = 50) {
      const ingresos = this.estadio.capacidad * precioEntrada * (0.7 + Math.random() * 0.3);
      const gastos = this.calcularGastosSueldos();
      this.presupuesto += ingresos - gastos;
    },
    ratingEquipo: function() {
      if (this.alineacionTitular.length === 0) return 70;
      const suma = this.alineacionTitular.reduce((sum, j) => sum + j.calcularPromedio(), 0);
      return suma / this.alineacionTitular.length;
    }
  };
}

function crearLigaDefault() {
  return {
    nombre: 'Temporada 2026',
    fechaActual: 1,
    equipos: [equipoUsuario, ...generarEquiposRivales(19)],
    fixture: [],
    obtenerTablaOrdenada: function() {
      return this.equipos.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
    },
    obtenerProximoPartido: function(idEquipo) {
      return this.fixture.find(p => !p.jugado && (p.local.id === idEquipo || p.visitante.id === idEquipo));
    }
  };
}

function generarJugadoresEjemplo(cantidad) {
  const posiciones = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL'];
  const jugadores = [];

  for (let i = 0; i < cantidad; i++) {
    const posicion = posiciones[i % posiciones.length];
    jugadores.push({
      id: 'jug_' + i,
      nombre: `Jugador ${i + 1}`,
      posicion,
      edad: Math.floor(Math.random() * 15) + 20,
      sueldo: Math.random() * 5 + 1,
      atributos: {
        velocidad: Math.random() * 30 + 60,
        remate: Math.random() * 30 + 60,
        pase: Math.random() * 30 + 60,
        defensa: Math.random() * 30 + 60,
        fisico: Math.random() * 30 + 60
      },
      energia: 100,
      lesionado: false,
      semanasLesion: 0,
      tarjetasAmarillas: 0,
      suspendido: false,
      calcularPromedio: function() {
        const { velocidad, remate, pase, defensa, fisico } = this.atributos;
        return (velocidad + remate + pase + defensa + fisico) / 5;
      }
    });
  }

  return jugadores;
}

function generarEquiposRivales(cantidad) {
  const equipos = [];
  for (let i = 0; i < cantidad; i++) {
    equipos.push({
      id: 'rival_' + i,
      nombre: `Equipo Rival ${i + 1}`,
      presupuesto: Math.random() * 100 + 50,
      estadio: { nombre: `Estadio ${i + 1}`, capacidad: Math.random() * 30000 + 20000 },
      reputacion: Math.random() * 100,
      plantel: generarJugadoresEjemplo(11),
      alineacionTitular: [],
      ratingEquipo: function() { return 70; }
    });
  }
  return equipos;
}

// ============ GUARDAR PARTIDA AL CAMBIAR DE PANTALLA O FINALIZAR FECHA ============
// Agregar esta línea donde se finaliza cada fecha o cambio importante:
// guardarPartida(equipoUsuario, liga);
