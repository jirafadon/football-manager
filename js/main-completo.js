/**
 * main.js - Ciclo de Juego Continuo por Fechas
 * Unifica todos los módulos: Liga, Equipo, Jugador, MotorPartido, Mercado, Persistencia
 */

// ============ IMPORTAR MÓDULOS ============
import { guardarPartida, cargarPartida, existePartida } from './data/Persistencia.js';
import GameStateMachine, { GAME_STATES } from './core/GameStateMachine.js';
import { crearEstadoPartido, simularTick, TICKS_POR_MINUTO } from './engine/MotorPartido-final.js';
import { generarJugadoresLibres, procesarMercadoRival } from './market/MercadoPases.js';
import { procesarFinTemporada, validarDisponibilidadPartido } from './lib/models/Jugador-extensiones.js';

// ============ VARIABLES GLOBALES ============
let gameState = null;
let equipoUsuario = null;
let ligaActual = null;
let mercadoActual = null;
let estadoPartidoActual = null;
let partidoEnCurso = false;
let partidoPausado = false;
let velocidadPartido = 1;
let animationFrameId = null;
let ultimoEventoProcesado = 0;

const ESCALA_CANVAS_X = 1000 / 100;
const ESCALA_CANVAS_Y = 600 / 60;

// ============ INICIALIZAR JUEGO ============
async function inicializarJuego() {
  console.log('[INIT] Iniciando juego...');

  // Intentar cargar partida guardada
  const datosGuardados = cargarPartida();

  if (datosGuardados) {
    console.log('[INIT] Partida guardada encontrada');
    ligaActual = datosGuardados.liga;
    equipoUsuario = ligaActual.equipos.find(e => e.id === datosGuardados.idEquipoUsuario);
    log('✓ Partida cargada exitosamente', 'success');
  } else {
    console.log('[INIT] Creando nueva partida');
    // Crear nueva partida
    equipoUsuario = crearEquipoUsuario();
    const equiposRivales = generarEquiposRivales(19);
    ligaActual = new Liga('Temporada 2026', [equipoUsuario, ...equiposRivales]);
    log('✓ Nueva partida iniciada', 'success');
  }

  // Inicializar mercado
  mercadoActual = {
    poolJugadoresLibres: generarJugadoresLibres(20),
    procesarMercadoRival
  };

  // Crear State Machine
  gameState = new GameStateMachine(equipoUsuario, ligaActual, mercadoActual);
  configurarEventosGameState();

  // Renderizar UI inicial
  renderizarMenuPrincipal();
}

// ============ CONFIGURAR EVENTOS DE GAME STATE ============
function configurarEventosGameState() {
  gameState.on('iniciarPartidoUsuario', () => {
    ocultarPaneles();
    renderizarPantallaPartido();
    iniciarPartidoInteractivo();
  });

  gameState.on('postPartidoProcesado', (datos) => {
    renderizarPantallaPostPartido(datos);
    guardarPartida(ligaActual, equipoUsuario.id);
  });

  gameState.on('volverAlMenu', () => {
    renderizarMenuPrincipal();
  });

  gameState.on('finTemporada', () => {
    renderizarFinTemporada();
  });
}

// ============ RENDERIZAR MENÚ PRINCIPAL ============
function renderizarMenuPrincipal() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const infoFecha = gameState.obtenerInfoFecha();
  const datosEquipo = gameState.obtenerDatosEquipo();
  const tabla = gameState.obtenerTablaActualizada();
  const posicion = tabla.findIndex(e => e.id === equipoUsuario.id) + 1;

  mainContent.innerHTML = `
    <div class="menu-principal">
      <div class="header-info">
        <div class="info-equipo">
          <h2>${datosEquipo.nombre}</h2>
          <p>💰 Presupuesto: $${datosEquipo.presupuesto.toFixed(1)}M</p>
          <p>📊 Rating: ${datosEquipo.rating.toFixed(1)}</p>
          <p>🏆 Posición: ${posicion}º</p>
        </div>

        <div class="info-fecha">
          <h3>📅 Fecha ${infoFecha.fechaActual} / ${infoFecha.totalFechas}</h3>
          ${infoFecha.proximoPartido ? `
            <p>${infoFecha.proximoPartido.local.nombre} vs ${infoFecha.proximoPartido.visitante.nombre}</p>
          ` : '<p>⚠️ Temporada finalizada</p>'}
        </div>
      </div>

      <div class="menu-opciones">
        <button class="btn btn-primary" onclick="abrirGestionPlantilla()">
          👥 Gestionar Plantilla
        </button>
        <button class="btn btn-secondary" onclick="abrirMercado()">
          💰 Mercado de Pases
        </button>
        <button class="btn btn-success" onclick="iniciarFecha()" ${infoFecha.proximoPartido ? '' : 'disabled'}>
          ⚽ Avanzar Fecha
        </button>
      </div>

      <div class="tabla-posiciones">
        <h3>Tabla de Posiciones</h3>
        ${renderizarTablaCompacta(tabla)}
      </div>
    </div>
  `;

  mostrarPaneles();
}

// ============ RENDERIZAR TABLA COMPACTA ============
function renderizarTablaCompacta(tabla) {
  return `
    <table class="tabla-compacta">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Equipo</th>
          <th>PJ</th>
          <th>Pts</th>
          <th>GF</th>
          <th>GC</th>
          <th>DG</th>
        </tr>
      </thead>
      <tbody>
        ${tabla.slice(0, 10).map((equipo, idx) => `
          <tr class="${equipo.id === equipoUsuario.id ? 'fila-usuario' : ''}">
            <td>${idx + 1}</td>
            <td>${equipo.nombre}</td>
            <td>${equipo.PJ || 0}</td>
            <td><strong>${equipo.puntos || 0}</strong></td>
            <td>${equipo.GF || 0}</td>
            <td>${equipo.GC || 0}</td>
            <td>${(equipo.GF || 0) - (equipo.GC || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ============ ABRIR GESTIÓN DE PLANTILLA ============
function abrirGestionPlantilla() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const alineacion = equipoUsuario.alineacionTitular || [];
  const banco = equipoUsuario.plantel.filter(j => !alineacion.some(t => t.id === j.id));

  mainContent.innerHTML = `
    <div class="gestion-plantilla">
      <div class="gestion-header">
        <h2>👥 Gestión de Plantilla</h2>
        <button class="btn btn-secondary" onclick="volverAlMenu()">Volver</button>
      </div>

      <div class="gestion-contenido">
        <div class="seccion-alineacion">
          <h3>Alineación Titular (${alineacion.length}/11)</h3>
          <div class="grid-alineacion">
            ${alineacion.map(j => renderizarJugadorCard(j, true)).join('')}
          </div>
        </div>

        <div class="seccion-banco">
          <h3>Banco de Suplentes</h3>
          <div class="grid-banco">
            ${banco.map(j => renderizarJugadorCard(j, false)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ RENDERIZAR TARJETA DE JUGADOR ============
function renderizarJugadorCard(jugador, esTitular) {
  const disponibilidad = validarDisponibilidadPartido(jugador);
  const overall = jugador.calcularPromedio ? jugador.calcularPromedio() : 70;

  let badgeHTML = '';
  if (jugador.lesionado) {
    badgeHTML += `<span class="badge badge-lesion">🏥 ${jugador.semanasLesion}s</span>`;
  }
  if (jugador.suspendido) {
    badgeHTML += `<span class="badge badge-suspension">⛔ Suspendido</span>`;
  }

  return `
    <div class="jugador-card ${esTitular ? 'titular' : 'suplente'}">
      <div class="jugador-nombre">${jugador.nombre}</div>
      <div class="jugador-posicion">${jugador.posicion}</div>
      <div class="jugador-overall">${overall.toFixed(1)}</div>
      ${badgeHTML}
      <button 
        onclick="alternarAlineacion('${jugador.id}')"
        ${!disponibilidad.disponible ? 'disabled' : ''}
        class="btn-accion"
      >
        ${esTitular ? 'Remover' : 'Alinear'}
      </button>
    </div>
  `;
}

// ============ ALTERNAR ALINEACIÓN ============
function alternarAlineacion(jugadorId) {
  const jugador = equipoUsuario.plantel.find(j => j.id === jugadorId);
  if (!jugador) return;

  const disponibilidad = validarDisponibilidadPartido(jugador);
  if (!disponibilidad.disponible) {
    log(`❌ ${jugador.nombre}: ${disponibilidad.razon}`, 'error');
    return;
  }

  const esTitular = equipoUsuario.alineacionTitular.some(j => j.id === jugadorId);

  if (esTitular) {
    equipoUsuario.alineacionTitular = equipoUsuario.alineacionTitular.filter(j => j.id !== jugadorId);
    log(`✓ ${jugador.nombre} removido de titulares`, 'info');
  } else {
    if (equipoUsuario.alineacionTitular.length >= 11) {
      log('❌ Ya tienes 11 titulares', 'warning');
      return;
    }
    equipoUsuario.alineacionTitular.push(jugador);
    log(`✓ ${jugador.nombre} agregado a titulares`, 'success');
  }

  abrirGestionPlantilla();
}

// ============ ABRIR MERCADO ============
function abrirMercado() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const libres = mercadoActual.poolJugadoresLibres || [];

  mainContent.innerHTML = `
    <div class="mercado-pases">
      <div class="mercado-header">
        <h2>💰 Mercado de Pases</h2>
        <button class="btn btn-secondary" onclick="volverAlMenu()">Volver</button>
      </div>

      <div class="mercado-contenido">
        <h3>Jugadores Libres (${libres.length})</h3>
        <div class="grid-libres">
          ${libres.map(j => `
            <div class="jugador-libre">
              <div class="nombre">${j.nombre}</div>
              <div class="posicion">${j.posicion}</div>
              <div class="overall">${j.calcularPromedio ? j.calcularPromedio().toFixed(1) : 70}</div>
              <div class="sueldo">$${j.sueldo}M/sem</div>
              <button onclick="ficharJugadorLibre('${j.id}')" class="btn-fichar">Fichar</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============ FICHAR JUGADOR LIBRE ============
function ficharJugadorLibre(jugadorId) {
  const jugador = mercadoActual.poolJugadoresLibres.find(j => j.id === jugadorId);
  if (!jugador) return;

  if (equipoUsuario.presupuesto < jugador.sueldo) {
    log(`❌ Presupuesto insuficiente para fichar a ${jugador.nombre}`, 'error');
    return;
  }

  equipoUsuario.presupuesto -= jugador.sueldo;
  equipoUsuario.plantel.push(jugador);
  mercadoActual.poolJugadoresLibres = mercadoActual.poolJugadoresLibres.filter(j => j.id !== jugadorId);

  log(`✓ ${jugador.nombre} fichado exitosamente`, 'success');
  abrirMercado();
}

// ============ INICIAR FECHA ============
function iniciarFecha() {
  if (equipoUsuario.alineacionTitular.length < 11) {
    log('❌ Debes tener 11 titulares para jugar', 'error');
    return;
  }

  gameState.iniciarFecha();
}

// ============ INICIAR PARTIDO INTERACTIVO ============
function iniciarPartidoInteractivo() {
  const proximoPartido = gameState.obtenerProximoPartido();
  if (!proximoPartido) return;

  const equipoRival = proximoPartido.visitante.id === equipoUsuario.id ? 
    proximoPartido.local : proximoPartido.visitante;

  estadoPartidoActual = crearEstadoPartido(equipoUsuario, equipoRival, '4-4-2');
  partidoEnCurso = true;
  partidoPausado = false;
  ultimoEventoProcesado = 0;

  log(`⚽ Partido iniciado: ${equipoUsuario.nombre} vs ${equipoRival.nombre}`, 'info');

  iniciarBucleRenderizado();
}

// ============ BUCLE DE RENDERIZADO ============
function iniciarBucleRenderizado() {
  function frame() {
    if (partidoEnCurso && !partidoPausado) {
      for (let i = 0; i < velocidadPartido; i++) {
        if (estadoPartidoActual.tick < 5400) {
          simularTick(estadoPartidoActual);
        } else {
          finalizarPartido();
          return;
        }
      }

      procesarEventosNuevos();
    }

    renderizarCampo();
    actualizarUIPartido();

    if (partidoEnCurso) {
      animationFrameId = requestAnimationFrame(frame);
    }
  }

  animationFrameId = requestAnimationFrame(frame);
}

// ============ RENDERIZAR CAMPO EN CANVAS ============
function renderizarCampo() {
  const canvas = document.getElementById('canvas-campo');
  if (!canvas || !estadoPartidoActual) return;

  const ctx = canvas.getContext('2d');

  // Limpiar
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Líneas
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // Jugadores
  estadoPartidoActual.jugadoresEnCancha.forEach(j => {
    const x = j.x * ESCALA_CANVAS_X;
    const y = j.y * ESCALA_CANVAS_Y;
    ctx.fillStyle = j.equipo === 'local' ? '#0066cc' : '#ff3333';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  // Pelota
  const px = estadoPartidoActual.pelota.x * ESCALA_CANVAS_X;
  const py = estadoPartidoActual.pelota.y * ESCALA_CANVAS_Y;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fill();
}

// ============ ACTUALIZAR UI DEL PARTIDO ============
function actualizarUIPartido() {
  if (!estadoPartidoActual) return;

  const minuto = Math.floor(estadoPartidoActual.tick / TICKS_POR_MINUTO);
  const segundo = Math.floor((estadoPartidoActual.tick % TICKS_POR_MINUTO) * (60 / TICKS_POR_MINUTO));

  const minutoEl = document.getElementById('minuto-actual');
  if (minutoEl) minutoEl.textContent = `${minuto}:${segundo.toString().padStart(2, '0')}`;

  const marcadorEl = document.getElementById('marcador-actual');
  if (marcadorEl) marcadorEl.textContent = `${estadoPartidoActual.golesLocal} - ${estadoPartidoActual.golesVisitante}`;
}

// ============ PROCESAR EVENTOS NUEVOS ============
function procesarEventosNuevos() {
  const eventosNuevos = estadoPartidoActual.eventos.slice(ultimoEventoProcesado);

  eventosNuevos.forEach(evento => {
    log(`[${evento.minuto}'] ${evento.descripcion}`, 'info');
  });

  ultimoEventoProcesado = estadoPartidoActual.eventos.length;
}

// ============ FINALIZAR PARTIDO ============
function finalizarPartido() {
  partidoEnCurso = false;
  cancelAnimationFrame(animationFrameId);

  const resultado = estadoPartidoActual.golesLocal > estadoPartidoActual.golesVisitante ? 'VICTORIA ✓' :
                    estadoPartidoActual.golesLocal < estadoPartidoActual.golesVisitante ? 'DERROTA ✗' : 'EMPATE =';

  log(`🏁 Partido finalizado: ${estadoPartidoActual.golesLocal} - ${estadoPartidoActual.golesVisitante} (${resultado})`, 'success');

  // Registrar resultado
  gameState.registrarResultadoUsuario(estadoPartidoActual.golesLocal, estadoPartidoActual.golesVisitante);

  // Procesar post-partido
  setTimeout(() => {
    gameState.procesarPostPartido(50);
  }, 2000);
}

// ============ RENDERIZAR PANTALLA POST-PARTIDO ============
function renderizarPantallaPostPartido(datos) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const resultado = datos.resultados;
  const resultadoTexto = resultado.golesLocal > resultado.golesVisitante ? '✓ VICTORIA' :
                         resultado.golesLocal < resultado.golesVisitante ? '✗ DERROTA' : '= EMPATE';

  mainContent.innerHTML = `
    <div class="post-partido">
      <h2>${resultadoTexto}</h2>
      <div class="resultado-marcador">${resultado.golesLocal} - ${resultado.golesVisitante}</div>

      <div class="finanzas-resumen">
        <h3>Resumen Financiero</h3>
        <p>Presupuesto: $${datos.finanzas.presupuesto.toFixed(1)}M</p>
        <p>Ingresos: +$${datos.finanzas.ingresos.toFixed(1)}M</p>
        <p>Gastos: -$${datos.finanzas.gastos.toFixed(1)}M</p>
      </div>

      <button class="btn btn-primary" onclick="volverAlMenu()">Continuar</button>
    </div>
  `;
}

// ============ RENDERIZAR FIN DE TEMPORADA ============
function renderizarFinTemporada() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const tabla = gameState.obtenerTablaActualizada();
  const posicion = tabla.findIndex(e => e.id === equipoUsuario.id) + 1;

  mainContent.innerHTML = `
    <div class="fin-temporada">
      <h2>🏆 Fin de Temporada</h2>
      <p>Tu equipo terminó en posición <strong>${posicion}º</strong></p>
      ${renderizarTablaCompacta(tabla)}
      <button class="btn btn-primary" onclick="inicializarJuego()">Nueva Temporada</button>
    </div>
  `;
}

// ============ FUNCIONES AUXILIARES ============
function volverAlMenu() {
  gameState.volverAlMenu();
}

function ocultarPaneles() {
  const paneles = document.querySelectorAll('[id*="panel"]');
  paneles.forEach(p => p.style.display = 'none');
}

function mostrarPaneles() {
  const paneles = document.querySelectorAll('[id*="panel"]');
  paneles.forEach(p => p.style.display = 'block');
}

function renderizarPantallaPartido() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="partido-interactivo">
      <div class="partido-controles">
        <span id="minuto-actual" class="minuto">0:00</span>
        <span id="marcador-actual" class="marcador">0 - 0</span>
        <button onclick="cambiarVelocidad(1)" class="btn-velocidad">1x</button>
        <button onclick="cambiarVelocidad(2)" class="btn-velocidad">2x</button>
      </div>
      <canvas id="canvas-campo" width="1000" height="600"></canvas>
    </div>
  `;
}

function cambiarVelocidad(v) {
  velocidadPartido = v;
  log(`⚡ Velocidad: ${v}x`, 'info');
}

function log(mensaje, tipo = 'info') {
  console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
  const logContainer = document.getElementById('log');
  if (logContainer) {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${tipo}`;
    entry.textContent = mensaje;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// ============ CREAR DATOS DE EJEMPLO ============
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
      historialTransacciones: [],
      ratingEquipo: function() { return 70; }
    });
  }
  return equipos;
}

// Clase Liga simplificada
class Liga {
  constructor(nombre, equipos) {
    this.nombre = nombre;
    this.equipos = equipos;
    this.fechaActual = 1;
    this.fixture = [];
    this.generarFixture();
  }

  generarFixture() {
    // Implementar generador de fixture Round Robin
    this.fixture = [];
  }

  obtenerTablaOrdenada() {
    return this.equipos.sort((a, b) => {
      if ((b.puntos || 0) !== (a.puntos || 0)) return (b.puntos || 0) - (a.puntos || 0);
      return (b.GF || 0) - (a.GF || 0);
    });
  }

  obtenerProximoPartido(idEquipo) {
    return this.fixture.find(p => !p.jugado && (p.local.id === idEquipo || p.visitante.id === idEquipo));
  }

  registrarPartidoUsuario(golesLocal, golesVisitante) {
    // Implementar registro
  }

  simularFechaActual(idEquipo) {
    // Implementar simulación
  }
}

// ============ INICIALIZAR AL CARGAR ============
document.addEventListener('DOMContentLoaded', () => {
  inicializarJuego();
});

// Exportar funciones globales
window.iniciarFecha = iniciarFecha;
window.abrirGestionPlantilla = abrirGestionPlantilla;
window.abrirMercado = abrirMercado;
window.volverAlMenu = volverAlMenu;
window.alternarAlineacion = alternarAlineacion;
window.ficharJugadorLibre = ficharJugadorLibre;
window.cambiarVelocidad = cambiarVelocidad;
