// FRAGMENTOS A AGREGAR A js/main.js

// ============ GESTIÓN DE PESTAÑAS ============
function inicializarPestanas() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Desactivar todas las pestañas
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Activar pestaña seleccionada
      btn.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      // Actualizar contenido según pestaña
      if (tabName === 'alineacion') renderizarAlineacion();
      if (tabName === 'finanzas') renderizarFinanzas();
      if (tabName === 'liga') renderizarLiga();
    });
  });
}

// ============ RENDERIZAR EQUIPO ============
function renderizarEquipo(equipo) {
  document.getElementById('equipo-nombre').textContent = equipo.nombre;
  document.getElementById('equipo-presupuesto').textContent = equipo.presupuesto.toFixed(1);
  document.getElementById('equipo-reputacion').textContent = equipo.reputacion;
  document.getElementById('equipo-rating').textContent = equipo.ratingEquipo ? equipo.ratingEquipo() : 'N/A';
  document.getElementById('plantel-count').textContent = equipo.plantel.length;
  
  // Listar jugadores del plantel
  const plantelList = document.getElementById('plantel-list');
  plantelList.innerHTML = equipo.plantel.map(j => `
    <div class="jugador-item">
      <strong>${j.nombre}</strong> (${j.posicion})
      <p>Rating: ${j.calcularPromedio ? j.calcularPromedio() : 'N/A'}</p>
      <p>Sueldo: $${j.sueldo}M/mes</p>
    </div>
  `).join('');
}

// ============ ALINEACIÓN TÁCTICA ============
function renderizarAlineacion() {
  const equipo = window.equipoActual; // Asumir que existe una variable global
  
  // Renderizar titulares
  const titularesList = document.getElementById('titulares-list');
  titularesList.innerHTML = equipo.alineacionTitular.map(j => `
    <div class="jugador-card titular" data-jugador-id="${j.id}" onclick="alternarJugador('${j.id}')">
      <strong>${j.nombre}</strong>
      <p>${j.posicion}</p>
      <p>Rating: ${j.calcularPromedio ? j.calcularPromedio() : 'N/A'}</p>
    </div>
  `).join('');
  
  // Renderizar banco
  const banco = equipo.obtenerBanco ? equipo.obtenerBanco() : [];
  const bancoList = document.getElementById('banco-list');
  bancoList.innerHTML = banco.map(j => `
    <div class="jugador-card banco" data-jugador-id="${j.id}" onclick="alternarJugador('${j.id}')">
      <strong>${j.nombre}</strong>
      <p>${j.posicion}</p>
      <p>Rating: ${j.calcularPromedio ? j.calcularPromedio() : 'N/A'}</p>
    </div>
  `).join('');
  
  // Validar alineación
  const validacion = equipo.validarAlineacion ? equipo.validarAlineacion() : { valido: true };
  const msgElement = document.getElementById('validacion-alineacion');
  if (validacion.valido) {
    msgElement.textContent = '✓ Alineación válida';
    msgElement.className = 'validacion-msg success';
  } else {
    msgElement.textContent = '✗ ' + validacion.error;
    msgElement.className = 'validacion-msg error';
  }
  
  // Renderizar selector por posición
  renderizarSelectorPosiciones(equipo);
}

function alternarJugador(jugadorId) {
  const equipo = window.equipoActual;
  const resultado = equipo.alternarJugadorAlineacion(jugadorId);
  
  if (resultado.exito) {
    console.log(resultado.mensaje);
    renderizarAlineacion();
  } else {
    alert(resultado.error);
  }
}

function renderizarSelectorPosiciones(equipo) {
  const posBtns = document.querySelectorAll('.pos-btn');
  const posicionesList = document.getElementById('posiciones-list');
  
  const jugadoresPorPos = equipo.obtenerJugadoresPorPosicion ? equipo.obtenerJugadoresPorPosicion() : {};
  
  posBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      posBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const posicion = btn.dataset.pos;
      const jugadores = jugadoresPorPos[posicion] || [];
      
      posicionesList.innerHTML = jugadores.map(j => {
        const esTitular = equipo.alineacionTitular.some(t => t.id === j.id);
        return `
          <div class="jugador-card ${esTitular ? 'titular' : ''}" data-jugador-id="${j.id}" onclick="alternarJugador('${j.id}')">
            <strong>${j.nombre}</strong>
            <p>${j.posicion}</p>
            <p>Rating: ${j.calcularPromedio ? j.calcularPromedio() : 'N/A'}</p>
            <p>${esTitular ? '(TITULAR)' : '(Banco)'}</p>
          </div>
        `;
      }).join('');
    });
  });
  
  // Activar primer botón por defecto
  if (posBtns.length > 0) {
    posBtns[0].click();
  }
}

// ============ FINANZAS ============
function renderizarFinanzas() {
  const equipo = window.equipoActual;
  
  const gastos = equipo.calcularGastosSueldos ? equipo.calcularGastosSueldos() : 0;
  const ingresos = 0; // Se calcula al procesar la fecha
  
  document.getElementById('fin-presupuesto').textContent = equipo.presupuesto.toFixed(1);
  document.getElementById('fin-gastos').textContent = gastos.toFixed(1);
  document.getElementById('fin-ingresos').textContent = ingresos.toFixed(1);
  document.getElementById('fin-ocupacion').textContent = '0';
  document.getElementById('fin-balance').textContent = `$${(ingresos - gastos).toFixed(1)}M`;
}

function procesarBalanceFecha() {
  const equipo = window.equipoActual;
  const liga = window.ligaActual;
  
  if (!equipo.procesarBalanceFecha) {
    alert('Método procesarBalanceFecha no disponible');
    return;
  }
  
  const resultado = equipo.procesarBalanceFecha(50); // 50 = precio entrada
  
  // Mostrar resultado
  const resultadoDiv = document.getElementById('balance-resultado');
  resultadoDiv.innerHTML = `
    <div class="card">
      <h4>Resultado de la Fecha</h4>
      <p>Ingresos: +$${resultado.ingresos.toFixed(1)}M (${resultado.detalles.ocupacion}% ocupación)</p>
      <p>Gastos: -$${resultado.gastos.toFixed(1)}M</p>
      <p><strong>Balance: ${resultado.balance > 0 ? '+' : ''}$${resultado.balance.toFixed(1)}M</strong></p>
      <p>Presupuesto actual: $${resultado.presupuestoActual.toFixed(1)}M</p>
    </div>
  `;
  
  // Registrar en historial
  agregarTransaccion('Balance Fecha', resultado.balance, resultado.presupuestoActual);
  
  // Actualizar UI
  renderizarFinanzas();
}

function agregarTransaccion(concepto, monto, balance) {
  const tbody = document.getElementById('transacciones-body');
  const fecha = new Date().toLocaleDateString();
  
  const row = `
    <tr>
      <td>${fecha}</td>
      <td>${concepto}</td>
      <td class="${monto > 0 ? 'positivo' : 'negativo'}">${monto > 0 ? '+' : ''}$${Math.abs(monto).toFixed(1)}M</td>
      <td>$${balance.toFixed(1)}M</td>
    </tr>
  `;
  
  tbody.insertAdjacentHTML('afterbegin', row);
}

// ============ TABLA DE POSICIONES Y LIGA ============
function renderizarLiga() {
  const liga = window.ligaActual;
  
  if (!liga) {
    console.error('Liga no inicializada');
    return;
  }
  
  // Actualizar fecha actual
  document.getElementById('liga-fecha').textContent = liga.fechaActual;
  
  // Próximo partido
  const proximoPartido = liga.obtenerProximoPartidoEquipo ? 
    liga.obtenerProximoPartidoEquipo(window.equipoActual.id) : null;
  
  const proximoDiv = document.getElementById('proximo-partido');
  if (proximoPartido) {
    proximoDiv.innerHTML = `
      <p><strong>${proximoPartido.local}</strong> vs <strong>${proximoPartido.visitante}</strong></p>
      <p>Fecha ${proximoPartido.fecha}</p>
    `;
  } else {
    proximoDiv.innerHTML = '<p>No hay más partidos</p>';
  }
  
  // Tabla de posiciones
  const tabla = liga.obtenerTablaOrdenada ? liga.obtenerTablaOrdenada() : [];
  const tbody = document.getElementById('tabla-body');
  
  tbody.innerHTML = tabla.map((equipo, idx) => `
    <tr ${equipo.equipoId === window.equipoActual.id ? 'style="background: #e8f4f8; font-weight: bold;"' : ''}>
      <td>${idx + 1}</td>
      <td>${equipo.nombre}</td>
      <td>${equipo.pj}</td>
      <td>${equipo.pg}</td>
      <td>${equipo.pe}</td>
      <td>${equipo.pp}</td>
      <td>${equipo.gf}</td>
      <td>${equipo.gc}</td>
      <td>${equipo.dg}</td>
      <td><strong>${equipo.puntos}</strong></td>
    </tr>
  `).join('');
  
  // Zona de Champions
  const champions = liga.obtenerZonaChampions ? liga.obtenerZonaChampions() : [];
  document.getElementById('zona-champions').innerHTML = champions.map(e => 
    `<div class="equipo-zona">${e.nombre} - ${e.puntos} pts</div>`
  ).join('');
  
  // Zona de Descenso
  const descenso = liga.obtenerZonaDescenso ? liga.obtenerZonaDescenso() : [];
  document.getElementById('zona-descenso').innerHTML = descenso.map(e => 
    `<div class="equipo-zona">${e.nombre} - ${e.puntos} pts</div>`
  ).join('');
  
  // Partidos de la fecha
  const partidos = liga.obtenerPartidosFecha ? liga.obtenerPartidosFecha(liga.fechaActual) : [];
  const partidosDiv = document.getElementById('partidos-fecha');
  
  partidosDiv.innerHTML = partidos.map(p => `
    <div class="partido-card">
      <p><strong>${p.local}</strong> ${p.jugado ? p.golesLocal : '-'} vs ${p.jugado ? p.golesVisitante : '-'} <strong>${p.visitante}</strong></p>
      <p>${p.jugado ? 'Jugado' : 'Pendiente'}</p>
    </div>
  `).join('');
}

function simularFecha() {
  const liga = window.ligaActual;
  const equipo = window.equipoActual;
  
  if (!liga.simularFechaActual) {
    alert('Método simularFechaActual no disponible');
    return;
  }
  
  const resultados = liga.simularFechaActual(equipo.id);
  
  console.log(`Fecha ${liga.fechaActual} simulada. ${resultados.length} partidos jugados.`);
  
  renderizarLiga();
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
  inicializarPestanas();
  
  // Agregar listeners a botones
  const procesarBalanceBtn = document.getElementById('procesar-balance-btn');
  if (procesarBalanceBtn) {
    procesarBalanceBtn.addEventListener('click', procesarBalanceFecha);
  }
  
  const simularFechaBtn = document.getElementById('simular-fecha-btn');
  if (simularFechaBtn) {
    simularFechaBtn.addEventListener('click', simularFecha);
  }
  
  // Renderizar equipo inicial
  if (window.equipoActual) {
    renderizarEquipo(window.equipoActual);
  }
});
