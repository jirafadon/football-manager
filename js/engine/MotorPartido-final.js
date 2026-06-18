/**
 * Motor de Partido v3.0 - Simulador Dinámico 2D en Tiempo Real
 * Simulación interactiva con posesión, movimiento táctico, duelos y eventos
 */

// ============ CONSTANTES ============
const CANCHA = { ancho: 100, alto: 60 };
const ARCO_LOCAL = { x: 0, y: 30, radio: 4 };
const ARCO_VISITANTE = { x: 100, y: 30, radio: 4 };
const PELOTA_INICIAL = { x: 50, y: 30 };
const TICKS_POR_MINUTO = 60;
const DURACION_PARTIDO = 90;
const TOTAL_TICKS = DURACION_PARTIDO * TICKS_POR_MINUTO;
const DISTANCIA_POSESION = 1.5;
const DISTANCIA_DUELO = 2.5;
const RADIO_PASE = 20;
const ZONA_ATAQUE_LOCAL = 75;
const ZONA_ATAQUE_VISITANTE = 25;
const VELOCIDAD_PELOTA = 2;
const INTERVALO_DECISION = 5; // ticks

// ============ FORMACIONES TÁCTICAS ============
const FORMACIONES = {
  '4-4-2': {
    local: {
      POR: [{ x: 5, y: 30 }],
      DEF: [{ x: 15, y: 15 }, { x: 15, y: 30 }, { x: 15, y: 45 }, { x: 20, y: 22 }, { x: 20, y: 38 }],
      MED: [{ x: 40, y: 12 }, { x: 40, y: 28 }, { x: 40, y: 42 }, { x: 40, y: 58 }],
      DEL: [{ x: 75, y: 20 }, { x: 75, y: 40 }]
    },
    visitante: {
      POR: [{ x: 95, y: 30 }],
      DEF: [{ x: 85, y: 15 }, { x: 85, y: 30 }, { x: 85, y: 45 }, { x: 80, y: 22 }, { x: 80, y: 38 }],
      MED: [{ x: 60, y: 12 }, { x: 60, y: 28 }, { x: 60, y: 42 }, { x: 60, y: 58 }],
      DEL: [{ x: 25, y: 20 }, { x: 25, y: 40 }]
    }
  }
};

// ============ CREAR ESTADO DEL PARTIDO ============
export function crearEstadoPartido(equipoLocal, equipoVisitante, formacion = '4-4-2') {
  const estado = {
    equipoLocal,
    equipoVisitante,
    formacion,
    pelota: { ...PELOTA_INICIAL },
    jugadoresEnCancha: [],
    posesionId: null,
    tick: 0,
    minuto: 0,
    golesLocal: 0,
    golesVisitante: 0,
    eventos: [],
    estadisticas: {
      posesionLocal: 0,
      posesionVisitante: 0,
      tirosLocal: 0,
      tirosVisitante: 0,
      tirosAlArcoLocal: 0,
      tirosAlArcoVisitante: 0,
      faltas: 0
    }
  };

  // Inicializar jugadores
  inicializarJugadores(estado, equipoLocal, 'local', formacion);
  inicializarJugadores(estado, equipoVisitante, 'visitante', formacion);

  return estado;
}

// ============ INICIALIZAR JUGADORES ============
function inicializarJugadores(estado, equipo, equipo_tipo, formacion) {
  const alineacion = equipo.alineacionTitular || equipo.plantel.slice(0, 11);
  const formacionData = FORMACIONES[formacion][equipo_tipo];
  let indice = 0;

  Object.entries(formacionData).forEach(([posicion, posiciones]) => {
    const jugadoresPosicion = alineacion.filter(j => j.posicion === posicion);

    jugadoresPosicion.forEach((jugador, idx) => {
      if (idx < posiciones.length) {
        const pos = posiciones[idx];
        estado.jugadoresEnCancha.push({
          id: jugador.id,
          nombre: jugador.nombre,
          posicion: posicion,
          equipo: equipo_tipo,
          x: pos.x,
          y: pos.y,
          posicionTactica: { ...pos },
          velocidad: (jugador.atributos?.velocidad || 70) / 100,
          remate: (jugador.atributos?.remate || 70) / 100,
          pase: (jugador.atributos?.pase || 70) / 100,
          defensa: (jugador.atributos?.defensa || 70) / 100,
          fisico: (jugador.atributos?.fisico || 70) / 100,
          ultimaDecision: 0
        });
      }
    });
  });
}

// ============ BUCLE DE SIMULACIÓN - TICK ============
export function simularTick(estado) {
  if (estado.tick >= TOTAL_TICKS) return estado;

  estado.minuto = Math.floor(estado.tick / TICKS_POR_MINUTO);

  // 1. Actualizar posesión
  actualizarPosesion(estado);

  // 2. Mover jugadores
  moverJugadores(estado);

  // 3. Procesar decisión del portador
  if (estado.posesionId && estado.tick % INTERVALO_DECISION === 0) {
    procesarDecision(estado);
  }

  // 4. Detectar duelos
  detectarDuelos(estado);

  // 5. Detectar goles
  detectarGoles(estado);

  // 6. Actualizar estadísticas
  actualizarEstadisticas(estado);

  estado.tick++;
  return estado;
}

// ============ ACTUALIZAR POSESIÓN ============
function actualizarPosesion(estado) {
  if (!estado.posesionId) {
    // Buscar jugador más cercano a la pelota
    let masCercano = null;
    let distanciaMin = Infinity;

    estado.jugadoresEnCancha.forEach(j => {
      const dist = calcularDistancia(j.x, j.y, estado.pelota.x, estado.pelota.y);
      if (dist < distanciaMin) {
        distanciaMin = dist;
        masCercano = j;
      }
    });

    if (masCercano && distanciaMin < DISTANCIA_POSESION) {
      estado.posesionId = masCercano.id;
    }
  } else {
    // Verificar si el portador sigue siendo el más cercano
    const portador = estado.jugadoresEnCancha.find(j => j.id === estado.posesionId);
    if (!portador) {
      estado.posesionId = null;
      return;
    }

    const distancia = calcularDistancia(portador.x, portador.y, estado.pelota.x, estado.pelota.y);
    if (distancia > 5) {
      estado.posesionId = null;
    }
  }
}

// ============ MOVER JUGADORES ============
function moverJugadores(estado) {
  estado.jugadoresEnCancha.forEach(jugador => {
    const velocidadMovimiento = jugador.velocidad * 0.1;

    if (jugador.id === estado.posesionId) {
      // Portador: avanza hacia arco rival
      const arcoRival = jugador.equipo === 'local' ? ARCO_VISITANTE : ARCO_LOCAL;
      moverHacia(jugador, arcoRival.x, arcoRival.y, velocidadMovimiento * 1.5);
    } else {
      // Sin pelota: se mueve hacia la pelota o regresa a posición táctica
      const distanciaPelota = calcularDistancia(jugador.x, jugador.y, estado.pelota.x, estado.pelota.y);

      if (distanciaPelota < 25) {
        // Acercarse a la pelota
        moverHacia(jugador, estado.pelota.x, estado.pelota.y, velocidadMovimiento);
      } else {
        // Regresar a posición táctica
        moverHacia(jugador, jugador.posicionTactica.x, jugador.posicionTactica.y, velocidadMovimiento * 0.5);
      }
    }

    // Mantener dentro de la cancha
    jugador.x = Math.max(0, Math.min(CANCHA.ancho, jugador.x));
    jugador.y = Math.max(0, Math.min(CANCHA.alto, jugador.y));
  });
}

// ============ PROCESAR DECISIÓN DEL PORTADOR ============
function procesarDecision(estado) {
  const portador = estado.jugadoresEnCancha.find(j => j.id === estado.posesionId);
  if (!portador) return;

  const esLocal = portador.equipo === 'local';
  const zonaAtaque = esLocal ? ZONA_ATAQUE_LOCAL : ZONA_ATAQUE_VISITANTE;
  const distanciaAlArco = Math.abs(estado.pelota.x - (esLocal ? 100 : 0));

  // Decisión probabilística
  const probabilidadPase = portador.pase * 0.4;
  const probabilidadRemate = portador.remate * 0.3 * (distanciaAlArco < 30 ? 1.5 : 1);
  const probabilidadAvanzar = 1 - probabilidadPase - probabilidadRemate;

  const decision = Math.random();

  if (decision < probabilidadPase) {
    realizarPase(estado, portador);
  } else if (decision < probabilidadPase + probabilidadRemate && distanciaAlArco < 30) {
    realizarRemate(estado, portador);
  } else {
    avanzarConPelota(estado, portador);
  }
}

// ============ REALIZAR PASE ============
function realizarPase(estado, portador) {
  const equipo = portador.equipo;
  const compañeros = estado.jugadoresEnCancha.filter(j => j.equipo === equipo && j.id !== portador.id);

  // Buscar compañero libre más cercano
  let mejorCompañero = null;
  let mejorDistancia = RADIO_PASE;

  compañeros.forEach(c => {
    const distancia = calcularDistancia(portador.x, portador.y, c.x, c.y);
    const tieneDefensor = estado.jugadoresEnCancha.some(
      d => d.equipo !== equipo && calcularDistancia(d.x, d.y, c.x, c.y) < 4
    );

    if (distancia < mejorDistancia && !tieneDefensor) {
      mejorDistancia = distancia;
      mejorCompañero = c;
    }
  });

  if (mejorCompañero) {
    // Pase exitoso
    estado.pelota.x = mejorCompañero.x;
    estado.pelota.y = mejorCompañero.y;
    estado.posesionId = mejorCompañero.id;
  } else {
    // Pase interceptado
    perderPosesion(estado);
  }
}

// ============ REALIZAR REMATE ============
function realizarRemate(estado, portador) {
  const esLocal = portador.equipo === 'local';
  const arqueroRival = estado.jugadoresEnCancha.find(j => j.posicion === 'POR' && j.equipo !== portador.equipo);

  // Calcular probabilidad de gol
  const efectividadRemate = portador.remate;
  const efectividadPortero = arqueroRival.defensa;
  const probabilidadGol = efectividadRemate * (1 - efectividadPortero * 0.6);

  estado.estadisticas[esLocal ? 'tirosLocal' : 'tirosVisitante']++;

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
      descripcion: `¡GOL! ${portador.nombre}`,
      autor: portador.nombre,
      equipo: portador.equipo
    });

    // Reiniciar
    estado.pelota = { ...PELOTA_INICIAL };
    estado.posesionId = null;
  } else {
    // Tiro desviado o atajada
    estado.estadisticas[esLocal ? 'tirosAlArcoLocal' : 'tirosAlArcoVisitante']++;
    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'TIRO',
      descripcion: `Tiro de ${portador.nombre}`,
      autor: portador.nombre,
      equipo: portador.equipo
    });

    perderPosesion(estado);
  }
}

// ============ AVANZAR CON PELOTA ============
function avanzarConPelota(estado, portador) {
  const esLocal = portador.equipo === 'local';
  const arcoRival = esLocal ? ARCO_VISITANTE : ARCO_LOCAL;

  const dx = arcoRival.x - estado.pelota.x;
  const dy = arcoRival.y - estado.pelota.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);

  if (distancia > 0) {
    const velocidad = VELOCIDAD_PELOTA;
    estado.pelota.x += (dx / distancia) * velocidad;
    estado.pelota.y += (dy / distancia) * velocidad;
  }
}

// ============ DETECTAR DUELOS ============
function detectarDuelos(estado) {
  if (!estado.posesionId) return;

  const portador = estado.jugadoresEnCancha.find(j => j.id === estado.posesionId);
  const equipoRival = portador.equipo === 'local' ? 'visitante' : 'local';

  const defensores = estado.jugadoresEnCancha.filter(
    j => j.equipo === equipoRival && calcularDistancia(j.x, j.y, portador.x, portador.y) < DISTANCIA_DUELO
  );

  defensores.forEach(defensor => {
    const efectividadAtaque = portador.velocidad + portador.pase;
    const efectividadDefensa = defensor.defensa;
    const probabilidadPierdeBalon = efectividadDefensa * (1 - efectividadAtaque * 0.4);

    if (Math.random() < probabilidadPierdeBalon) {
      estado.eventos.push({
        minuto: estado.minuto,
        tipo: 'INTERCEPCION',
        descripcion: `Intercepción de ${defensor.nombre}`,
        autor: defensor.nombre,
        equipo: defensor.equipo
      });

      estado.posesionId = defensor.id;
      estado.pelota.x = defensor.x;
      estado.pelota.y = defensor.y;
    }
  });
}

// ============ DETECTAR GOLES ============
function detectarGoles(estado) {
  const distanciaArcoLocal = calcularDistancia(estado.pelota.x, estado.pelota.y, ARCO_LOCAL.x, ARCO_LOCAL.y);
  const distanciaArcoVisitante = calcularDistancia(estado.pelota.x, estado.pelota.y, ARCO_VISITANTE.x, ARCO_VISITANTE.y);

  // Gol en portería local
  if (distanciaArcoLocal < ARCO_LOCAL.radio && estado.pelota.x < 5) {
    estado.golesVisitante++;
    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'GOL',
      descripcion: 'GOL del visitante',
      equipo: 'visitante'
    });
    estado.pelota = { ...PELOTA_INICIAL };
    estado.posesionId = null;
  }

  // Gol en portería visitante
  if (distanciaArcoVisitante < ARCO_VISITANTE.radio && estado.pelota.x > 95) {
    estado.golesLocal++;
    estado.eventos.push({
      minuto: estado.minuto,
      tipo: 'GOL',
      descripcion: 'GOL del local',
      equipo: 'local'
    });
    estado.pelota = { ...PELOTA_INICIAL };
    estado.posesionId = null;
  }
}

// ============ ACTUALIZAR ESTADÍSTICAS ============
function actualizarEstadisticas(estado) {
  if (estado.posesionId) {
    const portador = estado.jugadoresEnCancha.find(j => j.id === estado.posesionId);
    if (portador.equipo === 'local') {
      estado.estadisticas.posesionLocal++;
    } else {
      estado.estadisticas.posesionVisitante++;
    }
  }
}

// ============ PERDER POSESIÓN ============
function perderPosesion(estado) {
  estado.posesionId = null;
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
  const estado = crearEstadoPartido(equipoLocal, equipoVisitante, '4-4-2');

  while (estado.tick < TOTAL_TICKS) {
    simularTick(estado);
  }

  return {
    golesLocal: estado.golesLocal,
    golesVisitante: estado.golesVisitante,
    eventos: estado.eventos,
    estadisticas: estado.estadisticas
  };
}

// ============ EXPORTAR ============
export {
  crearEstadoPartido,
  simularTick,
  CANCHA,
  ARCO_LOCAL,
  ARCO_VISITANTE,
  TICKS_POR_MINUTO,
  TOTAL_TICKS
};
