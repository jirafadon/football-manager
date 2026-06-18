// FRAGMENTO A AGREGAR A LA CLASE EQUIPO EN js/models/Equipo.js

// Calcula el gasto total de sueldos mensuales del plantel
calcularGastosSueldos() {
  return this.plantel.reduce((total, jugador) => total + (jugador.sueldo || 0), 0);
}

// Calcula ingresos por entradas basado en capacidad del estadio y reputación
recaudarEntradas(precioEntrada = 50) {
  // Capacidad base del estadio (simulada)
  const capacidadEstadio = 60000;
  
  // Factor de ocupación: entre 0.7 y 1.0, influenciado por reputación
  const factorReputacion = this.reputacion / 100;
  const ocupacionBase = 0.7 + (factorReputacion * 0.3);
  const ocupacionAleatoria = ocupacionBase + (Math.random() * 0.1 - 0.05);
  const ocupacionFinal = Math.max(0.7, Math.min(1.0, ocupacionAleatoria));
  
  // Calcular ingresos
  const asistencia = Math.floor(capacidadEstadio * ocupacionFinal);
  const ingresos = asistencia * precioEntrada;
  
  this.presupuesto += ingresos;
  
  return {
    asistencia,
    ingresos,
    ocupacion: (ocupacionFinal * 100).toFixed(1)
  };
}

// Procesa el balance de la fecha: recauda entradas y resta sueldos
procesarBalanceFecha(precioEntrada = 50) {
  const ingresos = this.recaudarEntradas(precioEntrada);
  const gastos = this.calcularGastosSueldos();
  
  this.presupuesto -= gastos;
  
  return {
    ingresos: ingresos.ingresos,
    gastos,
    balance: ingresos.ingresos - gastos,
    presupuestoActual: this.presupuesto,
    detalles: ingresos
  };
}

// Valida que la alineación sea correcta (11 jugadores, al menos 1 arquero)
validarAlineacion() {
  if (this.alineacionTitular.length !== 11) {
    return { valido: false, error: 'Debe haber exactamente 11 titulares' };
  }
  
  const arqueros = this.alineacionTitular.filter(j => j.posicion === 'ARQ');
  if (arqueros.length < 1) {
    return { valido: false, error: 'Debe haber al menos 1 arquero' };
  }
  
  return { valido: true };
}

// Alterna un jugador entre titular y banco
alternarJugadorAlineacion(jugadorId) {
  const jugador = this.plantel.find(j => j.id === jugadorId);
  if (!jugador) return { exito: false, error: 'Jugador no encontrado' };
  
  const enTitulares = this.alineacionTitular.some(j => j.id === jugadorId);
  
  if (enTitulares) {
    // Remover de titulares
    this.alineacionTitular = this.alineacionTitular.filter(j => j.id !== jugadorId);
    return { exito: true, accion: 'removido', mensaje: `${jugador.nombre} movido al banco` };
  } else {
    // Agregar a titulares si hay espacio
    if (this.alineacionTitular.length >= 11) {
      return { exito: false, error: 'Ya hay 11 titulares. Remueve uno primero.' };
    }
    
    this.alineacionTitular.push(jugador);
    return { exito: true, accion: 'agregado', mensaje: `${jugador.nombre} agregado a titulares` };
  }
}

// Obtiene jugadores agrupados por posición
obtenerJugadoresPorPosicion() {
  const posiciones = { ARQ: [], DEF: [], MED: [], DEL: [] };
  
  this.plantel.forEach(jugador => {
    if (posiciones[jugador.posicion]) {
      posiciones[jugador.posicion].push(jugador);
    }
  });
  
  return posiciones;
}

// Obtiene el banco (jugadores no titulares)
obtenerBanco() {
  const idsT itulares = new Set(this.alineacionTitular.map(j => j.id));
  return this.plantel.filter(j => !idsTitulares.has(j.id));
}
