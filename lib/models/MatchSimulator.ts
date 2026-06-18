import { IMatch, MatchResult, ISimulationResult } from "@/lib/types/league";
import { Team } from "./Team";

/**
 * Simulador de Partidos
 * Simula resultados de partidos basándose en el promedio de atributos de los equipos
 * y un factor de localía
 */
export class MatchSimulator {
  // Factor de localía: ventaja del equipo local
  private static readonly FACTOR_LOCALÍA = 1.15;

  // Desviación estándar para la distribución de goles
  private static readonly DESVIACIÓN_GOLES = 0.8;

  /**
   * Simula un partido entre dos equipos
   * @param partido - Partido a simular
   * @param equipoLocal - Equipo local
   * @param equipoVisitante - Equipo visitante
   * @returns Resultado de la simulación
   */
  static simularPartido(
    partido: IMatch,
    equipoLocal: Team,
    equipoVisitante: Team
  ): ISimulationResult {
    // Obtener promedios de atributos
    const promedioLocal = equipoLocal.calcularPromedioEquipo();
    const promedioVisitante = equipoVisitante.calcularPromedioEquipo();

    // Aplicar factor de localía al equipo local
    const fuerzaLocal = promedioLocal * this.FACTOR_LOCALÍA;
    const fuerzaVisitante = promedioVisitante;

    // Calcular probabilidad de victoria del equipo local
    const probabilidadVictoriaLocal = this.calcularProbabilidadVictoria(fuerzaLocal, fuerzaVisitante);

    // Generar resultado aleatorio
    const resultado = this.generarResultado(probabilidadVictoriaLocal);

    // Simular goles basándose en el resultado y la fuerza de los equipos
    const { golesLocal, golesVisitante } = this.simularGoles(
      resultado,
      fuerzaLocal,
      fuerzaVisitante
    );

    return {
      matchId: partido.id,
      golesLocal,
      golesVisitante,
      resultado,
      probabilidadVictoriaLocal,
    };
  }

  /**
   * Simula múltiples partidos (para una fecha completa o todo el campeonato)
   */
  static simularPartidos(
    partidos: IMatch[],
    equipos: Map<string, Team>
  ): ISimulationResult[] {
    return partidos
      .filter((p) => !p.jugado) // Solo simular partidos no jugados
      .map((partido) => {
        const equipoLocal = equipos.get(partido.equipoLocal);
        const equipoVisitante = equipos.get(partido.equipoVisitante);

        if (!equipoLocal || !equipoVisitante) {
          throw new Error(`Equipo no encontrado para el partido ${partido.id}`);
        }

        return this.simularPartido(partido, equipoLocal, equipoVisitante);
      });
  }

  /**
   * Calcula la probabilidad de victoria del equipo local
   * Usa la fórmula de Elo modificada
   */
  private static calcularProbabilidadVictoria(fuerzaLocal: number, fuerzaVisitante: number): number {
    // Fórmula: P(Local) = 1 / (1 + 10^((Visitante - Local) / 400))
    // Adaptada para nuestro rango de valores (0-100)
    const diferencia = fuerzaVisitante - fuerzaLocal;
    const probabilidad = 1 / (1 + Math.pow(10, diferencia / 40));

    // Asegurar que la probabilidad esté entre 0 y 1
    return Math.max(0, Math.min(1, probabilidad));
  }

  /**
   * Genera el resultado del partido basándose en la probabilidad
   */
  private static generarResultado(probabilidadVictoriaLocal: number): MatchResult {
    const aleatorio = Math.random();

    // Distribuir el rango de probabilidad
    const probEmpate = 0.25; // 25% de probabilidad de empate
    const probVictoriaLocal = probabilidadVictoriaLocal * (1 - probEmpate);
    const probVictoriaVisitante = (1 - probabilidadVictoriaLocal) * (1 - probEmpate);

    if (aleatorio < probVictoriaLocal) {
      return MatchResult.HOME_WIN;
    } else if (aleatorio < probVictoriaLocal + probEmpate) {
      return MatchResult.DRAW;
    } else {
      return MatchResult.AWAY_WIN;
    }
  }

  /**
   * Simula los goles del partido basándose en el resultado y la fuerza de los equipos
   */
  private static simularGoles(
    resultado: MatchResult,
    fuerzaLocal: number,
    fuerzaVisitante: number
  ): { golesLocal: number; golesVisitante: number } {
    // Calcular goles esperados basándose en la fuerza de los equipos
    // Normalizar fuerzas a un rango de 0-1 para calcular goles
    const tasaGolesLocal = (fuerzaLocal / 100) * 2.5; // Máximo 2.5 goles esperados
    const tasaGolesVisitante = (fuerzaVisitante / 100) * 2.5;

    // Generar goles usando distribución de Poisson aproximada
    let golesLocal = this.generarGolesPoisson(tasaGolesLocal);
    let golesVisitante = this.generarGolesPoisson(tasaGolesVisitante);

    // Ajustar goles según el resultado esperado
    switch (resultado) {
      case MatchResult.HOME_WIN:
        // Asegurar que el local gane
        if (golesLocal <= golesVisitante) {
          golesLocal = golesVisitante + 1;
        }
        break;

      case MatchResult.AWAY_WIN:
        // Asegurar que el visitante gane
        if (golesVisitante <= golesLocal) {
          golesVisitante = golesLocal + 1;
        }
        break;

      case MatchResult.DRAW:
        // Asegurar empate
        golesLocal = golesVisitante;
        break;
    }

    return { golesLocal, golesVisitante };
  }

  /**
   * Genera un número aleatorio siguiendo una distribución de Poisson
   * Aproximación usando la transformación de Box-Muller
   */
  private static generarGolesPoisson(lambda: number): number {
    if (lambda < 0) return 0;

    // Usar aproximación de Poisson para valores pequeños de lambda
    let k = 0;
    let p = 1;
    const e = Math.exp(-lambda);

    while (p > e) {
      k++;
      p *= Math.random();
    }

    return k - 1;
  }

  /**
   * Simula una fecha completa de partidos
   */
  static simularFecha(
    partidos: IMatch[],
    equipos: Map<string, Team>,
    numeroFecha: number
  ): ISimulationResult[] {
    const partidosFecha = partidos.filter((p) => p.fecha === numeroFecha);
    return this.simularPartidos(partidosFecha, equipos);
  }

  /**
   * Simula el resto del campeonato
   */
  static simularCampeonatoCompleto(
    partidos: IMatch[],
    equipos: Map<string, Team>
  ): ISimulationResult[] {
    return this.simularPartidos(partidos, equipos);
  }

  /**
   * Obtiene estadísticas de una simulación
   */
  static obtenerEstadisticasSimulacion(resultados: ISimulationResult[]) {
    if (resultados.length === 0) {
      return {
        totalPartidos: 0,
        totalGoles: 0,
        promGolesPorPartido: 0,
        victoriasLocales: 0,
        empates: 0,
        victoriasVisitantes: 0,
      };
    }

    const totalGoles = resultados.reduce((sum, r) => sum + r.golesLocal + r.golesVisitante, 0);
    const victoriasLocales = resultados.filter((r) => r.resultado === MatchResult.HOME_WIN).length;
    const empates = resultados.filter((r) => r.resultado === MatchResult.DRAW).length;
    const victoriasVisitantes = resultados.filter((r) => r.resultado === MatchResult.AWAY_WIN).length;

    return {
      totalPartidos: resultados.length,
      totalGoles,
      promGolesPorPartido: (totalGoles / resultados.length).toFixed(2),
      victoriasLocales,
      empates,
      victoriasVisitantes,
      porcentajeVictoriasLocales: ((victoriasLocales / resultados.length) * 100).toFixed(1),
      porcentajeEmpates: ((empates / resultados.length) * 100).toFixed(1),
      porcentajeVictoriasVisitantes: ((victoriasVisitantes / resultados.length) * 100).toFixed(1),
    };
  }
}
