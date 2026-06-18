/**
 * GeneradorDatos.js - Generador dinámico de liga completa
 * Construye 20 equipos con 20 jugadores cada uno, nombres únicos y atributos variados
 */

// ============ BASES DE DATOS DE NOMBRES ============
const NOMBRES = [
  'Juan', 'Carlos', 'Miguel', 'Fernando', 'Antonio', 'Diego', 'Roberto', 'Luis', 'Javier', 'Andrés',
  'Pablo', 'Sergio', 'Alejandro', 'Ricardo', 'Guillermo', 'Enrique', 'Raúl', 'Víctor', 'Óscar', 'Julio',
  'Mateo', 'Marcos', 'Lucas', 'Jorge', 'Héctor', 'Martín', 'Esteban', 'Cristian', 'Ignacio', 'Rodrigo'
];

const APELLIDOS = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
  'Rivera', 'Cruz', 'Morales', 'Gutiérrez', 'Ortiz', 'Jiménez', 'Reyes', 'Vargas', 'Castillo', 'Medina',
  'Herrera', 'Rojas', 'Silva', 'Campos', 'Vega', 'Navarro', 'Cabrera', 'Salazar', 'Fuentes', 'Rivas'
];

const NOMBRES_CLUBES = [
  'Athletic Club', 'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Valencia CF',
  'Sevilla FC', 'Real Sociedad', 'Villarreal CF', 'Real Betis', 'Getafe CF',
  'Celta de Vigo', 'Osasuna', 'Mallorca', 'Almería', 'Las Palmas',
  'Rayo Vallecano', 'Girona FC', 'Leganés', 'Elche CF', 'Sporting Gijón'
];

const ESTADIOS = [
  'San Mamés', 'Santiago Bernabéu', 'Camp Nou', 'Wanda Metropolitano', 'Mestalla',
  'Ramón Sánchez Pizjuán', 'Anoeta', 'El Madrigal', 'Benito Villamarín', 'Coliseum Alfonso Pérez',
  'Balaídos', 'El Sadar', 'Iberostar', 'Estadio de Almería', 'Gran Canaria',
  'Vallecas', 'Montilivi', 'Butarque', 'Martínez Valero', 'El Molinón'
];

// ============ GENERADOR DE NOMBRES ALEATORIOS ============
export function generarNombresAleatorios(cantidad = 1) {
  const nombres = [];
  for (let i = 0; i < cantidad; i++) {
    const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    const apellido = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
    nombres.push(`${nombre} ${apellido}`);
  }
  return cantidad === 1 ? nombres[0] : nombres;
}

// ============ GENERADOR DE JUGADOR ============
export function generarJugador(idEquipo, indice) {
  const posiciones = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL'];
  const posicion = posiciones[indice % posiciones.length];

  // Atributos base según posición
  let atributosBase = {
    velocidad: 70,
    remate: 70,
    pase: 70,
    defensa: 70,
    fisico: 70
  };

  // Especializaciones por posición
  if (posicion === 'POR') {
    atributosBase = { velocidad: 60, remate: 30, pase: 65, defensa: 85, fisico: 80 };
  } else if (posicion === 'DEF') {
    atributosBase = { velocidad: 72, remate: 50, pase: 70, defensa: 85, fisico: 82 };
  } else if (posicion === 'MED') {
    atributosBase = { velocidad: 75, remate: 70, pase: 80, defensa: 70, fisico: 75 };
  } else if (posicion === 'DEL') {
    atributosBase = { velocidad: 80, remate: 85, pase: 70, defensa: 50, fisico: 75 };
  }

  // Añadir variación aleatoria ±15
  const atributos = {};
  for (const [key, value] of Object.entries(atributosBase)) {
    const variacion = (Math.random() - 0.5) * 30;
    atributos[key] = Math.max(40, Math.min(99, value + variacion));
  }

  return {
    id: `${idEquipo}_jug_${indice}`,
    nombre: generarNombresAleatorios(),
    posicion,
    edad: Math.floor(Math.random() * 15) + 20,
    sueldo: Math.random() * 8 + 1,
    atributos,
    energia: 100,
    lesionado: false,
    semanasLesion: 0,
    tarjetasAmarillas: 0,
    suspendido: false,
    moral: 100,
    valorMercado: calcularValorMercado(atributos),

    // Métodos
    calcularPromedio() {
      const { velocidad, remate, pase, defensa, fisico } = this.atributos;
      return (velocidad + remate + pase + defensa + fisico) / 5;
    },

    calcularAtributoEfectivo(atributo) {
      let valor = this.atributos[atributo] || 50;
      if (this.lesionado) {
        valor *= (1 - (this.semanasLesion / 4) * 0.3);
      }
      valor *= (this.energia / 100);
      return valor;
    },

    rendimientoEfectivo(atributo) {
      return this.calcularAtributoEfectivo(atributo);
    }
  };
}

// ============ GENERADOR DE EQUIPO ============
export function generarEquipo(indice) {
  const nombre = NOMBRES_CLUBES[indice];
  const estadio = ESTADIOS[indice];
  const capacidad = Math.floor(Math.random() * 30000) + 40000;

  const plantel = [];
  for (let i = 0; i < 20; i++) {
    plantel.push(generarJugador(`eq_${indice}`, i));
  }

  const alineacionTitular = plantel.slice(0, 11);

  return {
    id: `eq_${indice}`,
    nombre,
    presupuesto: Math.random() * 100 + 50,
    estadio: { nombre, capacidad },
    reputacion: Math.random() * 100,
    plantel,
    alineacionTitular,
    historialTransacciones: [],

    // Métodos
    calcularGastosSueldos() {
      return this.plantel.reduce((sum, j) => sum + (j.sueldo || 0), 0);
    },

    ratingEquipo() {
      if (this.alineacionTitular.length === 0) return 70;
      const suma = this.alineacionTitular.reduce((sum, j) => sum + j.calcularPromedio(), 0);
      return suma / this.alineacionTitular.length;
    },

    procesarBalanceFecha(precioEntrada = 50) {
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

    agregarJugador(jugador) {
      if (!this.plantel.find(j => j.id === jugador.id)) {
        this.plantel.push(jugador);
      }
    },

    validarAlineacion() {
      if (this.alineacionTitular.length !== 11) return false;
      const porteros = this.alineacionTitular.filter(j => j.posicion === 'POR').length;
      return porteros >= 1;
    }
  };
}

// ============ GENERADOR DE LIGA COMPLETA ============
export function generarLigaCompleta(nombre = 'Temporada 2026') {
  const equipos = [];
  for (let i = 0; i < 20; i++) {
    equipos.push(generarEquipo(i));
  }

  const fixture = generarFixture(equipos);

  return {
    nombre,
    fechaActual: 1,
    equipos,
    fixture,

    // Métodos
    obtenerTablaOrdenada() {
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

    obtenerProximoPartido(idEquipo) {
      return this.fixture.find(p => 
        !p.jugado && (p.local.id === idEquipo || p.visitante.id === idEquipo)
      );
    },

    registrarPartidoUsuario(golesLocal, golesVisitante) {
      const proximoPartido = this.fixture.find(p => 
        !p.jugado && (p.local.id === equipoUsuario?.id || p.visitante.id === equipoUsuario?.id)
      );
      if (proximoPartido) {
        proximoPartido.jugado = true;
        proximoPartido.resultado = { golesLocal, golesVisitante };
      }
    },

    simularFechaActual(idEquipoUsuario) {
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

// ============ GENERADOR DE FIXTURE (ROUND ROBIN) ============
function generarFixture(equipos) {
  const fixture = [];
  let fechaActual = 1;
  let idPartido = 1;

  // Ida (19 fechas)
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      fixture.push({
        id: `partido_${idPartido++}`,
        fecha: fechaActual,
        local: { id: equipos[i].id, nombre: equipos[i].nombre },
        visitante: { id: equipos[j].id, nombre: equipos[j].nombre },
        jugado: false,
        resultado: null
      });

      if (fixture.length % 10 === 0) {
        fechaActual++;
      }
    }
  }

  // Vuelta (19 fechas)
  fechaActual = 20;
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      fixture.push({
        id: `partido_${idPartido++}`,
        fecha: fechaActual,
        local: { id: equipos[j].id, nombre: equipos[j].nombre },
        visitante: { id: equipos[i].id, nombre: equipos[i].nombre },
        jugado: false,
        resultado: null
      });

      if ((fixture.length - 95) % 10 === 0 && fixture.length > 95) {
        fechaActual++;
      }
    }
  }

  return fixture;
}

// ============ CALCULAR VALOR DE MERCADO ============
function calcularValorMercado(atributos) {
  const promedio = (atributos.velocidad + atributos.remate + atributos.pase + atributos.defensa + atributos.fisico) / 5;
  return (promedio / 100) * 50; // Valor en millones
}

// ============ EXPORTAR FUNCIONES ============
export {
  generarNombresAleatorios,
  generarJugador,
  generarEquipo,
  generarLigaCompleta,
  generarFixture,
  calcularValorMercado
};
