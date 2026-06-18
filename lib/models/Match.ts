import { IMatch, MatchResult } from "@/lib/types/league";

/**
 * Clase Partido
 * Representa un partido entre dos equipos con resultado y estadísticas
 */
export class Match implements IMatch {
  id: string;
  fecha: number;
  equipoLocal: string;
  equipoVisitante: string;
  golesLocal: number;
  golesVisitante: number;
  resultado?: MatchResult;
  jugado: boolean;
  fechaPartido?: string;

  constructor(
    id: string,
    fecha: number,
    equipoLocal: string,
    equipoVisitante: string,
    golesLocal: number = 0,
    golesVisitante: number = 0,
    jugado: boolean = false,
    fechaPartido?: string
  ) {
    this.id = id;
    this.fecha = Math.max(1, Math.min(38, fecha)); // Validar que esté entre 1-38
    this.equipoLocal = equipoLocal;
    this.equipoVisitante = equipoVisitante;
    this.golesLocal = Math.max(0, golesLocal);
    this.golesVisitante = Math.max(0, golesVisitante);
    this.jugado = jugado;
    this.fechaPartido = fechaPartido;

    // Calcular resultado si el partido fue jugado
    if (jugado) {
      this.calcularResultado();
    }
  }

  /**
   * Calcula el resultado del partido basado en los goles
   */
  private calcularResultado(): void {
    if (this.golesLocal > this.golesVisitante) {
      this.resultado = MatchResult.HOME_WIN;
    } else if (this.golesVisitante > this.golesLocal) {
      this.resultado = MatchResult.AWAY_WIN;
    } else {
      this.resultado = MatchResult.DRAW;
    }
  }

  /**
   * Establece el resultado del partido
   */
  establecerResultado(golesLocal: number, golesVisitante: number): void {
    this.golesLocal = Math.max(0, golesLocal);
    this.golesVisitante = Math.max(0, golesVisitante);
    this.jugado = true;
    this.calcularResultado();
  }

  /**
   * Obtiene los puntos que recibe el equipo local
   */
  obtenerPuntosLocal(): number {
    if (!this.jugado) return 0;
    if (this.resultado === MatchResult.HOME_WIN) return 3;
    if (this.resultado === MatchResult.DRAW) return 1;
    return 0;
  }

  /**
   * Obtiene los puntos que recibe el equipo visitante
   */
  obtenerPuntosVisitante(): number {
    if (!this.jugado) return 0;
    if (this.resultado === MatchResult.AWAY_WIN) return 3;
    if (this.resultado === MatchResult.DRAW) return 1;
    return 0;
  }

  /**
   * Obtiene una representación serializable del partido
   */
  toJSON() {
    return {
      id: this.id,
      fecha: this.fecha,
      equipoLocal: this.equipoLocal,
      equipoVisitante: this.equipoVisitante,
      golesLocal: this.golesLocal,
      golesVisitante: this.golesVisitante,
      resultado: this.resultado,
      jugado: this.jugado,
      fechaPartido: this.fechaPartido,
    };
  }

  /**
   * Crea una instancia de Match desde un objeto JSON
   */
  static fromJSON(data: any): Match {
    const match = new Match(
      data.id,
      data.fecha,
      data.equipoLocal,
      data.equipoVisitante,
      data.golesLocal,
      data.golesVisitante,
      data.jugado,
      data.fechaPartido
    );
    return match;
  }
}
