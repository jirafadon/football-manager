import { Team } from "@/lib/models/Team";
import { Player } from "@/lib/models/Player";
import { Position, PerformanceAttributes } from "@/lib/types/football";
import { LeagueService } from "@/lib/services/LeagueService";
import { ILeagueFixture } from "@/lib/types/league";

/**
 * Utilidades para generar datos de prueba de ligas
 */

/**
 * Crea 20 equipos de prueba para una liga
 */
export function crearEquiposLiga(): Team[] {
  const equipos = [
    { nombre: "Real Madrid", estadio: "Santiago Bernabéu", reputacion: 95 },
    { nombre: "Barcelona", estadio: "Camp Nou", reputacion: 93 },
    { nombre: "Atlético Madrid", estadio: "Wanda Metropolitano", reputacion: 88 },
    { nombre: "Sevilla", estadio: "Ramón Sánchez Pizjuán", reputacion: 82 },
    { nombre: "Valencia", estadio: "Mestalla", reputacion: 80 },
    { nombre: "Real Sociedad", estadio: "Anoeta", reputacion: 78 },
    { nombre: "Villarreal", estadio: "La Cerámica", reputacion: 76 },
    { nombre: "Betis", estadio: "Benito Villamarín", reputacion: 74 },
    { nombre: "Osasuna", estadio: "El Sadar", reputacion: 72 },
    { nombre: "Athletic Bilbao", estadio: "San Mamés", reputacion: 70 },
    { nombre: "Celta de Vigo", estadio: "Balaídos", reputacion: 68 },
    { nombre: "Getafe", estadio: "Coliseum Alfonso Pérez", reputacion: 66 },
    { nombre: "Rayo Vallecano", estadio: "Estadio de Vallecas", reputacion: 64 },
    { nombre: "Mallorca", estadio: "Son Moix", reputacion: 62 },
    { nombre: "Girona", estadio: "Montilivi", reputacion: 60 },
    { nombre: "Las Palmas", estadio: "Gran Canaria", reputacion: 58 },
    { nombre: "Almería", estadio: "Estadio de Almería", reputacion: 56 },
    { nombre: "Cádiz", estadio: "Nuevo Mirandilla", reputacion: 54 },
    { nombre: "Valladolid", estadio: "José Zorrilla", reputacion: 52 },
    { nombre: "Alavés", estadio: "Mendizorrotza", reputacion: 50 },
  ];

  return equipos.map((info, index) => {
    const team = new Team(`team_liga_${index}`, info.nombre, 100, info.estadio, info.reputacion);

    // Crear plantel con jugadores aleatorios
    const numJugadores = 18;
    for (let i = 0; i < numJugadores; i++) {
      const posiciones = [Position.ARQ, Position.DEF, Position.MED, Position.DEL];
      const posicion = posiciones[Math.floor(Math.random() * posiciones.length)];

      const atributos = generarAtributosAleatorios(posicion, info.reputacion);
      const player = new Player(
        `player_${index}_${i}`,
        `Jugador ${i + 1}`,
        posicion,
        atributos,
        Math.floor(Math.random() * 15) + 18,
        i + 1,
        Math.floor(Math.random() * 50) + 5,
        Math.floor(Math.random() * 3) + 0.5
      );

      team.agregarJugador(player);
    }

    // Establecer titulares
    const titulares = [
      team.plantel[0], // Arquero
      team.plantel[1],
      team.plantel[2],
      team.plantel[3],
      team.plantel[4],
      team.plantel[5],
      team.plantel[6],
      team.plantel[7],
      team.plantel[8],
      team.plantel[9],
      team.plantel[10],
    ];

    team.establecerTitulares(titulares);

    return team;
  });
}

/**
 * Genera atributos aleatorios basados en la reputación del equipo
 */
function generarAtributosAleatorios(posicion: Position, reputacion: number): PerformanceAttributes {
  // La reputación del equipo influye en los atributos base
  const baseAtributo = Math.floor((reputacion / 100) * 30) + 40; // Entre 40 y 70

  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (posicion) {
    case Position.ARQ:
      return {
        velocidad: random(baseAtributo - 10, baseAtributo + 10),
        remate: random(baseAtributo - 30, baseAtributo - 10),
        pase: random(baseAtributo, baseAtributo + 20),
        defensa: random(baseAtributo + 10, baseAtributo + 30),
        fisico: random(baseAtributo + 10, baseAtributo + 30),
      };
    case Position.DEF:
      return {
        velocidad: random(baseAtributo, baseAtributo + 20),
        remate: random(baseAtributo - 20, baseAtributo),
        pase: random(baseAtributo, baseAtributo + 20),
        defensa: random(baseAtributo + 20, baseAtributo + 40),
        fisico: random(baseAtributo + 10, baseAtributo + 30),
      };
    case Position.MED:
      return {
        velocidad: random(baseAtributo + 5, baseAtributo + 25),
        remate: random(baseAtributo, baseAtributo + 20),
        pase: random(baseAtributo + 15, baseAtributo + 35),
        defensa: random(baseAtributo - 10, baseAtributo + 10),
        fisico: random(baseAtributo, baseAtributo + 20),
      };
    case Position.DEL:
      return {
        velocidad: random(baseAtributo + 10, baseAtributo + 30),
        remate: random(baseAtributo + 20, baseAtributo + 40),
        pase: random(baseAtributo, baseAtributo + 20),
        defensa: random(baseAtributo - 30, baseAtributo - 10),
        fisico: random(baseAtributo, baseAtributo + 20),
      };
  }
}

/**
 * Crea una liga completa de prueba con 20 equipos
 */
export function crearLigaCompleta(nombreLiga: string = "Campeonato 2024-2025"): ILeagueFixture {
  const equipos = crearEquiposLiga();
  return LeagueService.crearLiga(equipos, nombreLiga);
}

/**
 * Crea un mapa de equipos para fácil acceso por ID
 */
export function crearMapaEquipos(equipos: Team[]): Map<string, Team> {
  const mapa = new Map<string, Team>();
  equipos.forEach((equipo) => {
    mapa.set(equipo.id, equipo);
  });
  return mapa;
}
