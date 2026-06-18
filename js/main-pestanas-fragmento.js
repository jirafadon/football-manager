// FRAGMENTO A AGREGAR EN js/main.js

// ============ FUNCIÓN CAMBIAR PANTALLA (SISTEMA DE PESTAÑAS) ============
function cambiarPantalla(idPantallaVisible) {
  // Obtener todas las secciones
  const secciones = document.querySelectorAll('section');
  
  // Obtener todos los botones de pestaña
  const botones = document.querySelectorAll('.btn-pestaña');

  // Ocultar todas las secciones
  secciones.forEach(seccion => {
    seccion.classList.add('oculta');
  });

  // Desactivar todos los botones
  botones.forEach(boton => {
    boton.classList.remove('activa');
  });

  // Mostrar la sección seleccionada
  const seccionVisible = document.getElementById(idPantallaVisible);
  if (seccionVisible) {
    seccionVisible.classList.remove('oculta');
  }

  // Activar el botón correspondiente
  const idBoton = 'btn-' + idPantallaVisible.replace('pantalla-', '');
  const botonActivo = document.getElementById(idBoton);
  if (botonActivo) {
    botonActivo.classList.add('activa');
  }

  console.log(`[UI] Pantalla cambiada a: ${idPantallaVisible}`);
}

// ============ INICIALIZAR SISTEMA DE PESTAÑAS ============
function inicializarPestanas() {
  // Mostrar pantalla de plantilla por defecto
  cambiarPantalla('pantalla-plantilla');

  // Agregar event listeners a los botones (si no están en onclick)
  const btnPlantilla = document.getElementById('btn-plantilla');
  const btnMercado = document.getElementById('btn-mercado');
  const btnLiga = document.getElementById('btn-liga');
  const btnPartido = document.getElementById('btn-partido');

  if (btnPlantilla) btnPlantilla.addEventListener('click', () => cambiarPantalla('pantalla-plantilla'));
  if (btnMercado) btnMercado.addEventListener('click', () => cambiarPantalla('pantalla-mercado'));
  if (btnLiga) btnLiga.addEventListener('click', () => cambiarPantalla('pantalla-liga'));
  if (btnPartido) btnPartido.addEventListener('click', () => cambiarPantalla('pantalla-partido'));
}

// ============ ACTUALIZAR CONTENIDO DE PANTALLA ============
function actualizarPantalla(idPantalla, contenidoHTML) {
  const seccion = document.getElementById(idPantalla);
  if (seccion) {
    const contenedor = seccion.querySelector('.pantalla-contenido');
    if (contenedor) {
      contenedor.innerHTML = contenidoHTML;
    } else {
      seccion.innerHTML = contenidoHTML;
    }
  }
}

// ============ RENDERIZAR PLANTILLA EN PESTAÑA ============
function renderizarPlantillaEnPestana() {
  const alineacion = equipoUsuario.alineacionTitular || [];
  const banco = equipoUsuario.plantel.filter(j => !alineacion.some(t => t.id === j.id));

  const html = `
    <div class="gestion-plantilla">
      <h2>👥 Gestión de Plantilla</h2>
      
      <div class="info-equipo-compacta">
        <p><strong>Equipo:</strong> ${equipoUsuario.nombre}</p>
        <p><strong>Titulares:</strong> ${alineacion.length}/11</p>
        <p><strong>Rating:</strong> ${equipoUsuario.ratingEquipo ? equipoUsuario.ratingEquipo().toFixed(1) : '0'}</p>
      </div>

      <div class="gestion-contenido">
        <div class="seccion-alineacion">
          <h3>Alineación Titular (${alineacion.length}/11)</h3>
          <div class="grid-alineacion">
            ${alineacion.map(j => renderizarJugadorCard(j, true)).join('')}
          </div>
        </div>

        <div class="seccion-banco">
          <h3>Banco de Suplentes (${banco.length})</h3>
          <div class="grid-banco">
            ${banco.map(j => renderizarJugadorCard(j, false)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  actualizarPantalla('pantalla-plantilla', html);
}

// ============ RENDERIZAR MERCADO EN PESTAÑA ============
function renderizarMercadoEnPestana() {
  const libres = mercadoActual?.poolJugadoresLibres || [];

  const html = `
    <div class="mercado-pases">
      <h2>💰 Mercado de Pases</h2>
      
      <div class="info-mercado">
        <p><strong>Presupuesto:</strong> $${equipoUsuario.presupuesto.toFixed(1)}M</p>
        <p><strong>Jugadores Libres:</strong> ${libres.length}</p>
      </div>

      <h3>Jugadores Disponibles</h3>
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
  `;

  actualizarPantalla('pantalla-mercado', html);
}

// ============ RENDERIZAR LIGA EN PESTAÑA ============
function renderizarLigaEnPestana() {
  const tabla = gameState?.obtenerTablaActualizada() || [];
  const infoFecha = gameState?.obtenerInfoFecha() || {};

  const html = `
    <div class="liga-info">
      <h2>🏆 Liga</h2>
      
      <div class="info-fecha-compacta">
        <p><strong>Fecha:</strong> ${infoFecha.fechaActual || 0} / ${infoFecha.totalFechas || 38}</p>
        <p><strong>Tu Posición:</strong> ${infoFecha.posicion || '-'}º</p>
      </div>

      <h3>Tabla de Posiciones</h3>
      ${renderizarTablaCompacta(tabla)}
    </div>
  `;

  actualizarPantalla('pantalla-liga', html);
}

// ============ RENDERIZAR PARTIDO EN PESTAÑA ============
function renderizarPartidoEnPestana() {
  const proximoPartido = gameState?.obtenerProximoPartido();

  const html = `
    <div class="partido-info">
      <h2>⚽ Partido</h2>
      
      ${proximoPartido ? `
        <div class="proximo-partido">
          <h3>Próximo Encuentro</h3>
          <p><strong>${proximoPartido.local.nombre}</strong> vs <strong>${proximoPartido.visitante.nombre}</strong></p>
          <button class="btn btn-primary" onclick="iniciarFecha()">Jugar Partido</button>
        </div>

        <div class="canvas-wrapper">
          <canvas id="canvas-campo" width="1000" height="600"></canvas>
        </div>

        <div class="controles-partido">
          <button class="btn-velocidad" onclick="cambiarVelocidad(1)">1x</button>
          <button class="btn-velocidad" onclick="cambiarVelocidad(2)">2x</button>
          <span id="minuto-actual" class="minuto">0:00</span>
          <span id="marcador-actual" class="marcador">0 - 0</span>
        </div>
      ` : `
        <p>No hay próximo partido disponible</p>
      `}
    </div>
  `;

  actualizarPantalla('pantalla-partido', html);
}

// ============ AGREGAR AL DOMContentLoaded ============
// Agregar esta línea dentro del event listener 'DOMContentLoaded':
// inicializarPestanas();

// ============ EXPORTAR FUNCIONES GLOBALES ============
window.cambiarPantalla = cambiarPantalla;
window.actualizarPantalla = actualizarPantalla;
window.renderizarPlantillaEnPestana = renderizarPlantillaEnPestana;
window.renderizarMercadoEnPestana = renderizarMercadoEnPestana;
window.renderizarLigaEnPestana = renderizarLigaEnPestana;
window.renderizarPartidoEnPestana = renderizarPartidoEnPestana;
