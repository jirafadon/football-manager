/**
 * RENDERIZADO BROADCAST
 * Funciones para renderizar tarjetas de jugadores con diseño moderno oscuro
 */

/**
 * Renderiza una tarjeta de jugador en formato broadcast
 * @param {Jugador} jugador - Instancia del jugador
 * @param {boolean} titular - Si es titular o suplente
 * @returns {string} HTML de la tarjeta
 */
function renderizarJugadorBroadcast(jugador, titular = false) {
    const posicionClase = jugador.posicion.toLowerCase();
    const posicionLabel = {
        'POR': 'Portero',
        'DEF': 'Defensa',
        'MED': 'Mediocampista',
        'DEL': 'Delantero'
    }[jugador.posicion] || jugador.posicion;

    // Determinar calidad del atributo
    const determinarCalidad = (valor) => {
        if (valor < 50) return 'bajo';
        if (valor < 75) return 'medio';
        return 'alto';
    };

    // Atributos principales según posición
    let atributosVisibles = [];
    if (jugador.posicion === 'POR') {
        atributosVisibles = [
            { label: 'DEF', valor: Math.round(jugador.defensa) },
            { label: 'FIS', valor: Math.round(jugador.fisico) }
        ];
    } else if (jugador.posicion === 'DEF') {
        atributosVisibles = [
            { label: 'DEF', valor: Math.round(jugador.defensa) },
            { label: 'VEL', valor: Math.round(jugador.velocidad) },
            { label: 'FIS', valor: Math.round(jugador.fisico) }
        ];
    } else if (jugador.posicion === 'MED') {
        atributosVisibles = [
            { label: 'PAS', valor: Math.round(jugador.pase) },
            { label: 'REM', valor: Math.round(jugador.remate) },
            { label: 'VEL', valor: Math.round(jugador.velocidad) }
        ];
    } else {
        // DEL
        atributosVisibles = [
            { label: 'REM', valor: Math.round(jugador.remate) },
            { label: 'VEL', valor: Math.round(jugador.velocidad) },
            { label: 'PAS', valor: Math.round(jugador.pase) }
        ];
    }

    // Formatear moneda
    const formatearMoneda = (valor) => {
        if (valor >= 1000000) {
            return `€${(valor / 1000000).toFixed(1)}M`;
        } else if (valor >= 1000) {
            return `€${(valor / 1000).toFixed(0)}K`;
        }
        return `€${valor}`;
    };

    // Construir HTML de atributos
    const htmlAtributos = atributosVisibles
        .map(attr => `
            <div class="broadcast-atributo-badge ${determinarCalidad(attr.valor)}">
                <div class="broadcast-atributo-label">${attr.label}</div>
                <div class="broadcast-atributo-valor">${attr.valor}</div>
            </div>
        `)
        .join('');

    // Foto con fallback
    const fotoUrl = imagenFallback.crearImgJugador(jugador.id, jugador.nombre, {
        clase: 'broadcast-foto',
        ancho: 80,
        alto: 80
    });

    // HTML de la tarjeta
    const html = `
        <div class="jugador-card-broadcast ${titular ? 'titular' : 'suplente'}">
            <!-- FOTO -->
            <div class="broadcast-foto-container">
                ${fotoUrl}
            </div>

            <!-- INFO CENTRAL -->
            <div class="broadcast-info">
                <div class="broadcast-nombre">#${jugador.numero} ${jugador.nombre}</div>
                <div class="broadcast-meta">
                    <span class="broadcast-posicion ${posicionClase}">${jugador.posicion}</span>
                    <span class="broadcast-nacionalidad">${jugador.nacionalidad}</span>
                    <span class="broadcast-edad">${jugador.edad} años</span>
                </div>
            </div>

            <!-- FINANZAS -->
            <div class="broadcast-finanzas">
                <div class="broadcast-finanzas-label">Valor</div>
                <div class="broadcast-valor">${formatearMoneda(jugador.valor)}</div>
                <div class="broadcast-finanzas-label">Sueldo</div>
                <div class="broadcast-sueldo">${formatearMoneda(jugador.contrato.sueldoMensual)}/mes</div>
            </div>

            <!-- ATRIBUTOS -->
            <div class="broadcast-atributos">
                ${htmlAtributos}
            </div>
        </div>
    `;

    return html;
}

/**
 * Renderiza una sección de jugadores (titulares o suplentes)
 * @param {Array<Jugador>} jugadores - Array de jugadores
 * @param {string} titulo - Título de la sección
 * @param {boolean} titular - Si son titulares
 * @returns {string} HTML de la sección
 */
function renderizarSeccionJugadores(jugadores, titulo, titular = true) {
    if (!jugadores || jugadores.length === 0) {
        return `
            <div class="jugadores-subseccion">
                <div class="jugadores-subseccion-titulo">${titulo}</div>
                <div class="broadcast-empty-state">
                    <div class="broadcast-empty-state-icon">📭</div>
                    <div class="broadcast-empty-state-text">No hay jugadores en esta categoría</div>
                </div>
            </div>
        `;
    }

    const htmlJugadores = jugadores
        .map(jugador => renderizarJugadorBroadcast(jugador, titular))
        .join('');

    return `
        <div class="jugadores-subseccion">
            <div class="jugadores-subseccion-titulo">${titulo}</div>
            <div class="jugadores-grid-broadcast">
                ${htmlJugadores}
            </div>
        </div>
    `;
}

/**
 * Renderiza la plantilla completa en formato broadcast
 * @param {Equipo} equipo - Instancia del equipo
 * @returns {string} HTML completo de la plantilla
 */
function renderizarPlantillaBroadcast(equipo) {
    if (!equipo || !equipo.plantel) {
        return '<div class="broadcast-empty-state"><p>No hay equipo cargado</p></div>';
    }

    // Separar titulares y suplentes
    const titulares = equipo.alineacionTitular || equipo.plantel.slice(0, 11);
    const suplentes = equipo.plantel.slice(11);

    // Renderizar secciones
    const htmlTitulares = renderizarSeccionJugadores(titulares, '⭐ ALINEACIÓN TITULAR', true);
    const htmlSuplentes = renderizarSeccionJugadores(suplentes, '🔄 SUPLENTES', false);

    return `
        <div class="seccion-plantilla">
            <div class="seccion-titulo">
                👥 Plantilla de ${equipo.nombre}
            </div>
            <div class="jugadores-grid-broadcast">
                ${htmlTitulares}
                ${htmlSuplentes}
            </div>
        </div>
    `;
}

/**
 * Renderiza el mercado de jugadores en formato broadcast
 * @param {Array<Jugador>} jugadoresDisponibles - Jugadores en venta
 * @returns {string} HTML del mercado
 */
function renderizarMercadoBroadcast(jugadoresDisponibles) {
    if (!jugadoresDisponibles || jugadoresDisponibles.length === 0) {
        return `
            <div class="seccion-mercado">
                <div class="seccion-titulo">🛒 Mercado de Pases</div>
                <div class="broadcast-empty-state">
                    <div class="broadcast-empty-state-icon">🏪</div>
                    <div class="broadcast-empty-state-text">No hay jugadores disponibles en el mercado</div>
                </div>
            </div>
        `;
    }

    // Agrupar por posición
    const porPosicion = {
        'POR': [],
        'DEF': [],
        'MED': [],
        'DEL': []
    };

    jugadoresDisponibles.forEach(jugador => {
        if (porPosicion[jugador.posicion]) {
            porPosicion[jugador.posicion].push(jugador);
        }
    });

    // Renderizar por posición
    const secciones = [
        { pos: 'POR', titulo: '🥅 Porteros', emoji: '🥅' },
        { pos: 'DEF', titulo: '🛡️ Defensas', emoji: '🛡️' },
        { pos: 'MED', titulo: '⚙️ Mediocampistas', emoji: '⚙️' },
        { pos: 'DEL', titulo: '⚽ Delanteros', emoji: '⚽' }
    ];

    const htmlSecciones = secciones
        .map(seccion => {
            const jugadores = porPosicion[seccion.pos];
            return renderizarSeccionJugadores(jugadores, seccion.titulo, false);
        })
        .join('');

    return `
        <div class="seccion-mercado">
            <div class="seccion-titulo">
                🛒 Mercado de Pases (${jugadoresDisponibles.length} jugadores)
            </div>
            <div class="jugadores-grid-broadcast">
                ${htmlSecciones}
            </div>
        </div>
    `;
}

/**
 * Actualiza el DOM con la plantilla broadcast
 * @param {string} selectorContenedor - Selector CSS del contenedor
 * @param {Equipo} equipo - Equipo a renderizar
 */
function actualizarPlantillaBroadcast(selectorContenedor, equipo) {
    const contenedor = document.querySelector(selectorContenedor);
    if (!contenedor) {
        console.error(`Contenedor no encontrado: ${selectorContenedor}`);
        return;
    }

    contenedor.innerHTML = renderizarPlantillaBroadcast(equipo);
    
    // Procesar imágenes con fallback
    imagenFallback.procesarImagenesDOM('.broadcast-foto', 'foto');
}

/**
 * Actualiza el DOM con el mercado broadcast
 * @param {string} selectorContenedor - Selector CSS del contenedor
 * @param {Array<Jugador>} jugadores - Jugadores disponibles
 */
function actualizarMercadoBroadcast(selectorContenedor, jugadores) {
    const contenedor = document.querySelector(selectorContenedor);
    if (!contenedor) {
        console.error(`Contenedor no encontrado: ${selectorContenedor}`);
        return;
    }

    contenedor.innerHTML = renderizarMercadoBroadcast(jugadores);
    
    // Procesar imágenes con fallback
    imagenFallback.procesarImagenesDOM('.broadcast-foto', 'foto');
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderizarJugadorBroadcast,
        renderizarSeccionJugadores,
        renderizarPlantillaBroadcast,
        renderizarMercadoBroadcast,
        actualizarPlantillaBroadcast,
        actualizarMercadoBroadcast
    };
}
