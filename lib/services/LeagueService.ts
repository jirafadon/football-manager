import { ILeagueFixture, IMatch, ISimulationResult } from "@/lib/types/league";
import { Team } from "@/lib/models/Team";
import { FixtureGenerator } from "@/lib/models/FixtureGenerator";
import { LeagueTable } from "@/lib/models/LeagueTable";
import { MatchSimulator } from "@/lib/models/MatchSimulator";
import { Match } from "@/lib/models/Match";

/**
 * Servicio de Liga
 * Gestiona el ciclo de vida completo de un campeonato
 */
export class LeagueService {
  /**
   * Crea una nueva liga con 20 equipos
   */
  static crearLiga(equipos: Team[], nombreLiga: string = "Campeonato"): ILeagueFixture {
    if (equipos.length !== 20) {
      throw new Error("Se requieren exactamente 20 equipos para crear una liga");
    }

    const equipoIds = equipos.map((e) => e.id);
    const fixture = FixtureGenerator.generarFixture(equipoIds, nombreLiga);

    // Validar que el fixture sea válido
    if (!FixtureGenerator.validarFixture(fixture)) {
      throw new Error("El fixture generado no es válido");
    }

    return fixture;
  }

  /**
   * Simula una fecha completa de la liga
   */
  static simularFecha(
    fixture: ILeagueFixture,
    equipos: Map<string, Team>,
    numeroFecha: number
  ): ISimulationResult[] {
    // Validar que la fecha sea válida
    if (numeroFecha < 1 || numeroFecha > 38) {
      throw new Error("Número de fecha inválido (debe estar entre 1 y 38)");
    }

    // Obtener partidos de la fecha
    const partidosFecha = FixtureGenerator.obtenerPartidosPorFecha(fixture, numeroFecha);

    if (partidosFecha.length === 0) {
      throw new Error(`No hay partidos para la fecha ${numeroFecha}`);
    }

    // Simular partidos
    const resultados = MatchSimulator.simularFecha(fixture.partidos, equipos, numeroFecha);

    // Actualizar partidos con los resultados simulados
    resultados.forEach((resultado) => {
      const partido = fixture.partidos.find((p) => p.id === resultado.matchId);
      if (partido) {
        partido.golesLocal = resultado.golesLocal;
        partido.golesVisitante = resultado.golesVisitante;
        partido.resultado = resultado.resultado;
        partido.jugado = true;
        partido.fechaPartido = new Date().toISOString();
      }
    });

    // Actualizar tabla de posiciones
    fixture.tablaActual.posiciones = new LeagueTable(fixture.equipos).posiciones;
    const tabla = new LeagueTable(fixture.equipos);
    tabla.actualizarTabla(fixture.partidos);
    fixture.tablaActual = tabla;

    // Actualizar estado de la liga
    fixture.fechaActual = numeroFecha;
    if (numeroFecha === 38) {
      fixture.estado = "FINALIZADA";
    } else if (numeroFecha === 1) {
      fixture.estado = "EN_CURSO";
    }

    return resultados;
  }

  /**
   * Simula el resto del campeonato desde la fecha actual
   */
  static simularCampeonatoCompleto(
    fixture: ILeagueFixture,
    equipos: Map<string, Team>
  ): ISimulationResult[] {
    const todosLosResultados: ISimulationResult[] = [];

    // Simular desde la fecha actual hasta la 38
    for (let fecha = fixture.fechaActual; fecha <= 38; fecha++) {
      const resultados = this.simularFecha(fixture, equipos, fecha);
      todosLosResultados.push(...resultados);
    }

    return todosLosResultados;
  }

  /**
   * Obtiene el próximo partido de un equipo
   */
  static obtenerProximoPartido(fixture: ILeagueFixture, equipoId: string): IMatch | undefined {
    const proximosPartidos = FixtureGenerator.obtenerProximosPartidos(fixture, equipoId, 1);
    return proximosPartidos.length > 0 ? proximosPartidos[0] : undefined;
  }

  /**
   * Obtiene los próximos N partidos de un equipo
   */
  static obtenerProximosPartidos(
    fixture: ILeagueFixture,
    equipoId: string,
    cantidad: number = 5
  ): IMatch[] {
    return FixtureGenerator.obtenerProximosPartidos(fixture, equipoId, cantidad);
  }

  /**
   * Obtiene el historial de partidos de un equipo
   */
  static obtenerHistorialPartidos(fixture: ILeagueFixture, equipoId: string): IMatch[] {
    return FixtureGenerator.obtenerPartidosEquipo(fixture, equipoId).filter((p) => p.jugado);
  }

  /**
   * Obtiene estadísticas de un equipo en la liga
   */
  static obtenerEstadisticasEquipo(fixture: ILeagueFixture, equipoId: string) {
    const posicion = fixture.tablaActual.posiciones.find((p) => p.equipoId === equipoId);
    const partidos = FixtureGenerator.obtenerPartidosEquipo(fixture, equipoId);
    const partidosJugados = partidos.filter((p) => p.jugado);

    if (!posicion) {
      throw new Error(`Equipo ${equipoId} no encontrado en la liga`);
    }

    // Calcular estadísticas adicionales
    const victorias = partidosJugados.filter((p) => {
      if (p.equipoLocal === equipoId) {
        return p.golesLocal > p.golesVisitante;
      } else {
        return p.golesVisitante > p.golesLocal;
      }
    }).length;

    const empates = partidosJugados.filter((p) => p.golesLocal === p.golesVisitante).length;

    const derrotas = partidosJugados.filter((p) => {
      if (p.equipoLocal === equipoId) {
        return p.golesLocal < p.golesVisitante;
      } else {
        return p.golesVisitante < p.golesLocal;
      }
    }).length;

    return {
      ...posicion,
      promGolesPorPartido:
        partidosJugados.length > 0
          ? (posicion.golesAFavor / partidosJugados.length).toFixed(2)
          : "0.00",
      promGolesEnContraPorPartido:
        partidosJugados.length > 0
          ? (posicion.golesEnContra / partidosJugados.length).toFixed(2)
          : "0.00",
      tasa_victoria:
        partidosJugados.length > 0
          ? ((victorias / partidosJugados.length) * 100).toFixed(1)
          : "0.0",
      tasa_empate:
        partidosJugados.length > 0
          ? ((empates / partidosJugados.length) * 100).toFixed(1)
          : "0.0",
      tasa_derrota:
        partidosJugados.length > 0
          ? ((derrotas / partidosJugados.length) * 100).toFixed(1)
          : "0.0",
    };
  }

  /**
   * Obtiene los partidos de una fecha específica
   */
  static obtenerPartidosFecha(fixture: ILeagueFixture, numeroFecha: number): IMatch[] {
    return FixtureGenerator.obtenerPartidosPorFecha(fixture, numeroFecha);
  }

  /**
   * Obtiene la tabla de posiciones actual
   */
  static obtenerTabla(fixture: ILeagueFixture) {
    return fixture.tablaActual;
  }

  /**
   * Obtiene los equipos en zona de Champions (top 4)
   */
  static obtenerZonaChampions(fixture: ILeagueFixture) {
    return fixture.tablaActual.posiciones.slice(0, 4);
  }

  /**
   * Obtiene los equipos en zona de descenso (últimos 3)
   */
  static obtenerZonaDescenso(fixture: ILeagueFixture) {
    return fixture.tablaActual.posiciones.slice(-3);
  }

  /**
   * Obtiene estadísticas generales de la liga
   */
  static obtenerEstadisticasLiga(fixture: ILeagueFixture) {
    const tabla = fixture.tablaActual;
    const totalPartidos = fixture.partidos.filter((p) => p.jugado).length;
    const totalGoles = fixture.partidos
      .filter((p) => p.jugado)
      .reduce((sum, p) => sum + p.golesLocal + p.golesVisitante, 0);

    return {
      nombre: fixture.nombre,
      estado: fixture.estado,
      fechaActual: fixture.fechaActual,
      totalPartidos,
      totalGoles,
      promGolesPorPartido: totalPartidos > 0 ? (totalGoles / totalPartidos).toFixed(2) : "0.00",
      lider: tabla.posiciones[0],
      colista: tabla.posiciones[tabla.posiciones.length - 1],
    };
  }

  /**
   * Exporta la liga a JSON
   */
  static exportarLiga(fixture: ILeagueFixture): string {
    return JSON.stringify(fixture, null, 2);
  }

  /**
   * Importa una liga desde JSON
   */
  static importarLiga(json: string): ILeagueFixture {
    try {
      const fixture = JSON.parse(json) as ILeagueFixture;

      // Validar estructura básica
      if (!fixture.equipos || !fixture.partidos || !fixture.tablaActual) {
        throw new Error("Estructura de liga inválida");
      }

      return fixture;
    } catch (error) {
      throw new Error(`Error al importar liga: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  }
}
