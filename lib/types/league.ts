/**
 * Tipos e interfaces para el motor de la liga
 */

// Resultado de un partido
export enum MatchResult {
  HOME_WIN = "HOME_WIN",
  AWAY_WIN = "AWAY_WIN",
  DRAW = "DRAW",
}

// Interfaz para un partido
export interface IMatch {
  id: string;
  fecha: number; // Número de fecha (1-38)
  equipoLocal: string; // ID del equipo
  equipoVisitante: string; // ID del equipo
  golesLocal: number;
  golesVisitante: number;
  resultado?: MatchResult;
  jugado: boolean;
  fechaPartido?: string;
}

// Interfaz para estadísticas de un equipo en la liga
export interface ITeamStanding {
  equipoId: string;
  nombre: string;
  posicion: number;
  partidos: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferencia: number; // golesAFavor - golesEnContra
  puntos: number; // ganados * 3 + empatados * 1
}

// Interfaz para la tabla de posiciones
export interface ILeagueTable {
  posiciones: ITeamStanding[];
  actualizadoEn: string;
}

// Interfaz para el calendario de la liga
export interface ILeagueFixture {
  id: string;
  nombre: string;
  equipos: string[]; // IDs de equipos
  partidos: IMatch[];
  tablaActual: ILeagueTable;
  estado: "NO_INICIADA" | "EN_CURSO" | "FINALIZADA";
  fechaActual: number; // Fecha actual (1-38)
}

// Interfaz para resultados de simulación
export interface ISimulationResult {
  matchId: string;
  golesLocal: number;
  golesVisitante: number;
  resultado: MatchResult;
  probabilidadVictoriaLocal: number;
}
