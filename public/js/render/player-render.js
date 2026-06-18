/**
 * RENDERIZADO DE JUGADORES Y EQUIPOS - ESTILO PC FÚTBOL
 * Funciones mejoradas para tarjetas de jugadores con foto y atributos
 */

/**
 * Renderiza una tarjeta de jugador mejorada
 */
function renderizarTarjetaJugador(jugador, esJugadorUsuario = false, esTitular = false) {
    const posicionClase = {
        'POR': 'por',
        'DEF': 'def',
        'MED': 'med',
        'DEL': 'del'
    }[jugador.posicion] || 'med';

    // Calcular colores de atributos
    const atributos = [
        { label: 'VEL', valor: jugador.atributos.velocidad },
        { label: 'REM', valor: jugador.atributos.remate },
        { label: 'PAS', valor: jugador.atributos.pase },
        { label: 'DEF', valor: jugador.atributos.defensa },
        { label: 'FIS', valor: jugador.atributos.fisico }
    ];

    const atributosHTML = atributos.map(attr => {
        const porcentaje = (attr.valor / 100) * 100;
        let nivelColor = 'bajo';
        if (attr.valor >= 75) nivelColor = 'alto';
        else if (attr.valor >= 50) nivelColor = 'medio';

        return `
            <div class="atributo-barra">
                <span class="atributo-label">${attr.label}</span>
                <div class="atributo-valor">
                    <div class="atributo-relleno ${nivelColor}" style="width: ${porcentaje}%"></div>
                </div>
                <span class="atributo-numero">${attr.valor}</span>
            </div>
        `;
    }).join('');

    const html = `
        <div class="jugador-card ${esTitular ? 'titular' : ''}">
            <!-- Foto -->
            <div>
                <img 
                    src="./assets/faces/${jugador.id}.png" 
                    alt="${jugador.nombre}"
                    class="jugador-foto"
                    onerror="this.src='./assets/images/default-player.png'; this.classList.add('sin-imagen');"
                >
            </div>
            
            <!-- Info Central -->
            <div class="jugador-info">
                <div class="jugador-nombre">${jugador.nombre}</div>
                <div class="jugador-meta">
                    <span class="posicion-badge ${posicionClase}">${jugador.posicion}</span>
                    <span class="stat-basico">
                        <span class="stat-basico-label">Edad:</span>
                        <span class="stat-basico-valor">${jugador.edad}</span>
                    </span>
                </div>
                <div class="jugador-stats-basicos">
                    <div class="stat-basico">
                        <span class="stat-basico-label">Nº:</span>
                        <span class="stat-basico-valor">${jugador.numero}</span>
                    </div>
                    <div class="stat-basico">
                        <span class="stat-basico-label">Moral:</span>
                        <span class="stat-basico-valor">${jugador.moral || 80}%</span>
                    </div>
                </div>
                <div class="jugador-valor">€${(jugador.valor / 1000000).toFixed(1)}M</div>
            </div>
            
            <!-- Atributos -->
            <div class="jugador-atributos">
                ${atributosHTML}
            </div>
        </div>
    `;

    return html;
}

/**
 * Renderiza la plantilla completa con secciones
 */
function renderPlantillaCompleta() {
    if (!equipoUsuario) return;

    const contenido = document.getElementById('plantilla-contenido');
    if (!contenido) return;

    const titulares = equipoUsuario.alineacionTitular || [];
    const suplentes = equipoUsuario.plantel.filter(j => !titulares.find(t => t.id === j.id));

    let html = '<div class="jugadores-grid">';

    // Sección Titulares
    if (titulares.length > 0) {
        html += '<div class="jugadores-seccion">';
        html += '<div class="jugadores-seccion-titulo">⭐ Titulares</div>';
        titulares.forEach(jugador => {
            html += renderizarTarjetaJugador(jugador, true, true);
        });
        html += '</div>';
    }

    // Sección Suplentes
    if (suplentes.length > 0) {
        html += '<div class="jugadores-seccion">';
        html += '<div class="jugadores-seccion-titulo">🔄 Suplentes</div>';
        suplentes.forEach(jugador => {
            html += renderizarTarjetaJugador(jugador, true, false);
        });
        html += '</div>';
    }

    html += '</div>';

    // Agregar pizarra táctica
    html += '<div style="margin-top: 30px;"></div>';

    contenido.innerHTML = html;

    // Integrar tácticas después de renderizar
    setTimeout(() => {
        integrarTacticaEnPlantilla();
    }, 100);
}

/**
 * Renderiza la tabla de posiciones con escudos
 */
function renderLigaConEscudos() {
    if (!liga) return;

    const contenido = document.getElementById('liga-contenido');
    if (!contenido) return;

    const tablaOrdenada = liga.obtenerTablaOrdenada();

    let html = `
        <table class="tabla-liga-mejorada">
            <thead>
                <tr>
                    <th style="width: 5%;">Pos</th>
                    <th style="width: 40%;">Equipo</th>
                    <th style="width: 8%;">PJ</th>
                    <th style="width: 8%;">PG</th>
                    <th style="width: 8%;">PE</th>
                    <th style="width: 8%;">PP</th>
                    <th style="width: 8%;">GF</th>
                    <th style="width: 8%;">GC</th>
                    <th style="width: 12%; text-align: right;">Pts</th>
                </tr>
            </thead>
            <tbody>
    `;

    tablaOrdenada.forEach((equipo, idx) => {
        const esUsuario = equipo.id === equipoUsuario.id ? 'usuario' : '';
        const escudoUrl = `./assets/shields/${equipo.id}.png`;

        html += `
            <tr class="${esUsuario}">
                <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                <td>
                    <div class="tabla-equipo-nombre">
                        <img 
                            src="${escudoUrl}" 
                            alt="${equipo.nombre}"
                            class="tabla-equipo-escudo"
                            onerror="this.src='./assets/images/default-shield.png';"
                        >
                        <span>${equipo.nombre}</span>
                    </div>
                </td>
                <td class="tabla-stat">${equipo.PJ || 0}</td>
                <td class="tabla-stat">${equipo.PG || 0}</td>
                <td class="tabla-stat">${equipo.PE || 0}</td>
                <td class="tabla-stat">${equipo.PP || 0}</td>
                <td class="tabla-stat">${equipo.GF || 0}</td>
                <td class="tabla-stat">${equipo.GC || 0}</td>
                <td class="tabla-stat tabla-puntos">${equipo.puntos || 0}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    contenido.innerHTML = html;
}

/**
 * Actualiza el header con escudo del equipo
 */
function actualizarHeaderConEscudo() {
    if (!equipoUsuario) return;

    const headerTitle = document.querySelector('header h1');
    if (!headerTitle) return;

    // Crear estructura con escudo
    const escudoUrl = `./assets/shields/${equipoUsuario.id}.png`;
    const headerHTML = `
        <div class="header-equipo">
            <img 
                src="${escudoUrl}" 
                alt="${equipoUsuario.nombre}"
                class="escudo-equipo"
                onerror="this.src='./assets/images/default-shield.png';"
            >
            <span>⚽ ${equipoUsuario.nombre}</span>
        </div>
    `;

    headerTitle.innerHTML = headerHTML;
}

/**
 * Renderiza el mercado con tarjetas mejoradas
 */
function renderMercadoMejorado() {
    if (!liga) return;

    const contenido = document.getElementById('mercado-contenido');
    if (!contenido) return;

    // Obtener jugadores disponibles (simular mercado)
    const jugadoresDisponibles = [];
    liga.equipos.forEach(equipo => {
        if (equipo.id !== equipoUsuario.id) {
            const suplentes = equipo.plantel.filter(j => !equipo.alineacionTitular.find(t => t.id === j.id));
            jugadoresDisponibles.push(...suplentes.slice(0, 2)); // Máximo 2 por equipo
        }
    });

    if (jugadoresDisponibles.length === 0) {
        contenido.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay jugadores disponibles en el mercado</p>';
        return;
    }

    let html = '<div class="jugadores-grid">';
    html += '<div class="jugadores-seccion-titulo">🏪 Jugadores Disponibles</div>';

    jugadoresDisponibles.forEach(jugador => {
        html += renderizarTarjetaJugador(jugador, false, false);
    });

    html += '</div>';

    contenido.innerHTML = html;
}

/**
 * Reemplazar funciones antiguas
 */
function renderPlantilla() {
    renderPlantillaCompleta();
}

function renderLiga() {
    renderLigaConEscudos();
}

function renderMercado() {
    renderMercadoMejorado();
}

function actualizarHeader() {
    actualizarHeaderConEscudo();
}
