/**
 * Extensiones de Jugador.js - Lesiones, Tarjetas y Progresión
 * Agregar estos métodos a la clase Jugador existente
 */

// ============ PROPIEDADES A AGREGAR AL CONSTRUCTOR ============
// En el constructor de Jugador, agregar:
// this.lesionado = false;
// this.semanasLesion = 0;
// this.tarjetasAmarillas = 0;
// this.suspendido = false;
// this.energia = 100; // 0-100
// this.potencial = atributos.potencial || 85; // Potencial de crecimiento

// ============ MÉTODO: ACTUALIZAR ESTADO POST-PARTIDO ============
export function actualizarEstadoPostPartido(jugador, esfuerzo = 0.7) {
  // Reducir energía según esfuerzo del partido
  const reduccionEnergia = esfuerzo * (Math.random() * 30 + 20); // 20-50% de reducción
  jugador.energia = Math.max(0, jugador.energia - reduccionEnergia);

  // Probabilidad de lesión si energía baja
  const probabilidadLesion = (1 - jugador.energia / 100) * 0.15; // Máximo 15% si energía = 0

  if (Math.random() < probabilidadLesion && !jugador.lesionado) {
    jugador.lesionado = true;
    jugador.semanasLesion = Math.floor(Math.random() * 4) + 1; // 1-4 semanas
  }

  // Recuperación gradual de energía
  jugador.energia = Math.min(100, jugador.energia + 15); // Recupera 15 puntos por día de descanso
}

// ============ MÉTODO: DECRECER SEMANAS DE LESIÓN ============
export function decrementarSemanasLesion(jugador) {
  if (jugador.lesionado && jugador.semanasLesion > 0) {
    jugador.semanasLesion--;

    if (jugador.semanasLesion === 0) {
      jugador.lesionado = false;
      jugador.energia = Math.min(100, jugador.energia + 20); // Recupera energía al volver
    }
  }
}

// ============ MÉTODO: REGISTRAR TARJETA ============
export function registrarTarjeta(jugador, tipo = 'amarilla') {
  if (tipo === 'amarilla') {
    jugador.tarjetasAmarillas++;

    // Dos amarillas = roja
    if (jugador.tarjetasAmarillas >= 2) {
      return { expulsado: true, tipo: 'roja_acumulada' };
    }

    return { expulsado: false, tipo: 'amarilla' };
  } else if (tipo === 'roja') {
    return { expulsado: true, tipo: 'roja_directa' };
  }

  return { expulsado: false, tipo: null };
}

// ============ MÉTODO: ACTIVAR SUSPENSIÓN ============
export function activarSuspension(jugador, duracion = 1) {
  jugador.suspendido = true;
  jugador.semanasLesion = duracion; // Reutilizar campo para contar semanas de suspensión
}

// ============ MÉTODO: LIMPIAR TARJETAS (FIN DE TEMPORADA) ============
export function limpiarTarjetas(jugador) {
  jugador.tarjetasAmarillas = 0;
  jugador.suspendido = false;
}

// ============ MÉTODO: CALCULAR ATRIBUTO EFECTIVO (CON LESIÓN) ============
export function calcularAtributoEfectivo(jugador, atributo) {
  let valor = jugador.atributos[atributo] || 50;

  // Reducir atributos si está lesionado
  if (jugador.lesionado) {
    valor *= (1 - (jugador.semanasLesion / 4) * 0.3); // Hasta 30% de reducción
  }

  // Reducir por baja energía
  valor *= (jugador.energia / 100);

  return valor;
}

// ============ FUNCIÓN: PROCESAR FIN DE TEMPORADA ============
export function procesarFinTemporada(plantel) {
  const cambios = [];

  plantel.forEach(jugador => {
    const cambio = {
      jugador: jugador.nombre,
      edad: jugador.edad,
      cambios: {}
    };

    // Jugadores jóvenes: crecimiento
    if (jugador.edad < 24) {
      const atributosFisicos = ['velocidad', 'remate', 'pase', 'defensa', 'fisico'];

      atributosFisicos.forEach(attr => {
        const crecimiento = Math.floor(Math.random() * 3) + 1; // +1 a +3
        const nuevoValor = Math.min(jugador.atributos[attr] + crecimiento, 99);
        cambio.cambios[attr] = {
          anterior: jugador.atributos[attr],
          nuevo: nuevoValor,
          diferencia: nuevoValor - jugador.atributos[attr]
        };
        jugador.atributos[attr] = nuevoValor;
      });
    }
    // Jugadores veteranos: declive
    else if (jugador.edad > 32) {
      const atributosAfectados = ['velocidad', 'fisico'];

      atributosAfectados.forEach(attr => {
        const declive = Math.floor(Math.random() * 3) + 1; // -1 a -3
        const nuevoValor = Math.max(jugador.atributos[attr] - declive, 30);
        cambio.cambios[attr] = {
          anterior: jugador.atributos[attr],
          nuevo: nuevoValor,
          diferencia: nuevoValor - jugador.atributos[attr]
        };
        jugador.atributos[attr] = nuevoValor;
      });
    }

    // Limpiar tarjetas y suspensiones
    limpiarTarjetas(jugador);

    if (Object.keys(cambio.cambios).length > 0) {
      cambios.push(cambio);
    }
  });

  return cambios;
}

// ============ FUNCIÓN: VALIDAR DISPONIBILIDAD PARA PARTIDO ============
export function validarDisponibilidadPartido(jugador) {
  return {
    disponible: !jugador.lesionado && !jugador.suspendido,
    razon: jugador.lesionado ? `Lesionado (${jugador.semanasLesion} semanas)` :
           jugador.suspendido ? 'Suspendido' : 'Disponible'
  };
}

export {
  actualizarEstadoPostPartido,
  decrementarSemanasLesion,
  registrarTarjeta,
  activarSuspension,
  limpiarTarjetas,
  calcularAtributoEfectivo,
  procesarFinTemporada,
  validarDisponibilidadPartido
};
