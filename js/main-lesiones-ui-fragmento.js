// FRAGMENTOS A AGREGAR A js/main.js

// ============ IMPORTAR AL INICIO ============
// import { procesarFinTemporada, validarDisponibilidadPartido, generarReporteLesiones } from './lib/models/Jugador-extensiones.js';

// ============ MODIFICAR FUNCIÓN renderPlantilla() ============
// REEMPLAZAR la sección que renderiza jugadores con esta versión mejorada:

function renderPlantillaConIndicadores(equipo) {
  const contenedor = document.getElementById('plantilla-list');
  if (!contenedor) return;

  contenedor.innerHTML = equipo.plantel.map(jugador => {
    const disponibilidad = validarDisponibilidadPartido(jugador);
    const esTitular = equipo.alineacionTitular && equipo.alineacionTitular.some(j => j.id === jugador.id);
    const overall = jugador.calcularPromedio ? jugador.calcularPromedio() : 70;

    let badgeHTML = '';
    let claseCard = 'jugador-card';

    // Indicadores visuales
    if (jugador.lesionado) {
      badgeHTML += `<span class="badge badge-lesion">🏥 LESIONADO - ${jugador.semanasLesion}s</span>`;
      claseCard += ' lesionado';
    }

    if (jugador.suspendido) {
      badgeHTML += `<span class="badge badge-suspension">⛔ SUSPENDIDO</span>`;
      claseCard += ' suspendido';
    }

    if (jugador.tarjetasAmarillas > 0) {
      badgeHTML += `<span class="badge badge-tarjetas">🟨 ${jugador.tarjetasAmarillas} Amarilla${jugador.tarjetasAmarillas > 1 ? 's' : ''}</span>`;
    }

    // Indicador de energía baja
    if ((jugador.energia || 100) < 30) {
      badgeHTML += `<span class="badge badge-energia">⚡ Energía baja</span>`;
    }

    if (esTitular) {
      claseCard += ' titular';
    }

    return `
      <div class="${claseCard}" data-jugador-id="${jugador.id}">
        <div class="jugador-header">
          <div class="jugador-nombre">${jugador.nombre}</div>
          <span class="jugador-posicion">${jugador.posicion}</span>
        </div>

        ${badgeHTML ? `<div class="jugador-badges">${badgeHTML}</div>` : ''}

        <div class="jugador-stats">
          <p>Overall: <strong>${overall.toFixed(1)}</strong></p>
          <p>Edad: ${jugador.edad} años</p>
          <p>Energía: <strong>${(jugador.energia || 100).toFixed(0)}%</strong></p>
        </div>

        <div class="jugador-acciones">
          <button 
            class="btn-seleccionar-jugador" 
            onclick="alternarJugadorAlineacion('${jugador.id}')"
            ${!disponibilidad.disponible ? 'disabled title="' + disponibilidad.razon + '"' : ''}
          >
            ${esTitular ? '✓ Titular' : 'Seleccionar'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============ ESTILOS CSS PARA INDICADORES ============
const estilosIndicadores = `
  .jugador-card {
    background: white;
    border: 2px solid #ddd;
    border-radius: 6px;
    padding: 12px;
    transition: all 0.2s;
    position: relative;
  }

  .jugador-card.titular {
    border-color: #0066cc;
    background: #e8f4f8;
    box-shadow: 0 2px 8px rgba(0,102,204,0.2);
  }

  .jugador-card.lesionado {
    opacity: 0.6;
    background: #fff5f5;
  }

  .jugador-card.suspendido {
    opacity: 0.6;
    background: #fffbf0;
  }

  .jugador-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0;
  }

  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
    white-space: nowrap;
  }

  .badge-lesion {
    background: #ffebee;
    color: #c62828;
    border-left: 3px solid #f44336;
  }

  .badge-suspension {
    background: #fff3e0;
    color: #e65100;
    border-left: 3px solid #ff9800;
  }

  .badge-tarjetas {
    background: #fff9c4;
    color: #f57f17;
    border-left: 3px solid #fbc02d;
  }

  .badge-energia {
    background: #f3e5f5;
    color: #6a1b9a;
    border-left: 3px solid #9c27b0;
  }

  .btn-seleccionar-jugador:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #ccc;
  }
`;

// ============ MODIFICAR FUNCIÓN alternarJugadorAlineacion() ============
// AGREGAR validación de disponibilidad:

function alternarJugadorAlineacionConValidacion(jugadorId) {
  const equipo = window.equipoActual;
  const jugador = equipo.plantel.find(j => j.id === jugadorId);

  if (!jugador) {
    log('Jugador no encontrado', 'error');
    return;
  }

  // Validar disponibilidad
  const disponibilidad = validarDisponibilidadPartido(jugador);
  if (!disponibilidad.disponible) {
    log(`❌ No puedes alinear a ${jugador.nombre}: ${disponibilidad.razon}`, 'error');
    return;
  }

  // Validar que no haya lesionados/suspendidos en alineación
  const esTitular = equipo.alineacionTitular.some(j => j.id === jugadorId);

  if (!esTitular) {
    // Intentando agregar a titulares
    const alineacionValida = equipo.alineacionTitular.filter(j => 
      !j.lesionado && !j.suspendido
    );

    if (alineacionValida.length >= 11) {
      log('❌ Ya tienes 11 titulares disponibles', 'warning');
      return;
    }

    equipo.alineacionTitular.push(jugador);
    log(`✓ ${jugador.nombre} agregado a titulares`, 'success');
  } else {
    // Remover de titulares
    equipo.alineacionTitular = equipo.alineacionTitular.filter(j => j.id !== jugadorId);
    log(`✓ ${jugador.nombre} removido de titulares`, 'info');
  }

  // Actualizar UI
  renderPlantillaConIndicadores(equipo);
}

// ============ MOSTRAR REPORTE DE FIN DE TEMPORADA ============
function mostrarReporteFinTemporada(cambios, plantel) {
  const modal = document.getElementById('modal-fin-temporada');
  if (!modal) return;

  // Separar cambios positivos y negativos
  const cambiosPositivos = cambios.filter(c => 
    Object.values(c.cambios).some(ch => ch.diferencia > 0)
  );
  const cambiosNegativos = cambios.filter(c => 
    Object.values(c.cambios).some(ch => ch.diferencia < 0)
  );

  // Renderizar jugadores en ascenso
  const ascensoDiv = document.getElementById('jugadores-ascenso');
  ascensoDiv.innerHTML = cambiosPositivos.map(c => {
    const atributosSubidos = Object.entries(c.cambios)
      .filter(([_, ch]) => ch.diferencia > 0)
      .map(([attr, ch]) => `${attr} ${ch.anterior}→${ch.nuevo}`)
      .join(', ');

    return `
      <div class="cambio-item positivo">
        <div class="cambio-nombre">🌟 ${c.jugador}</div>
        <div class="cambio-detalle">${atributosSubidos}</div>
      </div>
    `;
  }).join('');

  // Renderizar jugadores en declive
  const decliveDiv = document.getElementById('jugadores-declive');
  decliveDiv.innerHTML = cambiosNegativos.map(c => {
    const atributosBajados = Object.entries(c.cambios)
      .filter(([_, ch]) => ch.diferencia < 0)
      .map(([attr, ch]) => `${attr} ${ch.anterior}→${ch.nuevo}`)
      .join(', ');

    return `
      <div class="cambio-item negativo">
        <div class="cambio-nombre">📉 ${c.jugador}</div>
        <div class="cambio-detalle">${atributosBajados}</div>
      </div>
    `;
  }).join('');

  // Estadísticas de salud
  const reporte = generarReporteLesiones(plantel);
  document.getElementById('total-lesiones').textContent = reporte.lesionados.length;
  document.getElementById('total-suspensiones').textContent = reporte.suspendidos.length;
  document.getElementById('total-tarjetas').textContent = plantel.reduce((sum, j) => sum + (j.tarjetasAmarillas || 0), 0);
  document.getElementById('plantilla-disponible').textContent = reporte.disponibles;

  // Resumen de cambios
  const resumenDiv = document.getElementById('resumen-cambios');
  let resumenHTML = '';

  if (cambiosPositivos.length > 0) {
    resumenHTML += `<div class="resumen-parrafo">✅ <strong>${cambiosPositivos.length}</strong> jugador${cambiosPositivos.length > 1 ? 'es' : ''} han mejorado sus atributos gracias a su potencial y desempeño.</div>`;
  }

  if (cambiosNegativos.length > 0) {
    resumenHTML += `<div class="resumen-parrafo">⚠️ <strong>${cambiosNegativos.length}</strong> jugador${cambiosNegativos.length > 1 ? 'es' : ''} ha${cambiosNegativos.length > 1 ? 'n' : ''} experimentado declive en sus atributos físicos por edad.</div>`;
  }

  if (reporte.lesionados.length > 0) {
    resumenHTML += `<div class="resumen-parrafo">🏥 <strong>${reporte.lesionados.length}</strong> jugador${reporte.lesionados.length > 1 ? 'es' : ''} requieren atención médica.</div>`;
  }

  if (reporte.suspendidos.length > 0) {
    resumenHTML += `<div class="resumen-parrafo">⛔ <strong>${reporte.suspendidos.length}</strong> jugador${reporte.suspendidos.length > 1 ? 'es' : ''} está${reporte.suspendidos.length > 1 ? 'n' : ''} suspendido${reporte.suspendidos.length > 1 ? 's' : ''}.</div>`;
  }

  resumenHTML += `<div class="resumen-parrafo">📊 Tu plantilla cuenta con <strong>${reporte.disponibles}</strong> jugadores disponibles para la próxima temporada.</div>`;

  resumenDiv.innerHTML = resumenHTML;

  // Mostrar modal
  modal.style.display = 'flex';
}

// ============ CERRAR MODAL DE FIN DE TEMPORADA ============
function cerrarModalFinTemporada() {
  const modal = document.getElementById('modal-fin-temporada');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ============ PROCESAR FIN DE TEMPORADA ============
function procesarFinDeTemporada(equipo) {
  const cambios = procesarFinTemporada(equipo.plantel);

  log('📊 Fin de temporada procesado', 'info');
  log(`✅ ${cambios.length} jugadores han experimentado cambios de atributos`, 'success');

  // Mostrar reporte
  mostrarReporteFinTemporada(cambios, equipo.plantel);
}

// ============ AGREGAR EVENT LISTENERS AL MODAL ============
document.addEventListener('DOMContentLoaded', () => {
  const btnCerrarModal = document.getElementById('btn-cerrar-modal-temporada');
  const btnAceptarTemporada = document.getElementById('btn-aceptar-temporada');

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModalFinTemporada);
  }

  if (btnAceptarTemporada) {
    btnAceptarTemporada.addEventListener('click', () => {
      cerrarModalFinTemporada();
      log('✓ Temporada finalizada. ¡Preparado para la próxima!', 'success');
    });
  }

  // Cerrar modal al hacer clic fuera
  const modal = document.getElementById('modal-fin-temporada');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalFinTemporada();
      }
    });
  }
});

// ============ AGREGAR ESTILOS AL HEAD ============
// Agregar en el <head> del index.html o en un <style> tag:
// const style = document.createElement('style');
// style.textContent = estilosIndicadores;
// document.head.appendChild(style);
