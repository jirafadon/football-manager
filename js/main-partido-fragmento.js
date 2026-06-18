// FRAGMENTOS A AGREGAR A js/main.js

// ============ IMPORTAR AL INICIO ============
// import { crearEstadoPartido, simularPasoTick, DIMENSIONES_CANCHA, PORTERIA_LOCAL, PORTERIA_VISITANTE } from './engine/MotorPartido-v2.js';

// ============ VARIABLES GLOBALES DEL PARTIDO ============
let estadoPartido = null;
let partidoEnCurso = false;
let partidoPausado = false;
let velocidadPartido = 1; // 1x o 2x
let animationFrameId = null;
let ticksAcumulados = 0;
const TICKS_POR_FRAME = 1; // Ticks a procesar por frame

// Escalas de conversión
const ESCALA_X = 1000 / 100; // Canvas ancho / mapa ancho
const ESCALA_Y = 600 / 60;   // Canvas alto / mapa alto

// ============ INICIALIZAR PARTIDO ============
function inicializarPartido() {
  const equipoLocal = window.equipoActual;
  const equipoVisitante = window.equipoRival || crearEquipoRival();
  
  if (!equipoLocal || !equipoVisitante) {
    log('Error: Equipos no disponibles', 'error');
    return;
  }

  estadoPartido = crearEstadoPartido(equipoLocal, equipoVisitante, '4-4-2', '4-4-2');
  partidoEnCurso = true;
  partidoPausado = false;
  ticksAcumulados = 0;

  // Actualizar UI
  document.getElementById('equipo-local-nombre').textContent = equipoLocal.nombre;
  document.getElementById('equipo-visitante-nombre').textContent = equipoVisitante.nombre;
  
  // Actualizar botones
  document.getElementById('btn-iniciar-partido').disabled = true;
  document.getElementById('btn-pausar-partido').disabled = false;
  document.getElementById('btn-reanudar-partido').disabled = true;

  log(`Partido iniciado: ${equipoLocal.nombre} vs ${equipoVisitante.nombre}`, 'info');

  // Iniciar bucle de renderizado
  iniciarBucleRenderizado();
}

// ============ BUCLE DE RENDERIZADO CON requestAnimationFrame ============
function iniciarBucleRenderizado() {
  function frame() {
    if (partidoEnCurso && !partidoPausado) {
      // Procesar ticks de simulación
      for (let i = 0; i < TICKS_POR_FRAME * velocidadPartido; i++) {
        if (estadoPartido.tick < 5400) { // 90 minutos * 60 ticks
          simularPasoTick(estadoPartido);
          procesarEventosNuevos(estadoPartido);
        } else {
          finalizarPartido();
          break;
        }
      }
    }

    // Renderizar estado actual
    renderizarCampo(estadoPartido);
    actualizarUIPartido(estadoPartido);

    // Continuar bucle
    if (partidoEnCurso) {
      animationFrameId = requestAnimationFrame(frame);
    }
  }

  animationFrameId = requestAnimationFrame(frame);
}

// ============ RENDERIZAR CAMPO EN CANVAS ============
function renderizarCampo(estado) {
  const canvas = document.getElementById('campo-juego');
  if (!canvas || !estado) return;

  const ctx = canvas.getContext('2d');
  const ancho = canvas.width;
  const alto = canvas.height;

  // Limpiar lienzo
  ctx.fillStyle = '#2d5016'; // Verde de cancha
  ctx.fillRect(0, 0, ancho, alto);

  // Dibujar líneas de la cancha
  dibujarCancha(ctx, ancho, alto);

  // Dibujar pelota
  dibujarPelota(ctx, estado.pelota);

  // Dibujar jugadores
  dibujarJugadores(ctx, estado.jugadores);

  // Dibujar indicador de posesión
  if (estado.posesion) {
    dibujarIndicadorPosesion(ctx, estado);
  }
}

// ============ DIBUJAR CANCHA ============
function dibujarCancha(ctx, ancho, alto) {
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

  // Áreas de penalti
  ctx.strokeRect(0, alto / 2 - 90, 160, 180); // Local
  ctx.strokeRect(ancho - 160, alto / 2 - 90, 160, 180); // Visitante

  // Áreas de meta
  ctx.strokeRect(0, alto / 2 - 60, 40, 120); // Local
  ctx.strokeRect(ancho - 40, alto / 2 - 60, 40, 120); // Visitante
}

// ============ DIBUJAR PELOTA ============
function dibujarPelota(ctx, pelota) {
  const x = pelota.x * ESCALA_X;
  const y = pelota.y * ESCALA_Y;
  const radio = 5;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fill();

  // Brillo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ============ DIBUJAR JUGADORES ============
function dibujarJugadores(ctx, jugadores) {
  jugadores.forEach(jugador => {
    const x = jugador.x * ESCALA_X;
    const y = jugador.y * ESCALA_Y;
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

    // Número o nombre del jugador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Mostrar número de dorsal o inicial del nombre
    const etiqueta = jugador.nombre.charAt(0).toUpperCase();
    ctx.fillText(etiqueta, x, y);

    // Mostrar nombre arriba del círculo
    ctx.font = '9px Arial';
    ctx.fillStyle = jugador.equipo === 'local' ? '#0066cc' : '#ff3333';
    ctx.fillText(jugador.nombre.split(' ')[0], x, y - 20);
  });
}

// ============ DIBUJAR INDICADOR DE POSESIÓN ============
function dibujarIndicadorPosesion(ctx, estado) {
  const jugador = estado.jugadores.find(j => j.id === estado.posesion);
  if (!jugador) return;

  const x = jugador.x * ESCALA_X;
  const y = jugador.y * ESCALA_Y;

  // Anillo pulsante alrededor del jugador
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.stroke();
}

// ============ ACTUALIZAR UI DEL PARTIDO ============
function actualizarUIPartido(estado) {
  if (!estado) return;

  // Minuto
  const minuto = Math.floor(estado.tick / 60);
  const segundo = estado.tick % 60;
  document.getElementById('minuto-partido').textContent = `${minuto}:${segundo.toString().padStart(2, '0')}`;

  // Marcador
  document.getElementById('marcador-partido').textContent = `${estado.golesLocal} - ${estado.golesVisitante}`;
  document.getElementById('goles-local').textContent = estado.golesLocal;
  document.getElementById('goles-visitante').textContent = estado.golesVisitante;

  // Posesión (aproximada)
  const totalPosesion = estado.posesionLocal + estado.posesionVisitante;
  const posesionLocalPct = totalPosesion > 0 ? Math.round((estado.posesionLocal / totalPosesion) * 100) : 50;
  const posesionVisitantePct = 100 - posesionLocalPct;
  
  document.getElementById('posesion-local').textContent = posesionLocalPct;
  document.getElementById('posesion-visitante').textContent = posesionVisitantePct;

  // Tiros
  document.getElementById('tiros-local').textContent = estado.tiros.local;
  document.getElementById('tiros-visitante').textContent = estado.tiros.visitante;
}

// ============ PROCESAR EVENTOS NUEVOS ============
let ultimoEventoProcesado = 0;

function procesarEventosNuevos(estado) {
  const eventosNuevos = estado.eventos.slice(ultimoEventoProcesado);
  
  eventosNuevos.forEach(evento => {
    const logContainer = document.getElementById('log-eventos');
    if (!logContainer) return;

    const eventoDiv = document.createElement('div');
    eventoDiv.className = `evento-log ${evento.tipo.toLowerCase()}`;
    
    const minutoFormato = `${Math.floor(evento.minuto)}:${(evento.minuto % 1 * 60).toString().padStart(2, '0')}`;
    eventoDiv.innerHTML = `<span class="evento-minuto">[${minutoFormato}]</span> ${evento.descripcion}`;
    
    logContainer.appendChild(eventoDiv);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Mostrar en consola también
    log(evento.descripcion, evento.tipo.toLowerCase());
  });

  ultimoEventoProcesado = estado.eventos.length;
}

// ============ PAUSAR PARTIDO ============
function pausarPartido() {
  partidoPausado = true;
  document.getElementById('btn-pausar-partido').disabled = true;
  document.getElementById('btn-reanudar-partido').disabled = false;
  log('Partido pausado', 'info');
}

// ============ REANUDAR PARTIDO ============
function reanudarPartido() {
  partidoPausado = false;
  document.getElementById('btn-pausar-partido').disabled = false;
  document.getElementById('btn-reanudar-partido').disabled = true;
  log('Partido reanudado', 'info');
}

// ============ FINALIZAR PARTIDO ============
function finalizarPartido() {
  partidoEnCurso = false;
  cancelAnimationFrame(animationFrameId);

  const resultado = estadoPartido.golesLocal > estadoPartido.golesVisitante ? 'Victoria' :
                    estadoPartido.golesLocal < estadoPartido.golesVisitante ? 'Derrota' : 'Empate';

  log(`Partido finalizado: ${estadoPartido.golesLocal} - ${estadoPartido.golesVisitante} (${resultado})`, 'success');

  // Actualizar botones
  document.getElementById('btn-iniciar-partido').disabled = false;
  document.getElementById('btn-pausar-partido').disabled = true;
  document.getElementById('btn-reanudar-partido').disabled = true;
}

// ============ CAMBIAR VELOCIDAD ============
function cambiarVelocidad(velocidad) {
  velocidadPartido = velocidad;

  // Actualizar botones activos
  document.getElementById('btn-velocidad-1x').classList.toggle('active', velocidad === 1);
  document.getElementById('btn-velocidad-2x').classList.toggle('active', velocidad === 2);

  log(`Velocidad: ${velocidad}x`, 'info');
}

// ============ CREAR EQUIPO RIVAL (SIMULADO) ============
function crearEquipoRival() {
  return {
    id: 'rival_' + Math.random(),
    nombre: 'Equipo Rival',
    presupuesto: 100,
    estadio: 'Estadio Rival',
    reputacion: 70,
    plantel: Array(11).fill(null).map((_, i) => ({
      id: 'rival_' + i,
      nombre: `Jugador Rival ${i + 1}`,
      posicion: i === 0 ? 'ARQ' : i < 5 ? 'DEF' : i < 9 ? 'MED' : 'DEL',
      atributos: {
        velocidad: Math.random() * 50 + 50,
        remate: Math.random() * 50 + 50,
        pase: Math.random() * 50 + 50,
        defensa: Math.random() * 50 + 50,
        fisico: Math.random() * 50 + 50
      },
      edad: Math.random() * 15 + 20,
      sueldo: Math.random() * 5 + 1
    })),
    alineacionTitular: null,
    ratingEquipo: function() { return 70; }
  };
}

// ============ AGREGAR EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
  const btnIniciar = document.getElementById('btn-iniciar-partido');
  const btnPausar = document.getElementById('btn-pausar-partido');
  const btnReanudar = document.getElementById('btn-reanudar-partido');
  const btnVelocidad1x = document.getElementById('btn-velocidad-1x');
  const btnVelocidad2x = document.getElementById('btn-velocidad-2x');

  if (btnIniciar) btnIniciar.addEventListener('click', inicializarPartido);
  if (btnPausar) btnPausar.addEventListener('click', pausarPartido);
  if (btnReanudar) btnReanudar.addEventListener('click', reanudarPartido);
  if (btnVelocidad1x) btnVelocidad1x.addEventListener('click', () => cambiarVelocidad(1));
  if (btnVelocidad2x) btnVelocidad2x.addEventListener('click', () => cambiarVelocidad(2));
});

// ============ FUNCIÓN LOG (si no existe) ============
// function log(mensaje, tipo = 'info') {
//   console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
// }
