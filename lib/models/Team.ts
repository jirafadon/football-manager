import { ITeam, IPlayer, ClubState, Position } from "@/lib/types/football";
import { Player } from "./Player";

/**
 * Clase Equipo
 * Representa un equipo de fútbol con gestión de plantel, titulares y suplentes
 */
export class Team implements ITeam {
  id: string;
  nombre: string;
  presupuesto: number;
  estadio: string;
  reputacion: number;
  plantel: IPlayer[];
  titulares: IPlayer[];
  suplentes: IPlayer[];

  constructor(
    id: string,
    nombre: string,
    presupuesto: number = 100,
    estadio: string = "Estadio Local",
    reputacion: number = 50
  ) {
    this.id = id;
    this.nombre = nombre;
    this.presupuesto = Math.max(0, presupuesto);
    this.estadio = estadio;
    this.reputacion = Math.max(0, Math.min(100, reputacion));
    this.plantel = [];
    this.titulares = [];
    this.suplentes = [];
  }

  /**
   * Agrega un jugador al plantel
   */
  agregarJugador(jugador: IPlayer): void {
    // Verificar que no exista un jugador con el mismo ID
    if (this.plantel.some((j) => j.id === jugador.id)) {
      console.warn(`Jugador con ID ${jugador.id} ya existe en el plantel`);
      return;
    }

    // Verificar presupuesto disponible
    if (jugador.sueldo > this.presupuesto) {
      console.warn(`Presupuesto insuficiente para contratar a ${jugador.nombre}`);
      return;
    }

    this.plantel.push(jugador);
    this.presupuesto -= jugador.sueldo;
  }

  /**
   * Remueve un jugador del plantel
   */
  removerJugador(jugadorId: string): void {
    const indice = this.plantel.findIndex((j) => j.id === jugadorId);
    if (indice !== -1) {
      const jugador = this.plantel[indice];
      this.plantel.splice(indice, 1);
      this.presupuesto += jugador.sueldo;

      // Remover de titulares y suplentes si está en alguna de esas listas
      this.titulares = this.titulares.filter((j) => j.id !== jugadorId);
      this.suplentes = this.suplentes.filter((j) => j.id !== jugadorId);
    }
  }

  /**
   * Establece los 11 jugadores titulares
   * Valida que sean 11 jugadores y que incluyan al menos 1 arquero
   */
  establecerTitulares(jugadores: IPlayer[]): boolean {
    // Validar cantidad de titulares
    if (jugadores.length !== 11) {
      console.warn("Se requieren exactamente 11 jugadores titulares");
      return false;
    }

    // Validar que todos los jugadores estén en el plantel
    const idsValidos = new Set(this.plantel.map((j) => j.id));
    if (!jugadores.every((j) => idsValidos.has(j.id))) {
      console.warn("Uno o más jugadores no están en el plantel");
      return false;
    }

    // Validar que haya al menos 1 arquero
    const arqueros = jugadores.filter((j) => j.posicion === Position.ARQ);
    if (arqueros.length === 0) {
      console.warn("Se requiere al menos 1 arquero en los titulares");
      return false;
    }

    this.titulares = jugadores;

    // Actualizar suplentes (jugadores que no son titulares)
    const idsTitulares = new Set(this.titulares.map((j) => j.id));
    this.suplentes = this.plantel.filter((j) => !idsTitulares.has(j.id));

    return true;
  }

  /**
   * Obtiene el promedio general del equipo
   */
  calcularPromedioEquipo(): number {
    if (this.plantel.length === 0) return 0;
    const suma = this.plantel.reduce((acc, jugador) => acc + jugador.calcularPromedio(), 0);
    return Math.round(suma / this.plantel.length);
  }

  /**
   * Obtiene el costo total de sueldos mensuales
   */
  calcularCostoSueldos(): number {
    return this.plantel.reduce((acc, jugador) => acc + jugador.sueldo, 0);
  }

  /**
   * Obtiene el valor total del plantel en el mercado
   */
  calcularValorPlantel(): number {
    return this.plantel.reduce((acc, jugador) => acc + jugador.valorMercado, 0);
  }

  /**
   * Serializa el estado del equipo a JSON
   */
  guardarEnJSON(): string {
    const estado: ClubState = {
      equipo: {
        id: this.id,
        nombre: this.nombre,
        presupuesto: this.presupuesto,
        estadio: this.estadio,
        reputacion: this.reputacion,
      },
      plantel: this.plantel.map((j) => j.toJSON()),
      titulares: this.titulares.map((j) => j.id),
      suplentes: this.suplentes.map((j) => j.id),
      fechaGuardado: new Date().toISOString(),
    };

    return JSON.stringify(estado, null, 2);
  }

  /**
   * Carga el estado del equipo desde JSON
   */
  cargarDesdeJSON(json: string): boolean {
    try {
      const estado: ClubState = JSON.parse(json);

      // Restaurar datos del equipo
      this.id = estado.equipo.id;
      this.nombre = estado.equipo.nombre;
      this.presupuesto = estado.equipo.presupuesto;
      this.estadio = estado.equipo.estadio;
      this.reputacion = estado.equipo.reputacion;

      // Restaurar plantel
      this.plantel = estado.plantel.map((p) => Player.fromJSON(p));

      // Restaurar titulares y suplentes
      const idsTitulares = new Set(estado.titulares);
      this.titulares = this.plantel.filter((j) => idsTitulares.has(j.id));
      this.suplentes = this.plantel.filter((j) => !idsTitulares.has(j.id));

      return true;
    } catch (error) {
      console.error("Error al cargar el estado del equipo:", error);
      return false;
    }
  }

  /**
   * Obtiene una representación serializable del equipo
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      presupuesto: this.presupuesto,
      estadio: this.estadio,
      reputacion: this.reputacion,
      plantel: this.plantel.map((j) => j.toJSON()),
      titulares: this.titulares.map((j) => j.id),
      suplentes: this.suplentes.map((j) => j.id),
    };
  }

  /**
   * Crea una instancia de Team desde un objeto JSON
   */
  static fromJSON(data: any): Team {
    const team = new Team(data.id, data.nombre, data.presupuesto, data.estadio, data.reputacion);
    team.plantel = data.plantel.map((p: any) => Player.fromJSON(p));

    const idsTitulares = new Set(data.titulares);
    team.titulares = team.plantel.filter((j) => idsTitulares.has(j.id));
    team.suplentes = team.plantel.filter((j) => !idsTitulares.has(j.id));

    return team;
  }
}
