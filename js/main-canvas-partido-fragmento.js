// FRAGMENTOS A AGREGAR A js/main.js

// ============ IMPORTAR AL INICIO ============
// import { crearEstadoPartido, simularTick, CANCHA, ARCO_LOCAL, ARCO_VISITANTE, TICKS_POR_MINUTO } from './engine/MotorPartido-final.js';

// ============ VARIABLES GLOBALES DEL PARTIDO ============
let estadoPartidoActual = null;
let partidoEnCurso = false;
let partidoPausado = false;
let velocidadPartido = 1; // 1x o 2x
let animationFrameId = null;
let ultimoEventoProcesado = 0;

// Escalas de conversión Canvas
const ESCALA_CANVAS_X = 1000 / 100; // Canvas ancho / mapa ancho
const ESCALA_CANVAS_Y = 600 / 60;   // Canvas alto / mapa alto

// ============ INICIAR PARTIDO INTERACTIVO ============
function iniciarPartidoInteractivo() {
  const equipoLocal = window.equipoUsuario || window.equipoActual;
  const equipoVisitante = window.equipoRival || crearEquipoRivalSimulado();

  if (!equipoLocal || !equipoVisitante) {
    log('Error: Equipos no disponibles para iniciar partido', 'error');
    return;
  }

  // Crear estado del partido
  estadoPartidoActual = crearEstadoPartido(equipoLocal, equipoVisitante, '4-4-2');
  partidoEnCurso = true;
  partidoPausado = false;
  ultimoEventoProcesado = 0;

  // Actualizar UI
  document.getElementById('equipo-local-titulo').textContent = equipoLocal.nombre;
  document.getElementById('equipo-visitante-titulo').textContent = equipoVisitante.nombre;

  // Actualizar botones
  document.getElementById('btn-comenzar-partido').disabled = true;
  document.getElementById('btn-pausar-tactica').disabled = false;
  document.getElementById('btn-reanudar-partido').disabled = true;

  log(`⚽ Partido iniciado: ${equipoLocal.nombre} vs ${equipoVisitante.nombre}`, 'info');

  // Iniciar bucle de renderizado
  iniciarBucleRenderizado();
}

// ============ BUCLE DE RENDERIZADO CON requestAnimationFrame ============
function iniciarBucleRenderizado() {
  function frame() {
    if (partidoEnCurso && !partidoPausado) {
      // Procesar ticks de simulación según velocidad
      const ticksAProcesar = velocidadPartido;
      for (let i = 0; i < ticksAProcesar; i++) {
        if (estadoPartidoActual.tick < 5400) { // 90 minutos * 60 ticks
          simularTick(estadoPartidoActual);
        } else {
          finalizarPartido();
          break;
        }
      }

      // Procesar eventos nuevos
      procesarEventosNuevos(estadoPartidoActual);
    }

    // Renderizar estado actual
    renderizarCampo(estadoPartidoActual);
    actualizarUIPartido(estadoPartidoActual);

    // Continuar bucle
    if (partidoEnCurso) {
      animationFrameId = requestAnimationFrame(frame);
    }
  }

  animationFrameId = requestAnimationFrame(frame);
}

// ============ RENDERIZAR CAMPO EN CANVAS ============
function renderizarCampo(estado) {
  const canvas = document.getElementById('canvas-campo');
  if (!canvas || !estado) return;

  const ctx = canvas.getContext('2d');
  const ancho = canvas.width;
  const alto = canvas.height;

  // Limpiar lienzo
  ctx.fillStyle = '#2d5016'; // Verde de cancha
  ctx.fillRect(0, 0, ancho, alto);

  // Dibujar líneas de la cancha
  dibujarLineasCancha(ctx, ancho, alto);

  // Dibujar jugadores
  dibujarJugadores(ctx, estado.jugadoresEnCancha);

  // Dibujar pelota
  dibujarPelota(ctx, estado.pelota);

  // Dibujar indicador de posesión
  if (estado.posesionId) {
    dibujarIndicadorPosesion(ctx, estado);
  }
}

// ============ DIBUJAR LÍNEAS DE LA CANCHA ============
function dibujarLineasCancha(ctx, ancho, alto) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Línea de medio campo
  ctx.beginPath();
  ctx.moveTo(ancho / 2, 0);
  ctx.lineTo(ancho / 2, alto);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(ancho / 2, alto / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ancho / 2, alto / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Áreas de penalti (local)
  ctx.strokeRect(0, alto / 2 - 90, 160, 180);
  ctx.strokeRect(0, alto / 2 - 60, 40, 120);

  // Áreas de penalti (visitante)
  ctx.strokeRect(ancho - 160, alto / 2 - 90, 160, 180);
  ctx.strokeRect(ancho - 40, alto / 2 - 60, 40, 120);

  // Líneas de banda
  ctx.strokeRect(0, 0, ancho, alto);
}

// ============ DIBUJAR JUGADORES ============
function dibujarJugadores(ctx, jugadores) {
  jugadores.forEach(jugador => {
    const x = jugador.x * ESCALA_CANVAS_X;
    const y = jugador.y * ESCALA_CANVAS_Y;
    const radio = 12;

    // Color según equipo
    ctx.fillStyle = jugador.equipo === 'local' ? '#0066cc' : '#ff3333';
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fill();

    // Borde blanco
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nombre o inicial del jugador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const inicial = jugador.nombre.charAt(0).toUpperCase();
    ctx.fillText(inicial, x, y);

    // Nombre del jugador arriba
    ctx.font = '9px Arial';
    ctx.fillStyle = jugador.equipo === 'local' ? '#0066cc' : '#ff3333';
    const apellido = jugador.nombre.split(' ').pop();
    ctx.fillText(apellido.substring(0, 8), x, y - 22);
  });
}

// ============ DIBUJAR PELOTA ============
function dibujarPelota(ctx, pelota) {
  const x = pelota.x * ESCALA_CANVAS_X;
  const y = pelota.y * ESCALA_CANVAS_Y;
  const radio = 6;

  // Sombra
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.arc(x, y + 2, radio, 0, Math.PI * 2);
  ctx.fill();

  // Pelota blanca
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fill();

  // Brillo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Borde
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ============ DIBUJAR INDICADOR DE POSESIÓN ============
function dibujarIndicadorPosesion(ctx, estado) {
  const jugador = estado.jugadoresEnCancha.find(j => j.id === estado.posesionId);
  if (!jugador) return;

  const x = jugador.x * ESCALA_CANVAS_X;
  const y = jugador.y * ESCALA_CANVAS_Y;

  // Anillo pulsante
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.stroke();
}

// ============ ACTUALIZAR UI DEL PARTIDO ============
function actualizarUIPartido(estado) {
  if (!estado) return;

  // Minuto y segundo
  const minuto = Math.floor(estado.tick / TICKS_POR_MINUTO);
  const segundo = Math.floor((estado.tick % TICKS_POR_MINUTO) * (60 / TICKS_POR_MINUTO));
  document.getElementById('minuto-actual').textContent = `${minuto}:${segundo.toString().padStart(2, '0')}`;

  // Marcador
  document.getElementById('marcador-actual').textContent = `${estado.golesLocal} - ${estado.golesVisitante}`;
  document.getElementById('goles-local-display').textContent = estado.golesLocal;
  document.getElementById('goles-visitante-display').textContent = estado.golesVisitante;

  // Posesión
  const totalPosesion = estado.estadisticas.posesionLocal + estado.estadisticas.posesionVisitante;
  const posesionLocalPct = totalPosesion > 0 ? Math.round((estado.estadisticas.posesionLocal / totalPosesion) * 100) : 50;
  const posesionVisitantePct = 100 - posesionLocalPct;

  document.getElementById('posesion-local-display').textContent = posesionLocalPct;
  document.getElementById('posesion-visitante-display').textContent = posesionVisitantePct;

  // Tiros
  document.getElementById('tiros-local-display').textContent = estado.estadisticas.tirosLocal;
  document.getElementById('tiros-visitante-display').textContent = estado.estadisticas.tirosVisitante;
}

// ============ PROCESAR EVENTOS NUEVOS ============
function procesarEventosNuevos(estado) {
  const eventosNuevos = estado.eventos.slice(ultimoEventoProcesado);

  eventosNuevos.forEach(evento => {
    const logContainer = document.getElementById('log-relato');
    if (!logContainer) return;

    const eventoDiv = document.createElement('div');
    eventoDiv.className = `evento-relato ${evento.tipo.toLowerCase()}`;

    const minutoFormato = Math.floor(evento.minuto);
    eventoDiv.innerHTML = `<span class="evento-minuto">[${minutoFormato}'</span>] ${evento.descripcion}`;

    logContainer.appendChild(eventoDiv);
    logContainer.scrollTop = logContainer.scrollHeight;
  });

  ultimoEventoProcesado = estado.eventos.length;
}

// ============ PAUSAR TÁCTICA ============
function pausarTactica() {
  partidoPausado = true;
  document.getElementById('btn-pausar-tactica').disabled = true;
  document.getElementById('btn-reanudar-partido').disabled = false;
  log('⏸ Partido pausado - Realiza cambios en tu plantilla', 'warning');
}

// ============ REANUDAR PARTIDO ============
function reanudarPartido() {
  // Actualizar jugadores en el campo si hubo cambios
  if (window.equipoUsuario && estadoPartidoActual) {
    actualizarJugadoresEnCancha(estadoPartidoActual, window.equipoUsuario);
  }

  partidoPausado = false;
  document.getElementById('btn-pausar-tactica').disabled = false;
  document.getElementById('btn-reanudar-partido').disabled = true;
  log('▶ Partido reanudado', 'success');
}

// ============ ACTUALIZAR JUGADORES EN CANCHA (CAMBIOS TÁCTICOS) ============
function actualizarJugadoresEnCancha(estado, equipoLocal) {
  const alineacionActual = equipoLocal.alineacionTitular || equipoLocal.plantel.slice(0, 11);

  // Actualizar jugadores locales
  estado.jugadoresEnCancha.forEach(jugador => {
    if (jugador.equipo === 'local') {
      const jugadorActualizado = alineacionActual.find(j => j.id === jugador.id);
      if (!jugadorActualizado) {
        // Jugador fue sacado, reemplazar con nuevo
        const nuevoJugador = alineacionActual.find(j => !estado.jugadoresEnCancha.some(jc => jc.id === j.id && jc.equipo === 'local'));
        if (nuevoJugador) {
          jugador.id = nuevoJugador.id;
          jugador.nombre = nuevoJugador.nombre;
          jugador.velocidad = (nuevoJugador.atributos?.velocidad || 70) / 100;
          jugador.remate = (nuevoJugador.atributos?.remate || 70) / 100;
          jugador.pase = (nuevoJugador.atributos?.pase || 70) / 100;
          jugador.defensa = (nuevoJugador.atributos?.defensa || 70) / 100;
          jugador.fisico = (nuevoJugador.atributos?.fisico || 70) / 100;
        }
      }
    }
  });
}

// ============ FINALIZAR PARTIDO ============
function finalizarPartido() {
  partidoEnCurso = false;
  cancelAnimationFrame(animationFrameId);

  const resultado = estadoPartidoActual.golesLocal > estadoPartidoActual.golesVisitante ? 'Victoria 🎉' :
                    estadoPartidoActual.golesLocal < estadoPartidoActual.golesVisitante ? 'Derrota 😢' : 'Empate 🤝';

  log(`🏁 Partido finalizado: ${estadoPartidoActual.golesLocal} - ${estadoPartidoActual.golesVisitante} (${resultado})`, 'success');

  // Actualizar botones
  document.getElementById('btn-comenzar-partido').disabled = false;
  document.getElementById('btn-pausar-tactica').disabled = true;
  document.getElementById('btn-reanudar-partido').disabled = true;
}

// ============ CAMBIAR VELOCIDAD ============
function cambiarVelocidad(velocidad) {
  velocidadPartido = velocidad;

  // Actualizar botones activos
  document.getElementById('btn-velocidad-1x').classList.toggle('active', velocidad === 1);
  document.getElementById('btn-velocidad-2x').classList.toggle('active', velocidad === 2);

  log(`⚡ Velocidad: ${velocidad}x`, 'info');
}

// ============ CREAR EQUIPO RIVAL SIMULADO ============
function crearEquipoRivalSimulado() {
  return {
    id: 'rival_' + Math.random().toString(36).substr(2, 9),
    nombre: 'Equipo Rival',
    presupuesto: 100,
    estadio: 'Estadio Rival',
    reputacion: 70,
    plantel: Array(11).fill(null).map((_, i) => ({
      id: 'rival_' + i,
      nombre: `Jugador Rival ${i + 1}`,
      posicion: i === 0 ? 'POR' : i < 5 ? 'DEF' : i < 9 ? 'MED' : 'DEL',
      atributos: {
        velocidad: Math.random() * 30 + 60,
        remate: Math.random() * 30 + 60,
        pase: Math.random() * 30 + 60,
        defensa: Math.random() * 30 + 60,
        fisico: Math.random() * 30 + 60
      },
      edad: Math.floor(Math.random() * 15) + 20,
      sueldo: Math.random() * 5 + 1,
      calcularPromedio: function() {
        return (this.atributos.velocidad + this.atributos.remate + this.atributos.pase + 
                this.atributos.defensa + this.atributos.fisico) / 5;
      }
    })),
    alineacionTitular: null,
    ratingEquipo: function() { return 70; }
  };
}

// ============ AGREGAR EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
  const btnComenzar = document.getElementById('btn-comenzar-partido');
  const btnPausar = document.getElementById('btn-pausar-tactica');
  const btnReanudar = document.getElementById('btn-reanudar-partido');
  const btnVelocidad1x = document.getElementById('btn-velocidad-1x');
  const btnVelocidad2x = document.getElementById('btn-velocidad-2x');

  if (btnComenzar) btnComenzar.addEventListener('click', iniciarPartidoInteractivo);
  if (btnPausar) btnPausar.addEventListener('click', pausarTactica);
  if (btnReanudar) btnReanudar.addEventListener('click', reanudarPartido);
  if (btnVelocidad1x) btnVelocidad1x.addEventListener('click', () => cambiarVelocidad(1));
  if (btnVelocidad2x) btnVelocidad2x.addEventListener('click', () => cambiarVelocidad(2));
});

// ============ FUNCIÓN LOG (si no existe) ============
// function log(mensaje, tipo = 'info') {
//   console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
// }
