// FRAGMENTOS A AGREGAR A js/main.js

// ============ IMPORTAR AL INICIO DEL ARCHIVO ============
// import { realizarOferta, ejecutarTraspaso, ESTADOS_OFERTA, generarJugadoresLibres } from './market/MercadoPases.js';

// ============ VARIABLES GLOBALES ============
let jugadoresLibres = [];
let poolMercado = [];

// ============ RENDERIZAR JUGADORES LIBRES ============
function renderLibres() {
  const listaLibres = document.getElementById('lista-libres');
  const contadorLibres = document.getElementById('contador-libres');
  
  if (!jugadoresLibres || jugadoresLibres.length === 0) {
    listaLibres.innerHTML = '<div class="mercado-vacio"><p>No hay jugadores libres disponibles</p></div>';
    contadorLibres.textContent = '0 disponibles';
    return;
  }
  
  contadorLibres.textContent = `${jugadoresLibres.length} disponibles`;
  
  listaLibres.innerHTML = jugadoresLibres.map(jugador => {
    const precioMercado = jugador.calcularPrecioMercado ? jugador.calcularPrecioMercado() : 50;
    const promedio = jugador.calcularPromedio ? jugador.calcularPromedio() : 75;
    const puedeComprar = window.equipoActual && window.equipoActual.presupuesto >= precioMercado;
    
    return `
      <div class="jugador-mercado-card" data-jugador-id="${jugador.id}">
        <div class="jugador-mercado-header">
          <div>
            <div class="jugador-mercado-nombre">${jugador.nombre}</div>
            <div class="jugador-mercado-edad">Edad: ${jugador.edad} años</div>
          </div>
          <span class="jugador-mercado-posicion">${jugador.posicion}</span>
        </div>
        
        <div class="jugador-mercado-stats">
          <div class="stat-row">
            <span class="stat-label">Rating:</span>
            <span class="stat-value">${promedio.toFixed(1)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Velocidad:</span>
            <span class="stat-value">${jugador.atributos.velocidad}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Remate:</span>
            <span class="stat-value">${jugador.atributos.remate}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Pase:</span>
            <span class="stat-value">${jugador.atributos.pase}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Defensa:</span>
            <span class="stat-value">${jugador.atributos.defensa}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Físico:</span>
            <span class="stat-value">${jugador.atributos.fisico}</span>
          </div>
        </div>
        
        <div class="jugador-mercado-precio">
          <div class="precio-label">Valor de Mercado</div>
          <div class="precio-valor">$${precioMercado.toFixed(1)}M</div>
        </div>
        
        <div class="jugador-mercado-sueldo">
          Sueldo: $${jugador.sueldo}M/mes
        </div>
        
        <div class="jugador-mercado-acciones">
          <input 
            type="number" 
            class="input-sueldo" 
            placeholder="Sueldo ($M)" 
            value="${jugador.sueldo}"
            min="0.5"
            step="0.5"
            data-jugador-id="${jugador.id}"
          />
          <button 
            class="btn-fichar" 
            onclick="ficharJugadorLibre('${jugador.id}')"
            ${puedeComprar ? '' : 'disabled'}
            title="${puedeComprar ? 'Fichar jugador' : 'Presupuesto insuficiente'}"
          >
            Fichar Gratis
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============ FICHAR JUGADOR LIBRE ============
function ficharJugadorLibre(jugadorId) {
  const jugador = jugadoresLibres.find(j => j.id === jugadorId);
  const equipo = window.equipoActual;
  
  if (!jugador || !equipo) {
    log('Error: Jugador o equipo no encontrado', 'error');
    return;
  }
  
  // Obtener sueldo del input
  const inputSueldo = document.querySelector(`input[data-jugador-id="${jugadorId}"]`);
  const sueldoNegociado = parseFloat(inputSueldo.value);
  
  if (isNaN(sueldoNegociado) || sueldoNegociado <= 0) {
    log('Sueldo inválido', 'error');
    return;
  }
  
  // Validar presupuesto para pagar el sueldo
  if (equipo.presupuesto < sueldoNegociado) {
    log(`Presupuesto insuficiente. Necesitas $${sueldoNegociado}M`, 'error');
    return;
  }
  
  // Ejecutar traspaso (jugador libre a nuestro equipo)
  const resultado = ejecutarTraspaso(
    jugador,
    null, // origen: sin club
    equipo,
    0, // precio: gratis
    'FICHAJE_LIBRE'
  );
  
  if (resultado.exito) {
    // Actualizar sueldo del jugador
    jugador.sueldo = sueldoNegociado;
    
    // Restar presupuesto
    equipo.presupuesto -= sueldoNegociado;
    
    // Agregar jugador al plantel
    equipo.plantel.push(jugador);
    
    // Remover de libres
    jugadoresLibres = jugadoresLibres.filter(j => j.id !== jugadorId);
    
    log(`${jugador.nombre} fichado exitosamente. Sueldo: $${sueldoNegociado}M/mes`, 'success');
    
    // Actualizar UI
    renderLibres();
    renderEquipo(equipo);
  } else {
    log(`Error al fichar: ${resultado.error}`, 'error');
  }
}

// ============ RENDERIZAR MERCADO DE EQUIPOS ============
function renderMercado() {
  const listaMercado = document.getElementById('lista-mercado');
  
  if (!poolMercado || poolMercado.length === 0) {
    listaMercado.innerHTML = '<div class="mercado-vacio"><p>No hay jugadores disponibles para transferencia</p></div>';
    return;
  }
  
  listaMercado.innerHTML = poolMercado.map(jugador => {
    const precioMercado = jugador.calcularPrecioMercado ? jugador.calcularPrecioMercado() : 50;
    const promedio = jugador.calcularPromedio ? jugador.calcularPromedio() : 75;
    const clubOrigen = jugador.club ? jugador.club.nombre : 'Libre';
    
    return `
      <div class="jugador-mercado-card" data-jugador-id="${jugador.id}">
        <div class="jugador-mercado-header">
          <div>
            <div class="jugador-mercado-nombre">${jugador.nombre}</div>
            <div class="jugador-mercado-edad">Club: ${clubOrigen} | Edad: ${jugador.edad}</div>
          </div>
          <span class="jugador-mercado-posicion">${jugador.posicion}</span>
        </div>
        
        <div class="jugador-mercado-stats">
          <div class="stat-row">
            <span class="stat-label">Rating:</span>
            <span class="stat-value">${promedio.toFixed(1)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Velocidad:</span>
            <span class="stat-value">${jugador.atributos.velocidad}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Remate:</span>
            <span class="stat-value">${jugador.atributos.remate}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Pase:</span>
            <span class="stat-value">${jugador.atributos.pase}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Defensa:</span>
            <span class="stat-value">${jugador.atributos.defensa}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Físico:</span>
            <span class="stat-value">${jugador.atributos.fisico}</span>
          </div>
        </div>
        
        <div class="jugador-mercado-precio">
          <div class="precio-label">Precio de Mercado</div>
          <div class="precio-valor">$${precioMercado.toFixed(1)}M</div>
        </div>
        
        <div class="jugador-mercado-sueldo">
          Sueldo Actual: $${jugador.sueldo}M/mes
        </div>
        
        <div class="jugador-mercado-acciones">
          <input 
            type="number" 
            class="input-oferta" 
            placeholder="Oferta ($M)" 
            value="${precioMercado.toFixed(1)}"
            min="1"
            step="1"
            data-jugador-id="${jugador.id}"
          />
          <button 
            class="btn-ofertar" 
            onclick="realizarOfertaUI('${jugador.id}')"
            title="Realizar oferta por el jugador"
          >
            Ofertar
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============ REALIZAR OFERTA (UI) ============
function realizarOfertaUI(jugadorId) {
  const jugador = poolMercado.find(j => j.id === jugadorId);
  const equipo = window.equipoActual;
  
  if (!jugador || !equipo) {
    log('Error: Jugador o equipo no encontrado', 'error');
    return;
  }
  
  // Obtener oferta del input
  const inputOferta = document.querySelector(`input[data-jugador-id="${jugadorId}"]`);
  const montoOferta = parseFloat(inputOferta.value);
  
  if (isNaN(montoOferta) || montoOferta <= 0) {
    log('Oferta inválida', 'error');
    return;
  }
  
  // Validar presupuesto
  if (equipo.presupuesto < montoOferta) {
    log(`Presupuesto insuficiente. Necesitas $${montoOferta}M`, 'error');
    return;
  }
  
  // Realizar oferta
  const respuesta = realizarOferta(jugador, equipo, montoOferta);
  
  if (respuesta.estado === ESTADOS_OFERTA.ACEPTADA) {
    // Ejecutar traspaso
    const resultado = ejecutarTraspaso(
      jugador,
      jugador.club,
      equipo,
      montoOferta,
      'TRANSFERENCIA'
    );
    
    if (resultado.exito) {
      // Restar presupuesto
      equipo.presupuesto -= montoOferta;
      
      // Remover del mercado
      poolMercado = poolMercado.filter(j => j.id !== jugadorId);
      
      log(`¡${jugador.nombre} fichado! Transferencia completada por $${montoOferta}M`, 'success');
      
      // Actualizar UI
      renderMercado();
      renderEquipo(equipo);
    }
  } else if (respuesta.estado === ESTADOS_OFERTA.RECHAZADA) {
    log(`Oferta rechazada. El club pide mínimo $${respuesta.precioMinimo}M`, 'warning');
  } else if (respuesta.estado === ESTADOS_OFERTA.A_NEGOCIAR) {
    log(`Oferta en negociación. El club contraoferta: $${respuesta.contraoferta}M`, 'info');
  }
}

// ============ INICIALIZAR MERCADO ============
function inicializarMercado() {
  // Generar jugadores libres
  jugadoresLibres = generarJugadoresLibres(15);
  
  // Agregar botón para refrescar libres
  const btnRefrescar = document.getElementById('btn-refrescar-libres');
  if (btnRefrescar) {
    btnRefrescar.addEventListener('click', () => {
      jugadoresLibres = generarJugadoresLibres(15);
      renderLibres();
      log('Mercado de libres refrescado', 'info');
    });
  }
  
  // Renderizar
  renderLibres();
}

// ============ FUNCIÓN LOG (asumir que existe) ============
// function log(mensaje, tipo = 'info') {
//   console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
//   // Mostrar en UI si existe contenedor de logs
//   const logContainer = document.getElementById('logs');
//   if (logContainer) {
//     const logEntry = document.createElement('div');
//     logEntry.className = `log-entry log-${tipo}`;
//     logEntry.textContent = mensaje;
//     logContainer.appendChild(logEntry);
//     logContainer.scrollTop = logContainer.scrollHeight;
//   }
// }

// ============ INICIALIZAR AL CARGAR ============
document.addEventListener('DOMContentLoaded', () => {
  inicializarMercado();
});
