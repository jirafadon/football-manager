// FRAGMENTOS A AGREGAR A js/main.js

// ============ IMPORTAR AL INICIO ============
// import GameStateMachine, { GAME_STATES } from './core/GameStateMachine.js';
// import { Liga } from './models/Liga.js';
// import { MercadoPases } from './market/MercadoPases.js';

// ============ VARIABLES GLOBALES ============
let gameStateMachine = null;
let equipoUsuario = null;
let ligaActual = null;
let mercadoActual = null;

// ============ INICIALIZAR JUEGO ============
function inicializarJuego() {
  // Crear instancias de módulos
  equipoUsuario = crearEquipoUsuario();
  ligaActual = new Liga('Temporada 2026', [equipoUsuario, ...crearEquiposRivales(19)]);
  mercadoActual = new MercadoPases();

  // Crear State Machine
  gameStateMachine = new GameStateMachine(equipoUsuario, ligaActual, mercadoActual);

  // Suscribirse a eventos
  configurarEventosStateMachine();

  // Renderizar UI inicial
  renderizarMenuPrincipal();

  log('✓ Juego inicializado', 'success');
}

// ============ CONFIGURAR EVENTOS DE STATE MACHINE ============
function configurarEventosStateMachine() {
  gameStateMachine.on('estadoCambiado', (datos) => {
    console.log(`Estado cambió: ${datos.anterior} → ${datos.nuevo}`);
  });

  gameStateMachine.on('iniciarPartidoUsuario', (datos) => {
    renderizarPantallaPartido(datos.partido);
  });

  gameStateMachine.on('resultadoRegistrado', (datos) => {
    log(`Resultado registrado: ${datos.golesLocal} - ${datos.golesVisitante}`, 'info');
  });

  gameStateMachine.on('postPartidoProcesado', (datos) => {
    renderizarPantallaPostPartido(datos);
  });

  gameStateMachine.on('volverAlMenu', () => {
    renderizarMenuPrincipal();
  });

  gameStateMachine.on('abrirGestionPlantilla', () => {
    renderizarGestionPlantilla();
  });

  gameStateMachine.on('cerrarGestionPlantilla', () => {
    renderizarMenuPrincipal();
  });

  gameStateMachine.on('abrirMercado', () => {
    renderizarMercado();
  });

  gameStateMachine.on('cerrarMercado', () => {
    renderizarMenuPrincipal();
  });

  gameStateMachine.on('finTemporada', (datos) => {
    renderizarFinTemporada(datos);
  });
}

// ============ RENDERIZAR MENÚ PRINCIPAL ============
function renderizarMenuPrincipal() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const infoFecha = gameStateMachine.obtenerInfoFecha();
  const datosEquipo = gameStateMachine.obtenerDatosEquipo();

  mainContent.innerHTML = `
    <div class="menu-principal">
      <div class="header-info">
        <div class="info-equipo">
          <h2>${datosEquipo.nombre}</h2>
          <p>Presupuesto: $${datosEquipo.presupuesto}M</p>
          <p>Rating: ${datosEquipo.rating.toFixed(1)}</p>
          <p>Posición: ${infoFecha.posicion}º lugar</p>
        </div>

        <div class="info-fecha">
          <h3>Fecha ${infoFecha.fechaActual} / ${infoFecha.totalFechas}</h3>
          ${infoFecha.proximoPartido ? `
            <p>Próximo: ${infoFecha.proximoPartido.local.nombre} vs ${infoFecha.proximoPartido.visitante.nombre}</p>
          ` : '<p>Temporada finalizada</p>'}
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
        ${renderizarTablaCompacta()}
      </div>
    </div>
  `;

  // Agregar estilos si no existen
  agregarEstilosMenuPrincipal();
}

// ============ RENDERIZAR TABLA COMPACTA ============
function renderizarTablaCompacta() {
  const tabla = gameStateMachine.obtenerTablaActualizada();

  return `
    <table class="tabla-compacta">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Equipo</th>
          <th>PJ</th>
          <th>PG</th>
          <th>PE</th>
          <th>PP</th>
          <th>GF</th>
          <th>GC</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        ${tabla.slice(0, 10).map((equipo, idx) => `
          <tr class="${equipo.id === equipoUsuario.id ? 'fila-usuario' : ''}">
            <td>${idx + 1}</td>
            <td>${equipo.nombre}</td>
            <td>${equipo.PJ}</td>
            <td>${equipo.PG}</td>
            <td>${equipo.PE}</td>
            <td>${equipo.PP}</td>
            <td>${equipo.GF}</td>
            <td>${equipo.GC}</td>
            <td><strong>${equipo.puntos}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ============ ABRIR GESTIÓN DE PLANTILLA ============
function abrirGestionPlantilla() {
  gameStateMachine.abrirGestionPlantilla();
}

// ============ CERRAR GESTIÓN DE PLANTILLA ============
function cerrarGestionPlantilla() {
  gameStateMachine.cerrarGestionPlantilla();
}

// ============ RENDERIZAR GESTIÓN DE PLANTILLA ============
function renderizarGestionPlantilla() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="gestion-plantilla">
      <div class="gestion-header">
        <h2>👥 Gestión de Plantilla</h2>
        <button class="btn btn-secondary" onclick="cerrarGestionPlantilla()">Volver</button>
      </div>

      <div class="gestion-contenido">
        <div class="seccion-alineacion">
          <h3>Alineación Titular (11)</h3>
          <div id="alineacion-titular" class="grid-alineacion">
            ${renderizarAlineacionTitular()}
          </div>
        </div>

        <div class="seccion-banco">
          <h3>Banco de Suplentes</h3>
          <div id="banco-suplentes" class="grid-banco">
            ${renderizarBanco()}
          </div>
        </div>
      </div>
    </div>
  `;

  agregarEstilosGestionPlantilla();
}

// ============ RENDERIZAR ALINEACIÓN TITULAR ============
function renderizarAlineacionTitular() {
  const alineacion = equipoUsuario.alineacionTitular || [];
  return alineacion.map(jugador => `
    <div class="jugador-card titular">
      <div class="jugador-nombre">${jugador.nombre}</div>
      <div class="jugador-posicion">${jugador.posicion}</div>
      <button onclick="removerDeTitulares('${jugador.id}')">Remover</button>
    </div>
  `).join('');
}

// ============ RENDERIZAR BANCO ============
function renderizarBanco() {
  const banco = equipoUsuario.plantel.filter(j => 
    !equipoUsuario.alineacionTitular.some(t => t.id === j.id)
  );
  return banco.map(jugador => `
    <div class="jugador-card suplente">
      <div class="jugador-nombre">${jugador.nombre}</div>
      <div class="jugador-posicion">${jugador.posicion}</div>
      <button onclick="agregarATitulares('${jugador.id}')">Alinear</button>
    </div>
  `).join('');
}

// ============ ABRIR MERCADO ============
function abrirMercado() {
  gameStateMachine.abrirMercado();
}

// ============ CERRAR MERCADO ============
function cerrarMercado() {
  gameStateMachine.cerrarMercado();
}

// ============ RENDERIZAR MERCADO ============
function renderizarMercado() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="mercado-pases">
      <div class="mercado-header">
        <h2>💰 Mercado de Pases</h2>
        <button class="btn btn-secondary" onclick="cerrarMercado()">Volver</button>
      </div>

      <div class="mercado-contenido">
        <div class="seccion-libres">
          <h3>Jugadores Libres</h3>
          <div id="jugadores-libres">
            ${renderizarJugadoresLibres()}
          </div>
        </div>

        <div class="seccion-transferibles">
          <h3>Jugadores en Transferencia</h3>
          <div id="jugadores-transferibles">
            ${renderizarJugadoresTransferibles()}
          </div>
        </div>
      </div>
    </div>
  `;

  agregarEstilosMercado();
}

// ============ INICIAR FECHA ============
function iniciarFecha() {
  gameStateMachine.iniciarFecha();
}

// ============ REGISTRAR RESULTADO USUARIO ============
function registrarResultadoUsuario(golesLocal, golesVisitante) {
  gameStateMachine.registrarResultadoUsuario(golesLocal, golesVisitante);
}

// ============ PROCESAR POST-PARTIDO ============
function procesarPostPartido(precioEntrada = 50) {
  gameStateMachine.procesarPostPartido(precioEntrada);
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
      <div class="resultado-marcador">
        <span>${resultado.golesLocal} - ${resultado.golesVisitante}</span>
      </div>

      <div class="finanzas-resumen">
        <h3>Resumen Financiero</h3>
        <p>Presupuesto anterior: $${datos.finanzas.presupuesto + datos.finanzas.gastos}M</p>
        <p>Gastos (sueldos): -$${datos.finanzas.gastos}M</p>
        <p>Ingresos (entradas): +$${datos.finanzas.ingresos}M</p>
        <p><strong>Presupuesto actual: $${datos.finanzas.presupuesto}M</strong></p>
      </div>

      <button class="btn btn-primary" onclick="volverAlMenu()">Continuar</button>
    </div>
  `;

  agregarEstilosPostPartido();
}

// ============ VOLVER AL MENÚ ============
function volverAlMenu() {
  gameStateMachine.volverAlMenu();
}

// ============ RENDERIZAR FIN DE TEMPORADA ============
function renderizarFinTemporada(datos) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const posicionUsuario = datos.tabla.findIndex(e => e.id === equipoUsuario.id) + 1;

  mainContent.innerHTML = `
    <div class="fin-temporada">
      <h2>🏆 Fin de Temporada</h2>
      <p>Tu equipo terminó en posición <strong>${posicionUsuario}</strong></p>

      <div class="tabla-final">
        ${renderizarTablaCompacta()}
      </div>

      <button class="btn btn-primary" onclick="iniciarNuevaTemporada()">Nueva Temporada</button>
    </div>
  `;

  agregarEstilosFinTemporada();
}

// ============ INICIAR NUEVA TEMPORADA ============
function iniciarNuevaTemporada() {
  inicializarJuego();
}

// ============ AGREGAR ESTILOS ============
function agregarEstilosMenuPrincipal() {
  if (document.getElementById('estilos-menu-principal')) return;

  const style = document.createElement('style');
  style.id = 'estilos-menu-principal';
  style.textContent = `
    .menu-principal { padding: 20px; }
    .header-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-equipo, .info-fecha { background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .menu-opciones { display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; }
    .tabla-compacta { width: 100%; border-collapse: collapse; }
    .tabla-compacta th, .tabla-compacta td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    .tabla-compacta th { background: #0066cc; color: white; }
    .tabla-compacta tr.fila-usuario { background: #e8f4f8; font-weight: bold; }
    @media (max-width: 768px) { .header-info { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
}

function agregarEstilosGestionPlantilla() {
  if (document.getElementById('estilos-gestion-plantilla')) return;

  const style = document.createElement('style');
  style.id = 'estilos-gestion-plantilla';
  style.textContent = `
    .gestion-plantilla { padding: 20px; }
    .gestion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .gestion-contenido { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .seccion-alineacion, .seccion-banco { background: white; padding: 15px; border-radius: 6px; }
    .grid-alineacion, .grid-banco { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
    .jugador-card { background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: center; }
    .jugador-card.titular { background: #e8f4f8; border: 2px solid #0066cc; }
    .jugador-card button { margin-top: 8px; padding: 6px 10px; font-size: 12px; }
  `;
  document.head.appendChild(style);
}

function agregarEstilosMercado() {
  if (document.getElementById('estilos-mercado')) return;

  const style = document.createElement('style');
  style.id = 'estilos-mercado';
  style.textContent = `
    .mercado-pases { padding: 20px; }
    .mercado-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .mercado-contenido { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .seccion-libres, .seccion-transferibles { background: white; padding: 15px; border-radius: 6px; }
  `;
  document.head.appendChild(style);
}

function agregarEstilosPostPartido() {
  if (document.getElementById('estilos-post-partido')) return;

  const style = document.createElement('style');
  style.id = 'estilos-post-partido';
  style.textContent = `
    .post-partido { padding: 20px; text-align: center; }
    .resultado-marcador { font-size: 48px; font-weight: bold; color: #0066cc; margin: 20px 0; }
    .finanzas-resumen { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: left; }
  `;
  document.head.appendChild(style);
}

function agregarEstilosFinTemporada() {
  if (document.getElementById('estilos-fin-temporada')) return;

  const style = document.createElement('style');
  style.id = 'estilos-fin-temporada';
  style.textContent = `
    .fin-temporada { padding: 20px; text-align: center; }
    .tabla-final { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
  `;
  document.head.appendChild(style);
}

// ============ INICIALIZAR EN DOMContentLoaded ============
document.addEventListener('DOMContentLoaded', () => {
  inicializarJuego();
});
