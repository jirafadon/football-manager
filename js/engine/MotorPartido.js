/**
 * Motor de Partidos - Simulación rápida de encuentros
 */

export function simularPartidoRapido(equipoLocal, equipoVisitante) {
  const ratingLocal = equipoLocal.ratingEquipo ? equipoLocal.ratingEquipo() : calcularRating(equipoLocal);
  const ratingVisitante = equipoVisitante.ratingEquipo ? equipoVisitante.ratingEquipo() : calcularRating(equipoVisitante);

  // Factor de localía: 15% de ventaja
  const fuerzaLocal = ratingLocal * 1.15;
  const fuerzaVisitante = ratingVisitante;

  // Calcular probabilidad de victoria local usando fórmula de Elo
  const probabilidadLocal = 1 / (1 + Math.pow(10, (fuerzaVisitante - fuerzaLocal) / 40));

  // Generar resultado
  const resultado = generarResultado(probabilidadLocal);

  // Simular goles
  const { golesLocal, golesVisitante } = simularGoles(resultado, fuerzaLocal, fuerzaVisitante);

  return {
    golesLocal,
    golesVisitante,
    resultado,
    probabilidadLocal: probabilidadLocal.toFixed(3)
  };
}

function calcularRating(equipo) {
  if (!equipo.alineacionTitular || equipo.alineacionTitular.length === 0) {
    return 50;
  }

  const promedio = equipo.alineacionTitular.reduce((sum, jugador) => {
    return sum + (jugador.calcularPromedio ? jugador.calcularPromedio() : 50);
  }, 0) / equipo.alineacionTitular.length;

  return Math.min(100, Math.max(0, promedio));
}

function generarResultado(probabilidadLocal) {
  const aleatorio = Math.random();
  const probEmpate = 0.25;
  const probVictoriaLocal = probabilidadLocal * (1 - probEmpate);

  if (aleatorio < probVictoriaLocal) {
    return 'LOCAL';
  } else if (aleatorio < probVictoriaLocal + probEmpate) {
    return 'EMPATE';
  } else {
    return 'VISITANTE';
  }
}

function simularGoles(resultado, fuerzaLocal, fuerzaVisitante) {
  const tasaGolesLocal = (fuerzaLocal / 100) * 2.5;
  const tasaGolesVisitante = (fuerzaVisitante / 100) * 2.5;

  let golesLocal = generarGolesPoisson(tasaGolesLocal);
  let golesVisitante = generarGolesPoisson(tasaGolesVisitante);

  // Ajustar goles según el resultado esperado
  if (resultado === 'LOCAL' && golesLocal <= golesVisitante) {
    golesLocal = golesVisitante + 1;
  } else if (resultado === 'VISITANTE' && golesVisitante <= golesLocal) {
    golesVisitante = golesLocal + 1;
  } else if (resultado === 'EMPATE') {
    golesLocal = golesVisitante;
  }

  return { golesLocal, golesVisitante };
}

function generarGolesPoisson(lambda) {
  if (lambda < 0) return 0;

  let k = 0;
  let p = 1;
  const e = Math.exp(-lambda);

  while (p > e) {
    k++;
    p *= Math.random();
  }

  return k - 1;
}
