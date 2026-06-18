// FRAGMENTO A INSERTAR EN js/main.js

// ============ RENDERIZAR TABLA DE LIGA ============
function renderTablaLiga() {
  if (!liga) {
    console.error('[LIGA] Liga no inicializada');
    return;
  }

  // Obtener tabla ordenada
  const tabla = liga.obtenerTablaOrdenada();

  // Actualizar fecha actual
  const fechaEl = document.getElementById('fecha-actual');
  if (fechaEl) {
    fechaEl.textContent = `Fecha Actual: ${liga.fechaActual}`;
  }

  // Generar HTML de tabla
  const tablaHTML = `
    <table class="tabla-liga">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Equipo</th>
          <th>Pts</th>
          <th>PJ</th>
          <th>PG</th>
          <th>PE</th>
          <th>PP</th>
          <th>GF</th>
          <th>GC</th>
          <th>DIF</th>
        </tr>
      </thead>
      <tbody>
        ${tabla.map((equipo, idx) => `
          <tr class="${equipo.id === equipoUsuario.id ? 'fila-usuario' : ''}">
            <td>${idx + 1}</td>
            <td>${equipo.nombre}</td>
            <td>${equipo.puntos || 0}</td>
            <td>${equipo.PJ || 0}</td>
            <td>${equipo.PG || 0}</td>
            <td>${equipo.PE || 0}</td>
            <td>${equipo.PP || 0}</td>
            <td>${equipo.GF || 0}</td>
            <td>${equipo.GC || 0}</td>
            <td>${(equipo.GF || 0) - (equipo.GC || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Inyectar tabla en el contenedor
  const contenedor = document.getElementById('contenedor-tabla-liga');
  if (contenedor) {
    contenedor.innerHTML = tablaHTML;
  }

  console.log('[LIGA] Tabla renderizada');
}

// ============ AVANZAR FECHA ============
function avanzarFecha() {
  if (!liga || !equipoUsuario) {
    console.error('[LIGA] Datos no inicializados');
    return;
  }

  // Validar que no sea fin de temporada
  if (liga.fechaActual > 38) {
    log('❌ Temporada finalizada', 'warning');
    return;
  }

  // Simular partidos de fondo (IA)
  console.log(`[LIGA] Simulando fecha ${liga.fechaActual}...`);
  
  if (liga.simularFechaActual) {
    liga.simularFechaActual(equipoUsuario.id);
  }

  // Avanzar fecha
  liga.fechaActual++;

  // Procesar finanzas del usuario
  if (equipoUsuario.procesarBalanceFecha) {
    equipoUsuario.procesarBalanceFecha(50);
  }

  // Guardar partida
  if (typeof guardarPartida === 'function') {
    guardarPartida(equipoUsuario, liga);
    log('✓ Partida guardada', 'success');
  }

  // Renderizar tabla actualizada
  renderTablaLiga();

  log(`✓ Fecha ${liga.fechaActual - 1} completada`, 'success');

  // Cambiar a pestaña de partido para jugar
  cambiarPantalla('pantalla-partido');
}

// ============ INICIALIZAR PESTAÑA DE LIGA ============
function inicializarLiga() {
  // Renderizar tabla inicial
  renderTablaLiga();

  // Configurar event listener del botón (si no está en onclick)
  const btnAvanzar = document.getElementById('btn-avanzar-fecha');
  if (btnAvanzar) {
    btnAvanzar.addEventListener('click', avanzarFecha);
  }

  console.log('[LIGA] Pestaña de liga inicializada');
}

// ============ ACTUALIZAR TABLA CUANDO CAMBIA LA PESTAÑA ============
// Agregar esta línea en la función cambiarPantalla() después de mostrar la sección:
// if (idPantallaVisible === 'pantalla-liga') {
//   renderTablaLiga();
// }

// ============ EXPORTAR FUNCIONES GLOBALES ============
window.renderTablaLiga = renderTablaLiga;
window.avanzarFecha = avanzarFecha;
window.inicializarLiga = inicializarLiga;

// ============ LLAMAR AL INICIALIZAR JUEGO ============
// Agregar esta línea en inicializarJuego() o DOMContentLoaded:
// inicializarLiga();
