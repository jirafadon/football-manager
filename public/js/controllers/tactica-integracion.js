/**
 * INTEGRACIÓN DE TÁCTICAS
 * Funciones para integrar el sistema de tácticas en el controlador principal
 */

let tacticaManager = null;

/**
 * Inicializar el gestor de tácticas
 */
function inicializarTactica() {
    tacticaManager = new TacticaManager('pizarra-tactica');
    console.log('✓ Sistema de Tácticas inicializado');
}

/**
 * Cargar los 11 titulares en la pizarra táctica
 */
function cargarTitularesEnPizarra() {
    if (!tacticaManager || !equipoUsuario) return;
    
    const titulares = equipoUsuario.alineacionTitular;
    if (titulares.length === 0) {
        console.warn('⚠ No hay titulares cargados');
        return;
    }
    
    // Limpiar pizarra
    tacticaManager.jugadores = [];
    
    // Agregar jugadores
    titulares.forEach((jugador, idx) => {
        tacticaManager.agregarJugador(
            jugador.id,
            jugador.numero,
            jugador.nombre,
            0, // x (se ajustará con formación)
            0  // y (se ajustará con formación)
        );
    });
    
    // Establecer formación por defecto
    establecerFormacionTactica('4-3-3');
}

/**
 * Cambiar formación en la pizarra
 */
function establecerFormacionTactica(formacion) {
    if (!tacticaManager) return;
    tacticaManager.establecerFormacion(formacion);
}

/**
 * Obtener las instrucciones tácticas
 */
function obtenerInstruccionesTacticas() {
    if (!tacticaManager) return {};
    return tacticaManager.obtenerInstrucciones();
}

/**
 * Limpiar todas las flechas tácticas
 */
function limpiarFlechasTacticas() {
    if (!tacticaManager) return;
    tacticaManager.limpiarFlechas();
}

/**
 * Aplicar instrucciones tácticas al motor de partido
 * Llamar desde MotorPartido cuando el equipo tiene posesión
 */
function aplicarInstruccionesTacticas(equipo) {
    if (!tacticaManager || !equipo) return;
    
    const instrucciones = tacticaManager.obtenerInstrucciones();
    
    // Aplicar offsets a las posiciones de los jugadores
    equipo.alineacionTitular.forEach((jugador) => {
        if (instrucciones[jugador.id]) {
            const { offsetX, offsetY } = instrucciones[jugador.id];
            
            // Guardar posición ideal con offset
            if (!jugador.posicionIdeal) {
                jugador.posicionIdeal = { x: jugador.x, y: jugador.y };
            }
            
            jugador.posicionIdeal.x += offsetX * 0.1; // Escalar el offset
            jugador.posicionIdeal.y += offsetY * 0.1;
        }
    });
}

/**
 * Renderizar la pizarra táctica
 */
function renderizarPizarraTactica() {
    if (!tacticaManager) return;
    tacticaManager.dibujar();
}

/**
 * Agregar canvas de pizarra táctica al HTML
 * Llamar desde el inicializador
 */
function agregarCanvasPizarra() {
    const plantillaSection = document.getElementById('plantilla');
    if (!plantillaSection) return;
    
    // Verificar si ya existe
    if (document.getElementById('pizarra-tactica')) return;
    
    // Crear contenedor
    const contenedor = document.createElement('div');
    contenedor.style.marginTop = '30px';
    contenedor.style.padding = '20px';
    contenedor.style.background = '#f9f9f9';
    contenedor.style.borderRadius = '8px';
    
    // Título
    const titulo = document.createElement('h3');
    titulo.textContent = '📋 Pizarra Táctica';
    titulo.style.marginBottom = '15px';
    titulo.style.color = '#0066cc';
    
    // Controles
    const controles = document.createElement('div');
    controles.style.marginBottom = '15px';
    controles.style.display = 'flex';
    controles.style.gap = '10px';
    controles.style.flexWrap = 'wrap';
    
    const btnFormacion433 = document.createElement('button');
    btnFormacion433.textContent = '4-3-3';
    btnFormacion433.className = 'btn';
    btnFormacion433.onclick = () => establecerFormacionTactica('4-3-3');
    btnFormacion433.style.padding = '8px 16px';
    btnFormacion433.style.fontSize = '12px';
    
    const btnFormacion4231 = document.createElement('button');
    btnFormacion4231.textContent = '4-2-3-1';
    btnFormacion4231.className = 'btn';
    btnFormacion4231.onclick = () => establecerFormacionTactica('4-2-3-1');
    btnFormacion4231.style.padding = '8px 16px';
    btnFormacion4231.style.fontSize = '12px';
    
    const btnLimpiar = document.createElement('button');
    btnLimpiar.textContent = '🗑 Limpiar Flechas';
    btnLimpiar.className = 'btn';
    btnLimpiar.style.background = 'linear-gradient(135deg, #ff6666 0%, #cc3333 100%)';
    btnLimpiar.onclick = limpiarFlechasTacticas;
    btnLimpiar.style.padding = '8px 16px';
    btnLimpiar.style.fontSize = '12px';
    
    controles.appendChild(btnFormacion433);
    controles.appendChild(btnFormacion4231);
    controles.appendChild(btnLimpiar);
    
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'pizarra-tactica';
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.border = '2px solid #ddd';
    canvas.style.borderRadius = '8px';
    canvas.style.background = '#2e7d32';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    // Instrucciones
    const instrucciones = document.createElement('p');
    instrucciones.textContent = '💡 Click derecho (o mantén presionado en móvil) sobre un jugador y arrastra para dibujar una flecha táctica';
    instrucciones.style.fontSize = '12px';
    instrucciones.style.color = '#666';
    instrucciones.style.marginTop = '15px';
    instrucciones.style.fontStyle = 'italic';
    
    contenedor.appendChild(titulo);
    contenedor.appendChild(controles);
    contenedor.appendChild(canvas);
    contenedor.appendChild(instrucciones);
    
    plantillaSection.appendChild(contenedor);
    
    // Inicializar después de agregar al DOM
    inicializarTactica();
    cargarTitularesEnPizarra();
}

/**
 * Llamar después de que se cargue la plantilla
 */
function integrarTacticaEnPlantilla() {
    agregarCanvasPizarra();
}
