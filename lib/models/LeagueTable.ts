import { ITeamStanding, ILeagueTable, IMatch } from "@/lib/types/league";

/**
 * Clase Tabla de Posiciones
 * Maneja el cálculo y ordenamiento automático de posiciones en la liga
 */
export class LeagueTable implements ILeagueTable {
  posiciones: ITeamStanding[];
  actualizadoEn: string;

  constructor(equipoIds: string[]) {
    // Inicializar tabla vacía para cada equipo
    this.posiciones = equipoIds.map((id, index) => ({
      equipoId: id,
      nombre: id,
      posicion: index + 1,
      partidos: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      golesAFavor: 0,
      golesEnContra: 0,
      diferencia: 0,
      puntos: 0,
    }));
    this.actualizadoEn = new Date().toISOString();
  }

  /**
   * Actualiza la tabla basándose en los partidos jugados
   */
  actualizarTabla(partidos: IMatch[]): void {
    // Reiniciar estadísticas
    this.posiciones.forEach((pos) => {
      pos.partidos = 0;
      pos.ganados = 0;
      pos.empatados = 0;
      pos.perdidos = 0;
      pos.golesAFavor = 0;
      pos.golesEnContra = 0;
      pos.diferencia = 0;
      pos.puntos = 0;
    });

    // Procesar cada partido jugado
    partidos.forEach((partido) => {
      if (!partido.jugado) return;

      const posLocal = this.posiciones.find((p) => p.equipoId === partido.equipoLocal);
      const posVisitante = this.posiciones.find((p) => p.equipoId === partido.equipoVisitante);

      if (!posLocal || !posVisitante) return;

      // Actualizar partidos jugados
      posLocal.partidos++;
      posVisitante.partidos++;

      // Actualizar goles
      posLocal.golesAFavor += partido.golesLocal;
      posLocal.golesEnContra += partido.golesVisitante;
      posVisitante.golesAFavor += partido.golesVisitante;
      posVisitante.golesEnContra += partido.golesLocal;

      // Actualizar resultado
      if (partido.golesLocal > partido.golesVisitante) {
        // Victoria local
        posLocal.ganados++;
        posLocal.puntos += 3;
        posVisitante.perdidos++;
      } else if (partido.golesVisitante > partido.golesLocal) {
        // Victoria visitante
        posVisitante.ganados++;
        posVisitante.puntos += 3;
        posLocal.perdidos++;
      } else {
        // Empate
        posLocal.empatados++;
        posLocal.puntos += 1;
        posVisitante.empatados++;
        posVisitante.puntos += 1;
      }

      // Calcular diferencia de goles
      posLocal.diferencia = posLocal.golesAFavor - posLocal.golesEnContra;
      posVisitante.diferencia = posVisitante.golesAFavor - posVisitante.golesEnContra;
    });

    // Ordenar tabla
    this.ordenarTabla();
    this.actualizadoEn = new Date().toISOString();
  }

  /**
   * Ordena la tabla según criterios de desempate
   * 1. Puntos (descendente)
   * 2. Diferencia de goles (descendente)
   * 3. Goles a favor (descendente)
   * 4. Orden alfabético (ascendente)
   */
  private ordenarTabla(): void {
    this.posiciones.sort((a, b) => {
      // Criterio 1: Puntos
      if (a.puntos !== b.puntos) {
        return b.puntos - a.puntos;
      }

      // Criterio 2: Diferencia de goles
      if (a.diferencia !== b.diferencia) {
        return b.diferencia - a.diferencia;
      }

      // Criterio 3: Goles a favor
      if (a.golesAFavor !== b.golesAFavor) {
        return b.golesAFavor - a.golesAFavor;
      }

      // Criterio 4: Orden alfabético
      return a.equipoId.localeCompare(b.equipoId);
    });

    // Actualizar posiciones
    this.posiciones.forEach((pos, index) => {
      pos.posicion = index + 1;
    });
  }

  /**
   * Obtiene la posición de un equipo específico
   */
  obtenerPosicionEquipo(equipoId: string): ITeamStanding | undefined {
    return this.posiciones.find((p) => p.equipoId === equipoId);
  }

  /**
   * Obtiene los primeros N equipos (ej: top 4 para Champions)
   */
  obtenerTopEquipos(cantidad: number = 4): ITeamStanding[] {
    return this.posiciones.slice(0, cantidad);
  }

  /**
   * Obtiene los últimos N equipos (ej: últimos 3 para descenso)
   */
  obtenerUltimosEquipos(cantidad: number = 3): ITeamStanding[] {
    return this.posiciones.slice(-cantidad);
  }

  /**
   * Obtiene una representación serializable de la tabla
   */
  toJSON() {
    return {
      posiciones: this.posiciones,
      actualizadoEn: this.actualizadoEn,
    };
  }

  /**
   * Crea una instancia de LeagueTable desde un objeto JSON
   */
  static fromJSON(data: any): LeagueTable {
    const equipoIds = data.posiciones.map((p: ITeamStanding) => p.equipoId);
    const tabla = new LeagueTable(equipoIds);
    tabla.posiciones = data.posiciones;
    tabla.actualizadoEn = data.actualizadoEn;
    return tabla;
  }

  /**
   * Obtiene estadísticas agregadas de la liga
   */
  obtenerEstadisticasLiga() {
    const totalPartidos = this.posiciones.reduce((sum, p) => sum + p.partidos, 0) / 2; // Dividir por 2 porque cada partido se cuenta dos veces
    const totalGoles = this.posiciones.reduce((sum, p) => sum + p.golesAFavor, 0);
    const promGolesPorPartido = totalPartidos > 0 ? (totalGoles / totalPartidos).toFixed(2) : "0.00";

    return {
      totalPartidos,
      totalGoles,
      promGolesPorPartido,
      equiposConMasVictorias: this.posiciones[0],
      equiposConMasGoles: this.posiciones.sort((a, b) => b.golesAFavor - a.golesAFavor)[0],
      equiposConMasGolesEnContra: this.posiciones.sort((a, b) => b.golesEnContra - a.golesEnContra)[0],
    };
  }
}
