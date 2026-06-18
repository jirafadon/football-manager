/**
 * UI DE CONTRATOS
 * Sistema de visualización y renovación de contratos
 */

let vistaContratos = false; // Toggle entre vista normal y vista de contratos

/**
 * Alterna entre vista de jugadores y vista de contratos
 */
function alternarVistaContratos() {
    vistaContratos = !vistaContratos;
    
    const boton = document.querySelector('[onclick="alternarVistaContratos()"]');
    if (boton) {
        boton.textContent = vistaContratos ? '👥 Ver Jugadores' : '📋 Ver Contratos';
    }
    
    renderPlantillaCompleta();
}

/**
 * Renderiza tarjeta de contrato
 */
function renderizarTarjetaContrato(jugador, esJugadorUsuario = false, esTitular = false) {
    const infoContrato = jugador.obtenerInfoContrato();
    const estadoContrato = jugador.obtenerEstadoContrato();
    
    // Colores según estado
    let colorEstado = '#00aa44'; // Verde
    let textoEstado = '✅ VIGENTE';
    
    if (infoContrato.estado === 'VENCIDO') {
        colorEstado = '#ff6666';
        textoEstado = '⚠️ VENCIDO';
    } else if (infoContrato.estado === 'PRÓXIMO A VENCER') {
        colorEstado = '#ff9900';
        textoEstado = '🔴 VENCE PRONTO';
    }

    const html = `
        <div class="contrato-card ${esTitular ? 'titular' : ''}">
            <!-- Información del jugador -->
            <div class="contrato-jugador">
                <img 
                    src="./assets/faces/${jugador.id}.png" 
                    alt="${jugador.nombre}"
                    class="contrato-foto"
                    onerror="this.src='./assets/images/default-player.png';"
                >
                <div class="contrato-info-basica">
                    <div class="contrato-nombre">${jugador.nombre}</div>
                    <div class="contrato-posicion">${jugador.posicion} • ${jugador.edad} años</div>
                    <div class="contrato-overall">Overall: ${jugador.calcularPromedio().toFixed(0)}</div>
                </div>
            </div>

            <!-- Detalles del contrato -->
            <div class="contrato-detalles">
                <div class="contrato-fila">
                    <span class="contrato-label">Sueldo Mensual:</span>
                    <span class="contrato-valor">€${infoContrato.sueldoMensual.toLocaleString()}</span>
                </div>
                <div class="contrato-fila">
                    <span class="contrato-label">Sueldo Anual:</span>
                    <span class="contrato-valor">€${infoContrato.sueldoAnual.toLocaleString()}</span>
                </div>
                <div class="contrato-fila">
                    <span class="contrato-label">Vencimiento:</span>
                    <span class="contrato-valor" style="color: ${colorEstado}; font-weight: 700;">
                        ${infoContrato.anoVencimiento}
                    </span>
                </div>
                <div class="contrato-fila">
                    <span class="contrato-label">Años Restantes:</span>
                    <span class="contrato-valor" style="color: ${colorEstado}; font-weight: 700;">
                        ${infoContrato.anosRestantes} años
                    </span>
                </div>
                <div class="contrato-fila">
                    <span class="contrato-label">Cláusula de Rescisión:</span>
                    <span class="contrato-valor">€${(infoContrato.clausulaRescision / 1000000).toFixed(1)}M</span>
                </div>
                <div class="contrato-fila">
                    <span class="contrato-label">Estado:</span>
                    <span class="contrato-estado" style="background-color: ${colorEstado};">
                        ${textoEstado}
                    </span>
                </div>
            </div>

            <!-- Acciones -->
            <div class="contrato-acciones">
                <button 
                    class="btn-renovar" 
                    onclick="abrirModalRenovacion('${jugador.id}', '${jugador.nombre}')"
                >
                    🤝 Renovar
                </button>
            </div>
        </div>
    `;

    return html;
}

/**
 * Renderiza plantilla en vista de contratos
 */
function renderPlantillaContratos() {
    if (!equipoUsuario) return;

    const contenido = document.getElementById('plantilla-contenido');
    if (!contenido) return;

    const titulares = equipoUsuario.alineacionTitular || [];
    const suplentes = equipoUsuario.plantel.filter(j => !titulares.find(t => t.id === j.id));

    let html = '<div class="contratos-grid">';

    // Sección Titulares
    if (titulares.length > 0) {
        html += '<div class="contratos-seccion">';
        html += '<div class="contratos-seccion-titulo">⭐ Titulares</div>';
        titulares.forEach(jugador => {
            html += renderizarTarjetaContrato(jugador, true, true);
        });
        html += '</div>';
    }

    // Sección Suplentes
    if (suplentes.length > 0) {
        html += '<div class="contratos-seccion">';
        html += '<div class="contratos-seccion-titulo">🔄 Suplentes</div>';
        suplentes.forEach(jugador => {
            html += renderizarTarjetaContrato(jugador, true, false);
        });
        html += '</div>';
    }

    html += '</div>';

    contenido.innerHTML = html;
}

/**
 * Abre modal para renovar contrato
 */
function abrirModalRenovacion(jugadorId, jugadorNombre) {
    const jugador = equipoUsuario.plantel.find(j => j.id === jugadorId);
    if (!jugador) return;

    const infoActual = jugador.obtenerInfoContrato();
    const sueldoActual = infoActual.sueldoMensual;
    const anoActual = new Date().getFullYear();

    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal-renovacion';
    modal.innerHTML = `
        <div class="modal-contenido">
            <div class="modal-header">
                <h2>🤝 Renovar Contrato</h2>
                <button class="modal-cerrar" onclick="this.closest('.modal-renovacion').remove()">✕</button>
            </div>

            <div class="modal-body">
                <div class="modal-jugador">
                    <img 
                        src="./assets/faces/${jugador.id}.png" 
                        alt="${jugador.nombre}"
                        class="modal-foto"
                        onerror="this.src='./assets/images/default-player.png';"
                    >
                    <div>
                        <h3>${jugador.nombre}</h3>
                        <p>${jugador.posicion} • ${jugador.edad} años • Overall: ${jugador.calcularPromedio().toFixed(0)}</p>
                        <p style="color: #666; font-size: 12px;">Moral: ${jugador.moral}% | Contrato vence: ${infoActual.anoVencimiento}</p>
                    </div>
                </div>

                <div class="modal-form">
                    <div class="form-grupo">
                        <label>Sueldo Mensual Actual: €${sueldoActual.toLocaleString()}</label>
                        <input 
                            type="number" 
                            id="nuevoSueldo" 
                            placeholder="Nuevo sueldo mensual"
                            value="${Math.round(sueldoActual * 1.1)}"
                            min="0"
                            step="1000"
                        >
                        <small>Sugerencia: €${Math.round(sueldoActual * 1.15).toLocaleString()} (+15%)</small>
                    </div>

                    <div class="form-grupo">
                        <label>Años de Contrato</label>
                        <select id="nuevosAnos">
                            <option value="1">1 año</option>
                            <option value="2" selected>2 años</option>
                            <option value="3">3 años</option>
                            <option value="4">4 años</option>
                            <option value="5">5 años</option>
                        </select>
                    </div>

                    <div class="modal-info">
                        <p><strong>Información:</strong></p>
                        <ul>
                            <li>Sueldo anual propuesto: €<span id="sueldoAnualPropuesto">${(Math.round(sueldoActual * 1.1) * 12).toLocaleString()}</span></li>
                            <li>Vencimiento: <span id="anoVencimientoPropuesto">${anoActual + 2}</span></li>
                            <li>Reputación del club: ${equipoUsuario.reputacion || 70}%</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-cancelar" onclick="this.closest('.modal-renovacion').remove()">
                    Cancelar
                </button>
                <button 
                    class="btn btn-aceptar" 
                    onclick="procesarRenovacion('${jugadorId}', '${jugadorNombre}')"
                >
                    Proponer Renovación
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Actualizar valores en tiempo real
    const inputSueldo = modal.querySelector('#nuevoSueldo');
    const selectAnos = modal.querySelector('#nuevosAnos');
    
    const actualizarValores = () => {
        const sueldoNuevo = parseInt(inputSueldo.value) || 0;
        const anos = parseInt(selectAnos.value);
        modal.querySelector('#sueldoAnualPropuesto').textContent = (sueldoNuevo * 12).toLocaleString();
        modal.querySelector('#anoVencimientoPropuesto').textContent = anoActual + anos;
    };

    inputSueldo.addEventListener('input', actualizarValores);
    selectAnos.addEventListener('change', actualizarValores);
}

/**
 * Procesa la renovación del contrato
 */
function procesarRenovacion(jugadorId, jugadorNombre) {
    const jugador = equipoUsuario.plantel.find(j => j.id === jugadorId);
    if (!jugador) return;

    const nuevoSueldo = parseInt(document.getElementById('nuevoSueldo').value);
    const nuevosAnos = parseInt(document.getElementById('nuevosAnos').value);

    if (!nuevoSueldo || nuevoSueldo <= 0) {
        alert('Por favor, ingresa un sueldo válido');
        return;
    }

    // Negociar renovación
    const resultado = jugador.negociarRenovacion(
        nuevoSueldo, 
        nuevosAnos, 
        equipoUsuario.reputacion || 70
    );

    // Cerrar modal
    document.querySelector('.modal-renovacion')?.remove();

    // Mostrar resultado
    if (resultado.aceptado) {
        noticias.noticia(
            'Contratos',
            '✅ Renovación Aceptada',
            `${jugador.nombre} ha aceptado la renovación. Nuevo sueldo: €${resultado.detalles.sueldoNuevo.toLocaleString()}/mes. Vencimiento: ${resultado.detalles.anoVencimiento}`,
            liga.fechaActual
        );
        renderNoticias();
    } else {
        noticias.noticia(
            'Contratos',
            '❌ Renovación Rechazada',
            resultado.razon,
            liga.fechaActual
        );
        renderNoticias();
    }

    // Actualizar vista
    renderPlantillaContratos();
}

/**
 * Sobrescribir renderPlantillaCompleta para incluir vista de contratos
 */
const renderPlantillaCompletaOriginal = renderPlantillaCompleta;

function renderPlantillaCompleta() {
    if (vistaContratos) {
        renderPlantillaContratos();
    } else {
        renderPlantillaCompletaOriginal();
    }

    // Agregar botón de alternancia
    const contenido = document.getElementById('plantilla-contenido');
    if (contenido && !contenido.querySelector('.btn-vista-toggle')) {
        const botonToggle = document.createElement('button');
        botonToggle.className = 'btn btn-vista-toggle';
        botonToggle.textContent = '📋 Ver Contratos';
        botonToggle.style.marginBottom = '20px';
        botonToggle.onclick = alternarVistaContratos;
        contenido.parentElement.insertBefore(botonToggle, contenido);
    }
}
