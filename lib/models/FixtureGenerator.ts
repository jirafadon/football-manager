import { Match } from "./Match";
import { ILeagueFixture, IMatch } from "@/lib/types/league";

/**
 * Generador de Fixtures
 * Implementa el algoritmo Round Robin para generar 38 fechas de campeonato
 */
export class FixtureGenerator {
  /**
   * Genera un fixture completo usando el algoritmo Round Robin
   * Para 20 equipos genera 38 fechas (19 fechas de ida + 19 fechas de vuelta)
   *
   * @param equipoIds - Array de IDs de equipos (debe tener 20 equipos)
   * @param nombreLiga - Nombre de la liga
   * @returns Fixture generado con todos los partidos
   */
  static generarFixture(equipoIds: string[], nombreLiga: string = "Campeonato"): ILeagueFixture {
    if (equipoIds.length !== 20) {
      throw new Error("Se requieren exactamente 20 equipos para generar el fixture");
    }

    const partidos: Match[] = [];
    const equipos = [...equipoIds];

    // Generar ida (19 fechas)
    const partidosIda = this.generarRondas(equipos, false);
    partidos.push(...partidosIda);

    // Generar vuelta (19 fechas)
    const partidosVuelta = this.generarRondas(equipos, true);
    partidos.push(...partidosVuelta);

    // Crear fixture
    const fixture: ILeagueFixture = {
      id: `fixture_${Date.now()}`,
      nombre: nombreLiga,
      equipos: equipoIds,
      partidos,
      tablaActual: {
        posiciones: equipoIds.map((id, index) => ({
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
        })),
        actualizadoEn: new Date().toISOString(),
      },
      estado: "NO_INICIADA",
      fechaActual: 1,
    };

    return fixture;
  }

  /**
   * Genera las rondas del campeonato usando el algoritmo Round Robin
   * @param equipos - Array de IDs de equipos
   * @param esVuelta - Si es true, invierte los equipos (vuelta)
   */
  private static generarRondas(equipos: string[], esVuelta: boolean): Match[] {
    const partidos: Match[] = [];
    let numeroFecha = esVuelta ? 20 : 1; // Las vueltas comienzan en fecha 20

    // Si hay número impar de equipos, agregar un equipo ficticio
    const equiposAux = equipos.length % 2 === 1 ? [...equipos, "BYE"] : [...equipos];
    const n = equiposAux.length;

    // Algoritmo Round Robin: rotación circular
    for (let ronda = 0; ronda < n - 1; ronda++) {
      // En cada ronda se juegan n/2 partidos
      for (let i = 0; i < n / 2; i++) {
        const local = equiposAux[i];
        const visitante = equiposAux[n - 1 - i];

        // Saltar si alguno es el equipo ficticio
        if (local === "BYE" || visitante === "BYE") {
          continue;
        }

        // Si es vuelta, invertir equipos
        const [equipoLocal, equipoVisitante] = esVuelta ? [visitante, local] : [local, visitante];

        const matchId = `match_${numeroFecha}_${equipoLocal}_${equipoVisitante}`;
        const match = new Match(matchId, numeroFecha, equipoLocal, equipoVisitante);
        partidos.push(match);
      }

      // Rotar equipos (excepto el primero)
      const temp = equiposAux[1];
      for (let i = 1; i < n - 1; i++) {
        equiposAux[i] = equiposAux[i + 1];
      }
      equiposAux[n - 1] = temp;

      numeroFecha++;
    }

    return partidos;
  }

  /**
   * Valida que un fixture sea válido
   */
  static validarFixture(fixture: ILeagueFixture): boolean {
    // Validar que haya 38 fechas
    if (fixture.partidos.length !== 38) {
      console.warn(`Se esperaban 38 partidos, se encontraron ${fixture.partidos.length}`);
      return false;
    }

    // Validar que cada equipo juegue 38 partidos (19 de local + 19 de visitante)
    const partidosPorEquipo: { [key: string]: number } = {};
    fixture.partidos.forEach((partido) => {
      partidosPorEquipo[partido.equipoLocal] = (partidosPorEquipo[partido.equipoLocal] || 0) + 1;
      partidosPorEquipo[partido.equipoVisitante] = (partidosPorEquipo[partido.equipoVisitante] || 0) + 1;
    });

    for (const equipoId of fixture.equipos) {
      if ((partidosPorEquipo[equipoId] || 0) !== 38) {
        console.warn(`Equipo ${equipoId} juega ${partidosPorEquipo[equipoId] || 0} partidos en lugar de 38`);
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene los partidos de una fecha específica
   */
  static obtenerPartidosPorFecha(fixture: ILeagueFixture, numeroFecha: number): IMatch[] {
    return fixture.partidos.filter((p) => p.fecha === numeroFecha);
  }

  /**
   * Obtiene los partidos de un equipo
   */
  static obtenerPartidosEquipo(fixture: ILeagueFixture, equipoId: string): IMatch[] {
    return fixture.partidos.filter((p) => p.equipoLocal === equipoId || p.equipoVisitante === equipoId);
  }

  /**
   * Obtiene los partidos pendientes de un equipo
   */
  static obtenerPartidosPendientes(fixture: ILeagueFixture, equipoId: string): IMatch[] {
    return this.obtenerPartidosEquipo(fixture, equipoId).filter((p) => !p.jugado);
  }

  /**
   * Obtiene los próximos N partidos de un equipo
   */
  static obtenerProximosPartidos(fixture: ILeagueFixture, equipoId: string, cantidad: number = 5): IMatch[] {
    return this.obtenerPartidosPendientes(fixture, equipoId).slice(0, cantidad);
  }
}
