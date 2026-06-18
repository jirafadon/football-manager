// EXTENSIONES PARA js/market/MercadoPases.js
// Agregar al final del archivo existente

// ============ GENERADOR DE JUGADORES LIBRES ============

const NOMBRES_JUGADORES = [
  'Cristiano', 'Lionel', 'Neymar', 'Kylian', 'Robert', 'Erling', 'Vinicius',
  'Jude', 'Florian', 'Gianluigi', 'Pedri', 'Gavi', 'Rodri', 'Bellingham',
  'Haaland', 'Mbappé', 'Ronaldo', 'Messi', 'Iniesta', 'Xavi', 'Puyol',
  'Ramos', 'Piqué', 'Busquets', 'Modric', 'Kroos', 'Benzema', 'Griezmann',
  'Suárez', 'Cavani', 'Lewandowski', 'Müller', 'Neuer', 'Ter Stegen',
  'Oblak', 'Courtois', 'Donnarumma', 'Alisson', 'Van Dijk', 'Salah',
  'De Bruyne', 'Foden', 'Mahrez', 'Sané', 'Gundogan', 'Rodri', 'Dias',
  'Cancelo', 'Walker', 'Stones', 'Laporte', 'Akanji', 'Hummels'
];

const APELLIDOS_JUGADORES = [
  'Silva', 'Santos', 'Oliveira', 'Martínez', 'García', 'López', 'Rodríguez',
  'Fernández', 'Pérez', 'González', 'Hernández', 'Díaz', 'Ramírez', 'Torres',
  'Moreno', 'Jiménez', 'Ruiz', 'Vargas', 'Medina', 'Castillo', 'Romero',
  'Navarro', 'Vega', 'Domínguez', 'Flores', 'Rojas', 'Campos', 'Ortiz',
  'Soto', 'Bravo', 'Fuentes', 'Reyes', 'Salinas', 'Acosta', 'Aguirre'
];

const POSICIONES_LIBRES = ['ARQ', 'DEF', 'MED', 'DEL'];

export function generarJugadoresLibres(cantidad) {
  const jugadores = [];
  
  for (let i = 0; i < cantidad; i++) {
    const nombre = NOMBRES_JUGADORES[Math.floor(Math.random() * NOMBRES_JUGADORES.length)];
    const apellido = APELLIDOS_JUGADORES[Math.floor(Math.random() * APELLIDOS_JUGADORES.length)];
    const posicion = POSICIONES_LIBRES[Math.floor(Math.random() * POSICIONES_LIBRES.length)];
    const edad = Math.floor(Math.random() * (35 - 17 + 1)) + 17;
    
    // Generar atributos aleatorios (1-99)
    const atributos = {
      velocidad: Math.floor(Math.random() * 99) + 1,
      remate: Math.floor(Math.random() * 99) + 1,
      pase: Math.floor(Math.random() * 99) + 1,
      defensa: Math.floor(Math.random() * 99) + 1,
      fisico: Math.floor(Math.random() * 99) + 1
    };
    
    // Crear instancia de Jugador (asumir que existe la clase importada)
    const jugador = new Jugador(
      `LIB_${Math.random().toString(36).substr(2, 9)}`,
      `${nombre} ${apellido}`,
      posicion,
      atributos,
      edad,
      null, // club inicial null
      Math.floor(Math.random() * 50) + 1, // sueldo aleatorio 1-50M
      0 // dorsal temporal
    );
    
    jugadores.push(jugador);
  }
  
  return jugadores;
}

// ============ SIMULADOR DE DECISIONES DE LA IA ============

const PROBABILIDAD_OFERTA_IA = 0.05; // 5% por equipo por fecha
const PRESUPUESTO_MINIMO_IA = 10; // Presupuesto mínimo para hacer oferta

export function procesarMercadoRival(listaEquiposIA, poolJugadoresLibres) {
  const traspasos = [];
  
  listaEquiposIA.forEach(equipoIA => {
    // Verificar si el equipo de IA hace una oferta esta fecha
    if (Math.random() > PROBABILIDAD_OFERTA_IA) {
      return;
    }
    
    // Verificar presupuesto suficiente
    if (equipoIA.presupuesto < PRESUPUESTO_MINIMO_IA) {
      return;
    }
    
    // Obtener rating actual del equipo
    const ratingActual = equipoIA.ratingEquipo ? equipoIA.ratingEquipo() : 50;
    
    // Combinar pool de libres + jugadores de otros equipos IA
    const candidatos = obtenerCandidatosCompra(poolJugadoresLibres, listaEquiposIA, equipoIA);
    
    if (candidatos.length === 0) {
      return;
    }
    
    // Seleccionar jugador aleatorio
    const jugadorSeleccionado = candidatos[Math.floor(Math.random() * candidatos.length)];
    
    // Evaluar si mejora el rating
    const ratingMejora = calcularMejoraPotencial(equipoIA, jugadorSeleccionado);
    
    // Solo hacer oferta si hay mejora significativa (>2 puntos)
    if (ratingMejora <= 2) {
      return;
    }
    
    // Calcular precio de oferta (80-120% del precio de mercado)
    const precioMercado = jugadorSeleccionado.calcularPrecioMercado ? 
      jugadorSeleccionado.calcularPrecioMercado() : 50;
    const precioOferta = precioMercado * (0.8 + Math.random() * 0.4);
    
    // Verificar si puede pagar
    if (equipoIA.presupuesto < precioOferta) {
      return;
    }
    
    // Ejecutar traspaso automático
    const resultado = ejecutarTraspaso(
      jugadorSeleccionado,
      jugadorSeleccionado.club, // club origen
      equipoIA, // club destino
      precioOferta,
      'IA_AUTOMATICO'
    );
    
    if (resultado.exito) {
      traspasos.push({
        jugador: jugadorSeleccionado.nombre,
        origen: jugadorSeleccionado.club ? jugadorSeleccionado.club.nombre : 'Libre',
        destino: equipoIA.nombre,
        precio: precioOferta.toFixed(2),
        mejora: ratingMejora.toFixed(2)
      });
    }
  });
  
  return traspasos;
}

// ============ FUNCIONES AUXILIARES ============

function obtenerCandidatosCompra(poolJugadoresLibres, listaEquiposIA, equipoActual) {
  const candidatos = [];
  
  // Agregar jugadores libres
  candidatos.push(...poolJugadoresLibres);
  
  // Agregar jugadores de otros equipos IA (solo si no son titulares)
  listaEquiposIA.forEach(equipo => {
    if (equipo.id === equipoActual.id) return;
    
    const banco = equipo.plantel.filter(j => 
      !equipo.alineacionTitular.some(t => t.id === j.id)
    );
    
    candidatos.push(...banco);
  });
  
  return candidatos;
}

function calcularMejoraPotencial(equipo, jugador) {
  // Crear copia del equipo para simular
  const equipoSimulado = JSON.parse(JSON.stringify(equipo));
  
  // Agregar jugador a la alineación simulada
  const posicionesNecesarias = {
    'ARQ': 1,
    'DEF': 4,
    'MED': 4,
    'DEL': 2
  };
  
  const posicionJugador = jugador.posicion;
  const conteoDePosicion = equipoSimulado.alineacionTitular.filter(
    j => j.posicion === posicionJugador
  ).length;
  
  // Solo agregar si hay espacio para esa posición
  if (conteoDePosicion >= posicionesNecesarias[posicionJugador]) {
    return 0;
  }
  
  // Calcular promedio actual
  const promActual = equipoSimulado.alineacionTitular.reduce((sum, j) => 
    sum + (j.calcularPromedio ? j.calcularPromedio() : 50), 0
  ) / equipoSimulado.alineacionTitular.length;
  
  // Calcular promedio con el nuevo jugador
  const promNuevo = (promActual * equipoSimulado.alineacionTitular.length + 
    (jugador.calcularPromedio ? jugador.calcularPromedio() : 50)) / 
    (equipoSimulado.alineacionTitular.length + 1);
  
  return promNuevo - promActual;
}

function generarIdUnico() {
  return 'LIB_' + Math.random().toString(36).substr(2, 9);
}

// ============ EXPORTAR FUNCIONES ============
export {
  generarJugadoresLibres,
  procesarMercadoRival,
  PROBABILIDAD_OFERTA_IA,
  PRESUPUESTO_MINIMO_IA
};
