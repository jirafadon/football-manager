// FRAGMENTOS A AGREGAR A js/main.js

// ============ IMPORTAR AL INICIO (si no está) ============
// import { generarJugadoresLibres, procesarMercadoRival } from './market/MercadoPases.js';

// ============ VARIABLE GLOBAL ============
let poolJugadoresLibres = [];

// ============ RENDERIZAR JUGADORES LIBRES ============
function renderLibres(poolLibres = poolJugadoresLibres) {
  const contenedor = document.getElementById('mercado-libres');
  const contador = document.getElementById('contador-libres');
  
  if (!contenedor) return;
  
  if (!poolLibres || poolLibres.length === 0) {
    contenedor.innerHTML = '<div class="mercado-vacio">No hay agentes libres disponibles</div>';
    contador.textContent = '0 disponibles';
    return;
  }

  contador.textContent = `${poolLibres.length} disponibles`;

  contenedor.innerHTML = poolLibres.map(jugador => {
    const overall = jugador.calcularPromedio ? jugador.calcularPromedio() : 70;
    const puedeComprar = window.equipoUsuario && window.equipoUsuario.presupuesto >= jugador.sueldo;

    return `
      <div class="card-libre" data-jugador-id="${jugador.id}">
        <div class="card-libre-header">
          <div class="card-libre-nombre">${jugador.nombre}</div>
          <span class="card-libre-posicion">${jugador.posicion}</span>
        </div>

        <div class="card-libre-info">
          Edad: ${jugador.edad} años | Sueldo: $${jugador.sueldo}M/sem
        </div>

        <div class="card-libre-stats">
          <div class="stat-row">
            <span class="stat-label">Overall:</span>
            <span class="stat-value">${overall.toFixed(1)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Velocidad:</span>
            <span class="stat-value">${jugador.atributos?.velocidad || 70}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Remate:</span>
            <span class="stat-value">${jugador.atributos?.remate || 70}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Pase:</span>
            <span class="stat-value">${jugador.atributos?.pase || 70}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Defensa:</span>
            <span class="stat-value">${jugador.atributos?.defensa || 70}</span>
          </div>
        </div>

        <div class="card-libre-acciones">
          <button 
            class="btn-fichar-libre" 
            onclick="mostrarInputSueldo('${jugador.id}')"
            ${puedeComprar ? '' : 'disabled'}
            title="${puedeComprar ? 'Fichar este jugador' : 'Presupuesto insuficiente'}"
          >
            Fichar Libre
          </button>
        </div>

        <div id="input-sueldo-${jugador.id}" class="input-sueldo-container" style="display: none; margin-top: 10px;">
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <input 
              type="number" 
              class="input-sueldo-libre" 
              id="sueldo-input-${jugador.id}"
              placeholder="Sueldo ($M/sem)" 
              value="${jugador.sueldo}"
              min="0.1"
              step="0.1"
            />
          </div>
          <div style="display: flex; gap: 6px;">
            <button 
              class="btn-confirmar-sueldo" 
              onclick="confirmarFichaje('${jugador.id}')"
            >
              Confirmar
            </button>
            <button 
              class="btn-cancelar-sueldo" 
              onclick="cancelarFichaje('${jugador.id}')"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============ MOSTRAR INPUT DE SUELDO ============
function mostrarInputSueldo(jugadorId) {
  const inputContainer = document.getElementById(`input-sueldo-${jugadorId}`);
  const boton = document.querySelector(`[data-jugador-id="${jugadorId}"] .btn-fichar-libre`);
  
  if (inputContainer) {
    inputContainer.style.display = 'block';
    boton.style.display = 'none';
    document.getElementById(`sueldo-input-${jugadorId}`).focus();
  }
}

// ============ CANCELAR FICHAJE ============
function cancelarFichaje(jugadorId) {
  const inputContainer = document.getElementById(`input-sueldo-${jugadorId}`);
  const boton = document.querySelector(`[data-jugador-id="${jugadorId}"] .btn-fichar-libre`);
  
  if (inputContainer) {
    inputContainer.style.display = 'none';
    boton.style.display = 'block';
  }
}

// ============ CONFIRMAR FICHAJE ============
function confirmarFichaje(jugadorId) {
  const jugador = poolJugadoresLibres.find(j => j.id === jugadorId);
  const equipo = window.equipoUsuario;
  
  if (!jugador || !equipo) {
    log('Error: Jugador o equipo no encontrado', 'error');
    return;
  }

  // Obtener sueldo del input
  const inputSueldo = document.getElementById(`sueldo-input-${jugadorId}`);
  const sueldoOfrecido = parseFloat(inputSueldo.value);

  if (isNaN(sueldoOfrecido) || sueldoOfrecido <= 0) {
    log('Sueldo inválido', 'error');
    return;
  }

  // Validar presupuesto
  if (equipo.presupuesto < sueldoOfrecido) {
    log(`Presupuesto insuficiente. Necesitas $${sueldoOfrecido}M`, 'error');
    return;
  }

  // Actualizar sueldo del jugador
  jugador.sueldo = sueldoOfrecido;
  jugador.club = equipo;

  // Agregar jugador al plantel
  if (equipo.agregarJugador) {
    equipo.agregarJugador(jugador);
  } else {
    equipo.plantel.push(jugador);
  }

  // Descontar presupuesto
  equipo.presupuesto -= sueldoOfrecido;

  // Remover de libres
  poolJugadoresLibres = poolJugadoresLibres.filter(j => j.id !== jugadorId);

  // Log de éxito
  log(`✓ ${jugador.nombre} fichado exitosamente. Sueldo: $${sueldoOfrecido}M/sem`, 'success');

  // Actualizar UI
  renderLibres();
  if (window.renderEquipo) {
    renderEquipo(equipo);
  }
}

// ============ REFRESCAR POOL DE LIBRES ============
function refrescarPoolLibres() {
  poolJugadoresLibres = generarJugadoresLibres(20);
  renderLibres();
  log('Pool de agentes libres refrescado', 'info');
}

// ============ INICIALIZAR MERCADO DE LIBRES ============
function inicializarMercadoLibres() {
  // Generar pool inicial
  poolJugadoresLibres = generarJugadoresLibres(20);

  // Agregar event listener al botón de refrescar
  const btnRefrescar = document.getElementById('btn-refrescar-libres');
  if (btnRefrescar) {
    btnRefrescar.addEventListener('click', refrescarPoolLibres);
  }

  // Renderizar
  renderLibres();
}

// ============ PROCESAR MERCADO IA (llamar al final de cada fecha) ============
function procesarMercadoIA() {
  const equiposIA = window.equiposLiga ? window.equiposLiga.filter(e => e.id !== window.equipoUsuario.id) : [];
  
  if (equiposIA.length === 0) return;

  const traspasos = procesarMercadoRival(equiposIA, poolJugadoresLibres);

  if (traspasos.length > 0) {
    log(`${traspasos.length} transferencias de IA completadas`, 'info');
    traspasos.forEach(t => {
      log(`${t.jugador}: ${t.origen} → ${t.destino} ($${t.precio}M)`, 'info');
    });
  }
}

// ============ AGREGAR AL DOMContentLoaded ============
// Agregar esta línea dentro del event listener 'DOMContentLoaded':
// inicializarMercadoLibres();

// ============ FUNCIÓN LOG (si no existe) ============
// function log(mensaje, tipo = 'info') {
//   console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
//   const logContainer = document.getElementById('log');
//   if (logContainer) {
//     const entry = document.createElement('div');
//     entry.className = `log-entry log-${tipo}`;
//     entry.textContent = mensaje;
//     logContainer.appendChild(entry);
//     logContainer.scrollTop = logContainer.scrollHeight;
//   }
// }
