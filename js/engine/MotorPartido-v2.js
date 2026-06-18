/**
 * Motor de Partido v2.0 - Simulación Interactiva 2D
 * Simulación completa de partido con física táctica, movimiento de jugadores,
 * posesión de pelota, duelos y generación de eventos
 */

// ============ CONSTANTES ============
const DIMENSIONES_CANCHA = { ancho: 100, alto: 60 };
const PORTERIA_LOCAL = { x: 0, y: 30 };
const PORTERIA_VISITANTE = { x: 100, y: 30 };
const POSICION_INICIAL_PELOTA = { x: 50, y: 30 };
const TICKS_POR_MINUTO = 60;
const DURACION_PARTIDO = 90; // minutos
const TOTAL_TICKS = DURACION_PARTIDO * TICKS_POR_MINUTO;
const RADIO_ACCION = 2; // unidades de distancia para interceptar
const RADIO_PASE = 15; // distancia máxima de pase
const VELOCIDAD_PELOTA = 3; // unidades por tick
const ZONA_ATAQUE_LOCAL = 25;
const ZONA_ATAQUE_VISITANTE = 75;

// ============ ESQUEMAS TÁCTICOS ============
const ESQUEMAS_TACTICOS = {
  '4-4-2': {
    DEF: [
      { x: 10, y: 15 }, { x: 10, y: 30 }, { x: 10, y: 45 },
      { x: 15, y: 22 }, { x: 15, y: 38 }
    ],
    MED: [
      { x: 35, y: 12 }, { x: 35, y: 28 }, { x: 35, y: 42 }, { x: 35, y: 58 }
    ],
    DEL: [
      { x: 70, y: 20 }, { x: 70, y: 40 }
    ]
  },
  '4-3-3': {
    DEF: [
      { x: 10, y: 15 }, { x: 10, y: 30 }, { x: 10, y: 45 },
      { x: 15, y: 22 }, { x: 15, y: 38 }
    ],
    MED: [
      { x: 40, y: 30 }, { x: 35, y: 15 }, { x: 35, y: 45 }
    ],
    DEL: [
      { x: 75, y: 15 }, { x: 75, y: 30 }, { x: 75, y: 45 }
    ]
  },
  '5-3-2': {
    DEF: [
      { x: 10, y: 12 }, { x: 10, y: 30 }, { x: 10, y: 48 },
      { x: 15, y: 20 }, { x: 15, y: 40 }
    ],
    MED: [
      { x: 40, y: 15 }, { x: 40, y: 30 }, { x: 40, y: 45 }
    ],
    DEL: [
      { x: 75, y: 22 }, { x: 75, y: 38 }
    ]
  }
};

// ============ CREAR ESTADO DEL PARTIDO ============
export function crearEstadoPartido(equipoLocal, equipoVisitante, esquemaLocal = '4-4-2', esquemaVisitante = '4-4-2') {
  const estado = {
    equipoLocal,
    equipoVisitante,
    pelota: { ...POSICION_INICIAL_PELOTA },
    jugadores: [],
    posesion: null, // ID del jugador con la pelota
    tick: 0,
    minuto: 0,
    golesLocal: 0,
    golesVisitante: 0,
    eventos: [],
    posesionLocal: 0,
    posesionVisitante: 0,
    tiros: { local: 0, visitante: 0 },
    tirosAlArco: { local: 0, visitante: 0 }
  };

  // Distribuir jugadores locales
  distribuirJugadores(estado, equipoLocal, esquemaLocal, true);

  // Distribuir jugadores visitantes
  distribuirJugadores(estado, equipoVisitante, esquemaVisitante, false);

  return estado;
}

// ============ DISTRIBUIR JUGADORES EN LA CANCHA ============
function distribuirJugadores(estado, equipo, esquema, esLocal) {
  const esquemaTactico = ESQUEMAS_TACTICOS[esquema] || ESQUEMAS_TACTICOS['4-4-2'];
  const alineacion = equipo.alineacionTitular || equipo.plantel.slice(0, 11);
  
  let indiceJugador = 0;
  
  // Arquero
  const arquero = alineacion.find(j => j.posicion === 'ARQ') || alineacion[0];
  const posArquero = esLocal ? { x: 5, y: 30 } : { x: 95, y: 30 };
  
  estado.jugadores.push({
    id: arquero.id,
    nombre: arquero.nombre,
    posicion: 'ARQ',
    equipo: esLocal ? 'local' : 'visitante',
    x: posArquero.x,
    y: posArquero.y,
    posicionInicial: { ...posArquero },
    atributos: arquero.atributos || {},
    velocidad: arquero.atributos?.velocidad || 50,
    remate: arquero.atributos?.remate || 20,
    pase: arquero.atributos?.pase || 50,
    defensa: arquero.atributos?.defensa || 80,
    fisico: arquero.atributos?.fisico || 70
  });

  // Defensas
  const defensas = alineacion.filter(j => j.posicion === 'DEF');
  defensas.forEach((j, idx) => {
    if (idx < esquemaTactico.DEF.length) {
      const pos = esquemaTactico.DEF[idx];
      const posAjustada = esLocal ? pos : { x: 100 - pos.x, y: pos.y };
      
      estado.jugadores.push({
        id: j.id,
        nombre: j.nombre,
        posicion: 'DEF',
        equipo: esLocal ? 'local' : 'visitante',
        x: posAjustada.x,
        y: posAjustada.y,
        posicionInicial: { ...posAjustada },
        atributos: j.atributos || {},
        velocidad: j.atributos?.velocidad || 70,
        remate: j.atributos?.remate || 40,
        pase: j.atributos?.pase || 60,
        defensa: j.atributos?.defensa || 85,
        fisico: j.atributos?.fisico || 75
      });
    }
  });

  // Mediocampistas
  const medios = alineacion.filter(j => j.posicion === 'MED');
  medios.forEach((j, idx) => {
    if (idx < esquemaTactico.MED.length) {
      const pos = esquemaTactico.MED[idx];
      const posAjustada = esLocal ? pos : { x: 100 - pos.x, y: pos.y };
      
      estado.jugadores.push({
        id: j.id,
        nombre: j.nombre,
        posicion: 'MED',
        equipo: esLocal ? 'local' : 'visitante',
        x: posAjustada.x,
        y: posAjustada.y,
        posicionInicial: { ...posAjustada },
        atributos: j.atributos || {},
        velocidad: j.atributos?.velocidad || 75,
        remate: j.atributos?.remate || 60,
        pase: j.atributos?.pase || 80,
        defensa: j.atributos?.defensa || 65,
        fisico: j.atributos?.fisico || 70
      });
    }
  });

  // Delanteros
  const delanteros = alineacion.filter(j => j.posicion === 'DEL');
  delanteros.forEach((j, idx) => {
    if (idx < esquemaTactico.DEL.length) {
      const pos = esquemaTactico.DEL[idx];
      const posAjustada = esLocal ? pos : { x: 100 - pos.x, y: pos.y };
      
      estado.jugadores.push({
        id: j.id,
        nombre: j.nombre,
        posicion: 'DEL',
        equipo: esLocal ? 'local' : 'visitante',
        x: posAjustada.x,
        y: posAjustada.y,
        posicionInicial: { ...posAjustada },
        atributos: j.atributos || {},
        velocidad: j.atributos?.velocidad || 85,
        remate: j.atributos?.remate || 85,
        pase: j.atributos?.pase || 70,
        defensa: j.atributos?.defensa || 45,
        fisico: j.atributos?.fisico || 75
      });
    }
  });
}

// ============ BUCLE DE SIMULACIÓN - PASO POR TICK ============
export function simularPasoTick(estado) {
  if (estado.tick >= TOTAL_TICKS) {
    return estado; // Partido finalizado
  }

  // Actualizar minuto
  estado.minuto = Math.floor(estado.tick / TICKS_POR_MINUTO);

  // 1. Determinar quién tiene la pelota
  actualizarPosesion(estado);

  // 2. Mover jugadores
  moverJugadores(estado);

  // 3. Procesar acción del jugador con posesión
  if (estado.posesion) {
    procesarAccionPosesion(estado);
  }

  // 4. Detectar duelos
  detectarDuelos(estado);

  // 5. Detectar goles
  detectarGoles(estado);

  // Avanzar tick
  estado.tick++;

  return estado;
}

// ============ ACTUALIZAR POSESIÓN ============
function actualizarPosesion(estado) {
  // Si nadie tiene la pelota, el más cercano la obtiene
  if (!estado.posesion) {
    let jugadorMasCercano = null;
    let distanciaMinima = Infinity;

    estado.jugadores.forEach(j => {
      const distancia = calcularDistancia(j.x, j.y, estado.pelota.x, estado.pelota.y);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        jugadorMasCercano = j;
      }
    });

    if (jugadorMasCercano && distanciaMinima < 3) {
      estado.posesion = jugadorMasCercano.id;
    }
  } else {
    // Verificar si el jugador sigue siendo el más cercano
    const jugadorActual = estado.jugadores.find(j => j.id === estado.posesion);
    const distanciaActual = calcularDistancia(jugadorActual.x, jugadorActual.y, estado.pelota.x, estado.pelota.y);

    // Si la pelota está muy lejos, perder posesión
    if (distanciaActual > 5) {
      estado.posesion = null;
      actualizarPosesion(estado);
    }
  }
}

// ============ MOVER JUGADORES ============
function moverJugadores(estado) {
  estado.jugadores.forEach(jugador => {
    const esLocal = jugador.equipo === 'local';
    const velocidadMovimiento = jugador.velocidad / 100 * 0.5; // Escalar velocidad

    if (jugador.id === estado.posesion) {
      // Jugador con pelota: avanza hacia el arco rival
      const arcRival = esLocal ? PORTERIA_VISITANTE : PORTERIA_LOCAL;
      moverHacia(jugador, arcRival.x, arcRival.y, velocidadMovimiento * 1.5);
    } else {
      // Jugador sin pelota: se mueve hacia la pelota o regresa a posición táctica
      const distanciaPelota = calcularDistancia(jugador.x, jugador.y, estado.pelota.x, estado.pelota.y);

      if (distanciaPelota < 20) {
        // Acercarse a la pelota
        moverHacia(jugador, estado.pelota.x, estado.pelota.y, velocidadMovimiento);
      } else {
        // Regresar a posición táctica
        moverHacia(jugador, jugador.posicionInicial.x, jugador.posicionInicial.y, velocidadMovimiento * 0.5);
      }
    }

    // Mantener dentro de la cancha
    jugador.x = Math.max(0, Math.min(DIMENSIONES_CANCHA.ancho, jugador.x));
    jugador.y = Math.max(0, Math.min(DIMENSIONES_CANCHA.alto, jugador.y));
  });
}

// ============ PROCESAR ACCIÓN DE POSESIÓN ============
function procesarAccionPosesion(estado) {
  const jugadorConPelota = estado.jugadores.find(j => j.id === estado.posesion);
  if (!jugadorConPelota) return;

  const esLocal = jugadorConPelota.equipo === 'local';
  const arcRival = esLocal ? PORTERIA_VISITANTE : PORTERIA_LOCAL;
  const distanciaAlArco = calcularDistancia(jugadorConPelota.x, jugadorConPelota.y, arcRival.x, arcRival.y);

  // Probabilidad de acción basada en atributos
  const probabilidadPase = (jugadorConPelota.pase / 100) * 0.4;
  const probabilidadRemate = (jugadorConPelota.remate / 100) * 0.3;
  const probabilidadAvanzar = 1 - probabilidadPase - probabilidadRemate;

  const accion = Math.random();

  if (accion < probabilidadPase) {
    // Intentar pase
    realizarPase(estado, jugadorConPelota);
  } else if (accion < probabilidadPase + probabilidadRemate && distanciaAlArco < 30) {
    // Intentar remate
    realizarRemate(estado, jugadorConPelota);
  } else {
    // Avanzar/regate
    avanzarConPelota(estado, jugadorConPelota);
  }
}

// ============ REALIZAR PASE ============
function realizarPase(estado, jugador) {
  const esLocal = jugador.equipo === 'local';
  const compañeros = estado.jugadores.filter(j => j.equipo === jugador.equipo && j.id !== jugador.id);

  // Buscar compañero libre más cercano
  let compañeroLibre = null;
  let distanciaMinima = RADIO_PASE;

  compañeros.forEach(c => {
    const distancia = calcularDistancia(jugador.x, jugador.y, c.x, c.y);
    const tieneDefensor = estado.jugadores.some(
      d => d.equipo !== jugador.equipo && calcularDistancia(d.x, d.y, c.x, c.y) < 5
    );

    if (distancia < distanciaMinima && !tieneDefensor) {
      distanciaMinima = distancia;
      compañeroLibre = c;
    }
  });

  if (compañeroLibre) {
    // Pase exitoso
    estado.pelota.x = compañeroLibre.x;
    estado.pelota.y = compañeroLibre.y;
    estado.posesion = compañeroLibre.id;
    estado.posesionLocal += esLocal ? 1 : 0;
    estado.posesionVisitante += !esLocal ? 1 : 0;
  } else {
    // Pase interceptado
    perderPosesion(estado);
  }
}

// ============ REALIZAR REMATE ============
function realizarRemate(estado, jugador) {
  const esLocal = jugador.equipo === 'local';
  const arcRival = esLocal ? PORTERIA_VISITANTE : PORTERIA_LOCAL;
  const arqueroRival = estado.jugadores.find(j => j.posicion === 'ARQ' && j.equipo !== jugador.equipo);

  // Calcular probabilidad de gol
  const efectividadRemate = jugador.remate / 100;
  const efectividadPortero = arqueroRival.defensa / 100;
  const probabilidadGol = efectividadRemate * (1 - efectividadPortero * 0.7);

  estado.tiros[esLocal ? 'local' : 'visitante']++;

  if (Math.random() < probabilidadGol) {
    // ¡GOL!
    if (esLocal) {
      estado.golesLocal++;
    } else {
      estado.golesVisitante++;
    }

    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'GOL',
      descripcion: `¡GOL! ${jugador.nombre} (${jugador.equipo})`,
      autor: jugador.nombre,
      equipo: jugador.equipo
    });

    // Reiniciar posición
    estado.pelota = { ...POSICION_INICIAL_PELOTA };
    estado.posesion = null;
  } else {
    // Tiro desviado
    estado.tirosAlArco[esLocal ? 'local' : 'visitante']++;
    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'TIRO',
      descripcion: `Tiro de ${jugador.nombre}`,
      autor: jugador.nombre,
      equipo: jugador.equipo
    });

    perderPosesion(estado);
  }
}

// ============ AVANZAR CON PELOTA ============
function avanzarConPelota(estado, jugador) {
  const esLocal = jugador.equipo === 'local';
  const arcRival = esLocal ? PORTERIA_VISITANTE : PORTERIA_LOCAL;

  // Mover pelota hacia el arco rival
  const dx = arcRival.x - estado.pelota.x;
  const dy = arcRival.y - estado.pelota.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);

  if (distancia > 0) {
    const velocidad = VELOCIDAD_PELOTA;
    estado.pelota.x += (dx / distancia) * velocidad;
    estado.pelota.y += (dy / distancia) * velocidad;
  }
}

// ============ DETECTAR DUELOS ============
function detectarDuelos(estado) {
  if (!estado.posesion) return;

  const jugadorConPelota = estado.jugadores.find(j => j.id === estado.posesion);
  const equipoRival = jugadorConPelota.equipo === 'local' ? 'visitante' : 'local';

  const defensoresRivales = estado.jugadores.filter(
    j => j.equipo === equipoRival && calcularDistancia(j.x, j.y, jugadorConPelota.x, jugadorConPelota.y) < RADIO_ACCION
  );

  defensoresRivales.forEach(defensor => {
    // Duelo probabilístico
    const efectividadAtaque = jugadorConPelota.velocidad / 100;
    const efectividadDefensa = defensor.defensa / 100;
    const probabilidadPierdeBalon = efectividadDefensa * (1 - efectividadAtaque * 0.5);

    if (Math.random() < probabilidadPierdeBalon) {
      estado.eventos.push({
        minuto: estado.minuto,
        tipo: 'INTERCEPCION',
        descripcion: `Intercepción de ${defensor.nombre}`,
        autor: defensor.nombre,
        equipo: defensor.equipo
      });

      estado.posesion = defensor.id;
      estado.pelota.x = defensor.x;
      estado.pelota.y = defensor.y;
    }
  });
}

// ============ DETECTAR GOLES ============
function detectarGoles(estado) {
  const arcLocal = PORTERIA_LOCAL;
  const arcVisitante = PORTERIA_VISITANTE;

  const distanciaArcLocal = calcularDistancia(estado.pelota.x, estado.pelota.y, arcLocal.x, arcLocal.y);
  const distanciaArcVisitante = calcularDistancia(estado.pelota.x, estado.pelota.y, arcVisitante.x, arcVisitante.y);

  // Pelota en portería local
  if (distanciaArcLocal < 3 && estado.pelota.x < 5) {
    estado.golesVisitante++;
    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'GOL',
      descripcion: 'GOL del visitante',
      equipo: 'visitante'
    });
    estado.pelota = { ...POSICION_INICIAL_PELOTA };
    estado.posesion = null;
  }

  // Pelota en portería visitante
  if (distanciaArcVisitante < 3 && estado.pelota.x > 95) {
    estado.golesLocal++;
    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'GOL',
      descripcion: 'GOL del local',
      equipo: 'local'
    });
    estado.pelota = { ...POSICION_INICIAL_PELOTA };
    estado.posesion = null;
  }
}

// ============ PERDER POSESIÓN ============
function perderPosesion(estado) {
  estado.posesion = null;
}

// ============ UTILIDADES MATEMÁTICAS ============
function calcularDistancia(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function moverHacia(jugador, targetX, targetY, velocidad) {
  const dx = targetX - jugador.x;
  const dy = targetY - jugador.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);

  if (distancia > 0) {
    jugador.x += (dx / distancia) * velocidad;
    jugador.y += (dy / distancia) * velocidad;
  }
}

// ============ SIMULAR PARTIDO COMPLETO ============
export function simularPartidoCompleto(equipoLocal, equipoVisitante) {
  const estado = crearEstadoPartido(equipoLocal, equipoVisitante);

  while (estado.tick < TOTAL_TICKS) {
    simularPasoTick(estado);
  }

  return {
    golesLocal: estado.golesLocal,
    golesVisitante: estado.golesVisitante,
    eventos: estado.eventos,
    estadisticas: {
      posesionLocal: estado.posesionLocal,
      posesionVisitante: estado.posesionVisitante,
      tirosLocal: estado.tiros.local,
      tirosVisitante: estado.tiros.visitante,
      tirosAlArcoLocal: estado.tirosAlArco.local,
      tirosAlArcoVisitante: estado.tirosAlArco.visitante
    }
  };
}

// ============ EXPORTAR ============
export { DIMENSIONES_CANCHA, PORTERIA_LOCAL, PORTERIA_VISITANTE, TOTAL_TICKS, TICKS_POR_MINUTO };
