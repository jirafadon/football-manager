/**
 * Tipos y enumeraciones para el juego de manager de fútbol
 */

// Posiciones en el campo
export enum Position {
  ARQ = "ARQ", // Arquero
  DEF = "DEF", // Defensa
  MED = "MED", // Centrocampista
  DEL = "DEL", // Delantero
}

// Interfaz de atributos de rendimiento
export interface PerformanceAttributes {
  velocidad: number; // 0-100
  remate: number; // 0-100
  pase: number; // 0-100
  defensa: number; // 0-100
  fisico: number; // 0-100
}

// Interfaz para un jugador
export interface IPlayer {
  id: string;
  nombre: string;
  posicion: Position;
  atributos: PerformanceAttributes;
  moral: number; // 0-100
  energia: number; // 0-100
  valorMercado: number; // en millones
  sueldo: number; // mensual
  edad: number;
  numero: number;
  esLesionado: boolean;
  calcularPromedio(): number;
  toJSON(): any;
}

// Interfaz para un equipo
export interface ITeam {
  id: string;
  nombre: string;
  presupuesto: number; // en millones
  estadio: string;
  reputacion: number; // 0-100
  plantel: IPlayer[];
  titulares: IPlayer[];
  suplentes: IPlayer[];
  agregarJugador(jugador: IPlayer): void;
  establecerTitulares(jugadores: IPlayer[]): void;
  guardarEnJSON(): string;
  cargarDesdeJSON(json: string): void;
}

// Interfaz para el estado del club (serializable)
export interface ClubState {
  equipo: {
    id: string;
    nombre: string;
    presupuesto: number;
    estadio: string;
    reputacion: number;
  };
  plantel: Array<{
    id: string;
    nombre: string;
    posicion: Position;
    atributos: PerformanceAttributes;
    moral: number;
    energia: number;
    valorMercado: number;
    sueldo: number;
    edad: number;
    numero: number;
    esLesionado: boolean;
  }>;
  titulares: string[]; // IDs de jugadores titulares
  suplentes: string[]; // IDs de jugadores suplentes
  fechaGuardado: string;
}
