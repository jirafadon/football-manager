// CÓDIGO LIMPIO A AGREGAR AL FINAL DE js/market/MercadoPases.js

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
const PROBABILIDAD_OFERTA_IA = 0.05;
const PRESUPUESTO_MINIMO_IA = 10;

export function generarJugadoresLibres(cantidad) {
  const jugadores = [];
  for (let i = 0; i < cantidad; i++) {
    const nombre = NOMBRES_JUGADORES[Math.floor(Math.random() * NOMBRES_JUGADORES.length)];
    const apellido = APELLIDOS_JUGADORES[Math.floor(Math.random() * APELLIDOS_JUGADORES.length)];
    const posicion = POSICIONES_LIBRES[Math.floor(Math.random() * POSICIONES_LIBRES.length)];
    const edad = Math.floor(Math.random() * 19) + 17;
    
    const atributos = {
      velocidad: Math.floor(Math.random() * 99) + 1,
      remate: Math.floor(Math.random() * 99) + 1,
      pase: Math.floor(Math.random() * 99) + 1,
      defensa: Math.floor(Math.random() * 99) + 1,
      fisico: Math.floor(Math.random() * 99) + 1
    };
    
    const jugador = new Jugador(
      `LIB_${Math.random().toString(36).substr(2, 9)}`,
      `${nombre} ${apellido}`,
      posicion,
      atributos,
      edad,
      null,
      Math.floor(Math.random() * 50) + 1,
      0
    );
    
    jugadores.push(jugador);
  }
  return jugadores;
}

export function procesarMercadoRival(listaEquiposIA, poolJugadoresLibres) {
  const traspasos = [];
  
  listaEquiposIA.forEach(equipoIA => {
    if (Math.random() > PROBABILIDAD_OFERTA_IA || equipoIA.presupuesto < PRESUPUESTO_MINIMO_IA) {
      return;
    }
    
    const ratingActual = equipoIA.ratingEquipo ? equipoIA.ratingEquipo() : 50;
    const candidatos = [
      ...poolJugadoresLibres,
      ...listaEquiposIA
        .filter(e => e.id !== equipoIA.id)
        .flatMap(e => e.plantel.filter(j => !e.alineacionTitular.some(t => t.id === j.id)))
    ];
    
    if (candidatos.length === 0) return;
    
    const jugadorSeleccionado = candidatos[Math.floor(Math.random() * candidatos.length)];
    const ratingMejora = calcularMejoraPotencial(equipoIA, jugadorSeleccionado);
    
    if (ratingMejora <= 2) return;
    
    const precioMercado = jugadorSeleccionado.calcularPrecioMercado ? 
      jugadorSeleccionado.calcularPrecioMercado() : 50;
    const precioOferta = precioMercado * (0.8 + Math.random() * 0.4);
    
    if (equipoIA.presupuesto < precioOferta) return;
    
    const resultado = ejecutarTraspaso(
      jugadorSeleccionado,
      jugadorSeleccionado.club,
      equipoIA,
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

function calcularMejoraPotencial(equipo, jugador) {
  const posicionesNecesarias = { 'ARQ': 1, 'DEF': 4, 'MED': 4, 'DEL': 2 };
  const conteoDePosicion = equipo.alineacionTitular.filter(j => j.posicion === jugador.posicion).length;
  
  if (conteoDePosicion >= posicionesNecesarias[jugador.posicion]) {
    return 0;
  }
  
  const promActual = equipo.alineacionTitular.reduce((sum, j) => 
    sum + (j.calcularPromedio ? j.calcularPromedio() : 50), 0
  ) / equipo.alineacionTitular.length;
  
  const promNuevo = (promActual * equipo.alineacionTitular.length + 
    (jugador.calcularPromedio ? jugador.calcularPromedio() : 50)) / 
    (equipo.alineacionTitular.length + 1);
  
  return promNuevo - promActual;
}
