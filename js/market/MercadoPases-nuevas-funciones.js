// CÓDIGO A AGREGAR AL FINAL DE js/market/MercadoPases.js

const NOMBRES_LIBRES = [
  'Cristiano', 'Lionel', 'Neymar', 'Kylian', 'Robert', 'Erling', 'Vinicius', 'Jude', 'Florian', 'Gianluigi',
  'Pedri', 'Gavi', 'Rodri', 'Bellingham', 'Haaland', 'Mbappé', 'Ronaldo', 'Messi', 'Iniesta', 'Xavi',
  'Puyol', 'Ramos', 'Piqué', 'Busquets', 'Modric', 'Kroos', 'Benzema', 'Griezmann', 'Suárez', 'Cavani',
  'Lewandowski', 'Müller', 'Neuer', 'Ter Stegen', 'Oblak', 'Courtois', 'Donnarumma', 'Alisson', 'Van Dijk', 'Salah'
];

const APELLIDOS_LIBRES = [
  'Silva', 'Santos', 'Oliveira', 'Martínez', 'García', 'López', 'Rodríguez', 'Fernández', 'Pérez', 'González',
  'Hernández', 'Díaz', 'Ramírez', 'Torres', 'Moreno', 'Jiménez', 'Ruiz', 'Vargas', 'Medina', 'Castillo',
  'Romero', 'Navarro', 'Vega', 'Domínguez', 'Flores', 'Rojas', 'Campos', 'Ortiz', 'Soto', 'Bravo'
];

const POSICIONES_LIBRES = ['POR', 'DEF', 'MED', 'DEL'];

// Generar array de jugadores libres
export function generarJugadoresLibres(cantidad) {
  const jugadores = [];
  
  for (let i = 0; i < cantidad; i++) {
    const nombre = NOMBRES_LIBRES[Math.floor(Math.random() * NOMBRES_LIBRES.length)];
    const apellido = APELLIDOS_LIBRES[Math.floor(Math.random() * APELLIDOS_LIBRES.length)];
    const posicion = POSICIONES_LIBRES[Math.floor(Math.random() * POSICIONES_LIBRES.length)];
    const edad = Math.floor(Math.random() * 18) + 17; // 17-35 años
    
    // Atributos aleatorios entre 55 y 80
    const atributos = {
      velocidad: Math.floor(Math.random() * 26) + 55,
      remate: Math.floor(Math.random() * 26) + 55,
      pase: Math.floor(Math.random() * 26) + 55,
      defensa: Math.floor(Math.random() * 26) + 55,
      fisico: Math.floor(Math.random() * 26) + 55
    };
    
    // Crear instancia de Jugador
    const jugador = new Jugador(
      `LIB_${Math.random().toString(36).substr(2, 9)}`, // ID único
      `${nombre} ${apellido}`,
      posicion,
      atributos,
      edad,
      null, // club origen null
      Math.floor(Math.random() * 3) + 1, // sueldo 1-4M
      0 // dorsal temporal
    );
    
    jugadores.push(jugador);
  }
  
  return jugadores;
}

// Simular transferencias de equipos IA
export function procesarMercadoRival(equiposIA, poolJugadoresLibres) {
  const PROBABILIDAD_OFERTA = 0.05; // 5% por equipo
  const PRESUPUESTO_MINIMO = 5; // Mínimo para ofertar
  const traspasos = [];
  
  equiposIA.forEach(equipoIA => {
    // Verificar probabilidad y presupuesto
    if (Math.random() > PROBABILIDAD_OFERTA || equipoIA.presupuesto < PRESUPUESTO_MINIMO) {
      return;
    }
    
    // Combinar pool de libres + jugadores transferibles de otros equipos IA
    const candidatos = [
      ...poolJugadoresLibres,
      ...equiposIA
        .filter(e => e.id !== equipoIA.id)
        .flatMap(e => e.plantel.filter(j => !e.alineacionTitular.some(t => t.id === j.id)))
    ];
    
    if (candidatos.length === 0) return;
    
    // Seleccionar jugador al azar
    const jugadorTarget = candidatos[Math.floor(Math.random() * candidatos.length)];
    
    // Calcular mejora de rating
    const ratingActual = equipoIA.ratingEquipo ? equipoIA.ratingEquipo() : 50;
    const ratingConJugador = calcularRatingMejorado(equipoIA, jugadorTarget);
    const mejora = ratingConJugador - ratingActual;
    
    // Solo ofertar si hay mejora significativa (>1 punto)
    if (mejora <= 1) return;
    
    // Calcular precio de oferta (70-130% del valor de mercado)
    const precioMercado = jugadorTarget.calcularPrecioMercado ? jugadorTarget.calcularPrecioMercado() : 30;
    const precioOferta = precioMercado * (0.7 + Math.random() * 0.6);
    
    // Verificar presupuesto
    if (equipoIA.presupuesto < precioOferta) return;
    
    // Ejecutar traspaso
    const resultado = ejecutarTraspaso(
      jugadorTarget,
      jugadorTarget.club, // origen
      equipoIA, // destino
      precioOferta,
      'IA_AUTO'
    );
    
    if (resultado.exito) {
      traspasos.push({
        jugador: jugadorTarget.nombre,
        origen: jugadorTarget.club ? jugadorTarget.club.nombre : 'Libre',
        destino: equipoIA.nombre,
        precio: precioOferta.toFixed(1),
        mejora: mejora.toFixed(2)
      });
    }
  });
  
  return traspasos;
}

// Calcular rating mejorado con nuevo jugador
function calcularRatingMejorado(equipo, jugadorNuevo) {
  const alineacion = equipo.alineacionTitular || equipo.plantel.slice(0, 11);
  
  // Verificar si hay espacio para la posición
  const posicionesRequeridas = { 'POR': 1, 'DEF': 4, 'MED': 4, 'DEL': 2 };
  const conteoPosicion = alineacion.filter(j => j.posicion === jugadorNuevo.posicion).length;
  
  if (conteoPosicion >= posicionesRequeridas[jugadorNuevo.posicion]) {
    return 0; // No hay espacio
  }
  
  // Calcular promedio actual
  const promedioActual = alineacion.reduce((sum, j) => 
    sum + (j.calcularPromedio ? j.calcularPromedio() : 50), 0
  ) / alineacion.length;
  
  // Calcular promedio con nuevo jugador
  const promedioNuevo = (promedioActual * alineacion.length + 
    (jugadorNuevo.calcularPromedio ? jugadorNuevo.calcularPromedio() : 50)) / 
    (alineacion.length + 1);
  
  return promedioNuevo - promedioActual;
}

export { generarJugadoresLibres, procesarMercadoRival };
