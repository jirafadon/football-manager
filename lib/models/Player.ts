import { IPlayer, PerformanceAttributes, Position } from "@/lib/types/football";

/**
 * Clase Jugador
 * Representa un jugador de fútbol con atributos de rendimiento, moral, energía y datos económicos
 */
export class Player implements IPlayer {
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

  constructor(
    id: string,
    nombre: string,
    posicion: Position,
    atributos: PerformanceAttributes,
    edad: number,
    numero: number,
    valorMercado: number = 0,
    sueldo: number = 0,
    moral: number = 75,
    energia: number = 100,
    esLesionado: boolean = false
  ) {
    this.id = id;
    this.nombre = nombre;
    this.posicion = posicion;
    this.atributos = this.validarAtributos(atributos);
    this.moral = Math.max(0, Math.min(100, moral));
    this.energia = Math.max(0, Math.min(100, energia));
    this.valorMercado = Math.max(0, valorMercado);
    this.sueldo = Math.max(0, sueldo);
    this.edad = Math.max(16, edad);
    this.numero = numero;
    this.esLesionado = esLesionado;
  }

  /**
   * Valida que los atributos estén en el rango 0-100
   */
  private validarAtributos(atributos: PerformanceAttributes): PerformanceAttributes {
    return {
      velocidad: Math.max(0, Math.min(100, atributos.velocidad)),
      remate: Math.max(0, Math.min(100, atributos.remate)),
      pase: Math.max(0, Math.min(100, atributos.pase)),
      defensa: Math.max(0, Math.min(100, atributos.defensa)),
      fisico: Math.max(0, Math.min(100, atributos.fisico)),
    };
  }

  /**
   * Calcula el promedio general de atributos
   */
  calcularPromedio(): number {
    const valores = Object.values(this.atributos);
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return Math.round(suma / valores.length);
  }

  /**
   * Obtiene una representación serializable del jugador
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      posicion: this.posicion,
      atributos: this.atributos,
      moral: this.moral,
      energia: this.energia,
      valorMercado: this.valorMercado,
      sueldo: this.sueldo,
      edad: this.edad,
      numero: this.numero,
      esLesionado: this.esLesionado,
    };
  }

  /**
   * Crea una instancia de Player desde un objeto JSON
   */
  static fromJSON(data: any): Player {
    return new Player(
      data.id,
      data.nombre,
      data.posicion,
      data.atributos,
      data.edad,
      data.numero,
      data.valorMercado,
      data.sueldo,
      data.moral,
      data.energia,
      data.esLesionado
    );
  }

  /**
   * Modifica la energía del jugador (ej: después de un partido)
   */
  modificarEnergia(cantidad: number): void {
    this.energia = Math.max(0, Math.min(100, this.energia + cantidad));
  }

  /**
   * Modifica la moral del jugador
   */
  modificarMoral(cantidad: number): void {
    this.moral = Math.max(0, Math.min(100, this.moral + cantidad));
  }

  /**
   * Simula una lesión
   */
  lesionar(): void {
    this.esLesionado = true;
    this.energia = 0;
  }

  /**
   * Recupera al jugador de una lesión
   */
  recuperar(): void {
    this.esLesionado = false;
    this.energia = 100;
  }
}
