/**
 * INTEGRACIÓN DE NOTICIAS Y AUDIO
 * Funciones para integrar en el controlador principal (main.js)
 */

// ============ INICIALIZAR NOTICIAS Y AUDIO ============
function inicializarNoticias() {
    noticias = new NoticiasManager();
    console.log('✓ Sistema de Noticias inicializado');
}

function inicializarAudio() {
    audio = new AudioManager();
    console.log('✓ Sistema de Audio inicializado');
}

// ============ RENDERIZAR NOTICIAS ============
function renderNoticias() {
    if (!noticias) return;
    
    const todasLasNoticias = noticias.obtenerTodas();
    const contenedor = document.getElementById('noticias-contenido');
    const badge = document.getElementById('badge-noticias');
    
    // Actualizar badge
    const noLeidas = noticias.contarNoLeidas();
    if (noLeidas > 0) {
        badge.textContent = noLeidas;
        badge.classList.remove('empty');
    } else {
        badge.classList.add('empty');
    }
    
    // Renderizar noticias
    if (todasLasNoticias.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay noticias</p>';
        return;
    }
    
    contenedor.innerHTML = todasLasNoticias.map(noticia => `
        <div class="noticia-card ${noticia.leida ? '' : 'no-leida'}" onclick="marcarNoticiasLeida(${noticia.id})">
            <div class="noticia-header">
                <span class="noticia-remitente">${noticia.remitente}</span>
                <span class="noticia-fecha">Jornada ${noticia.fecha}</span>
            </div>
            <div class="noticia-asunto">${noticia.asunto}</div>
            <div class="noticia-cuerpo">${noticia.cuerpo}</div>
            <div class="noticia-acciones">
                <button class="noticia-btn" onclick="event.stopPropagation(); eliminarNoticia(${noticia.id})">🗑 Eliminar</button>
            </div>
        </div>
    `).join('');
}

function marcarNoticiasLeida(id) {
    if (noticias) {
        noticias.marcarComoLeida(id);
        renderNoticias();
    }
}

function eliminarNoticia(id) {
    if (noticias) {
        noticias.eliminar(id);
        renderNoticias();
    }
}

function limpiarNoticias() {
    if (noticias && confirm('¿Estás seguro de que quieres limpiar toda la bandeja?')) {
        noticias.limpiar();
        renderNoticias();
    }
}

// ============ INTEGRACIÓN CON EVENTOS DEL JUEGO ============

/**
 * Llamar cuando se inicia la pestaña de Partido
 */
function activarPartido() {
    if (audio) {
        audio.iniciarAmbiente();
        audio.play('silbato');
    }
}

/**
 * Llamar cuando se sale de la pestaña de Partido
 */
function desactivarPartido() {
    if (audio) {
        audio.detenerAmbiente();
    }
}

/**
 * Llamar cuando ocurre un evento en el partido
 * @param {object} evento - Evento del partido
 */
function procesarEventoPartido(evento) {
    if (!evento) return;
    
    // Reproducir sonido según tipo de evento
    if (evento.tipo === 'tiro' || evento.tipo === 'patada') {
        if (audio) audio.play('patada');
    } else if (evento.tipo === 'gol') {
        if (audio) audio.play('gol');
        if (noticias) {
            noticias.noticia(
                'Partido',
                '⚽ ¡GOL!',
                `Se ha marcado un gol en el minuto ${evento.minuto}`,
                liga.fechaActual
            );
            renderNoticias();
        }
    }
}

/**
 * Llamar cuando termina el partido (90 minutos)
 */
function terminarPartido() {
    if (audio) {
        audio.play('silbato');
        audio.detenerAmbiente();
    }
}

/**
 * Llamar cuando un jugador se lesiona
 */
function registrarLesion(nombreJugador, semanas) {
    if (noticias) {
        noticias.lesionJugador(nombreJugador, semanas, liga.fechaActual);
        renderNoticias();
    }
}

/**
 * Llamar cuando se completa una transferencia
 */
function registrarTransferencia(nombreJugador, equipoOrigen, equipoDestino, precio) {
    if (noticias) {
        noticias.transferenciaCompletada(nombreJugador, equipoOrigen, equipoDestino, precio, liga.fechaActual);
        renderNoticias();
    }
}

/**
 * Llamar cuando termina un partido
 */
function registrarResultadoPartido(equipoLocal, equipoVisitante, golesLocal, golesVisitante) {
    if (noticias) {
        noticias.resumenPartido(equipoLocal, equipoVisitante, golesLocal, golesVisitante, liga.fechaActual);
        renderNoticias();
    }
}

// ============ AJUSTAR CANVAS PARA RESPONSIVE ============
function ajustarCanvasResponsive() {
    const canvas = document.getElementById('cancha');
    if (!canvas) return;
    
    const contenedor = canvas.parentElement;
    const ancho = contenedor.offsetWidth;
    
    // Mantener aspecto 100x60 (16:9.6)
    const alto = (ancho * 60) / 100;
    
    canvas.style.width = ancho + 'px';
    canvas.style.height = alto + 'px';
}

// Escuchar cambios de tamaño
window.addEventListener('resize', ajustarCanvasResponsive);

// Ajustar al cargar
window.addEventListener('load', ajustarCanvasResponsive);
