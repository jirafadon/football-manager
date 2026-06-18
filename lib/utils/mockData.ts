import { Player } from "@/lib/models/Player";
import { Team } from "@/lib/models/Team";
import { Position, PerformanceAttributes } from "@/lib/types/football";

/**
 * Utilidades para generar datos de prueba
 */

/**
 * Genera atributos aleatorios para un jugador según su posición
 */
function generarAtributosPorPosicion(posicion: Position): PerformanceAttributes {
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (posicion) {
    case Position.ARQ:
      return {
        velocidad: random(40, 70),
        remate: random(20, 50),
        pase: random(50, 75),
        defensa: random(60, 85),
        fisico: random(70, 90),
      };
    case Position.DEF:
      return {
        velocidad: random(60, 80),
        remate: random(30, 60),
        pase: random(60, 80),
        defensa: random(75, 95),
        fisico: random(75, 95),
      };
    case Position.MED:
      return {
        velocidad: random(70, 90),
        remate: random(50, 75),
        pase: random(75, 95),
        defensa: random(50, 75),
        fisico: random(70, 85),
      };
    case Position.DEL:
      return {
        velocidad: random(75, 95),
        remate: random(75, 95),
        pase: random(60, 80),
        defensa: random(30, 60),
        fisico: random(70, 85),
      };
  }
}

/**
 * Crea un jugador aleatorio
 */
export function crearJugadorAleatorio(id: string, numero: number, posicion: Position): Player {
  const nombres = [
    "Carlos",
    "Diego",
    "Juan",
    "Miguel",
    "Fernando",
    "Roberto",
    "Andrés",
    "Pablo",
    "Ricardo",
    "Sergio",
    "Martín",
    "Javier",
    "Luis",
    "Alejandro",
    "Gustavo",
  ];
  const apellidos = [
    "García",
    "Rodríguez",
    "Martínez",
    "López",
    "González",
    "Pérez",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Flores",
    "Morales",
    "Vargas",
    "Castro",
    "Ruiz",
    "Díaz",
  ];

  const nombre = `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
  const atributos = generarAtributosPorPosicion(posicion);
  const edad = Math.floor(Math.random() * 15) + 18;
  const valorMercado = Math.floor(Math.random() * 50) + 5;
  const sueldo = Math.floor(Math.random() * 3) + 0.5;

  return new Player(id, nombre, posicion, atributos, edad, numero, valorMercado, sueldo);
}

/**
 * Crea un equipo completo con jugadores aleatorios
 */
export function crearEquipoCompleto(
  nombre: string,
  estadio: string = "Estadio Local",
  presupuesto: number = 100
): Team {
  const team = new Team(`team_${Date.now()}`, nombre, presupuesto, estadio, 50);

  // Crear arqueros (2)
  for (let i = 0; i < 2; i++) {
    const player = crearJugadorAleatorio(`player_${Date.now()}_${i}`, i + 1, Position.ARQ);
    team.agregarJugador(player);
  }

  // Crear defensas (6)
  for (let i = 2; i < 8; i++) {
    const player = crearJugadorAleatorio(`player_${Date.now()}_${i}`, i + 1, Position.DEF);
    team.agregarJugador(player);
  }

  // Crear centrocampistas (5)
  for (let i = 8; i < 13; i++) {
    const player = crearJugadorAleatorio(`player_${Date.now()}_${i}`, i + 1, Position.MED);
    team.agregarJugador(player);
  }

  // Crear delanteros (4)
  for (let i = 13; i < 17; i++) {
    const player = crearJugadorAleatorio(`player_${Date.now()}_${i}`, i + 1, Position.DEL);
    team.agregarJugador(player);
  }

  // Establecer titulares (11 jugadores)
  const titulares = [
    team.plantel[0], // 1 arquero
    team.plantel[2], // 4 defensas
    team.plantel[3],
    team.plantel[4],
    team.plantel[5],
    team.plantel[8], // 4 centrocampistas
    team.plantel[9],
    team.plantel[10],
    team.plantel[11],
    team.plantel[13], // 2 delanteros
    team.plantel[14],
  ];

  team.establecerTitulares(titulares);

  return team;
}

/**
 * Crea un equipo de ejemplo con datos predefinidos
 */
export function crearEquipoEjemplo(): Team {
  const team = new Team("team_ejemplo", "Real Madrid", 500, "Santiago Bernabéu", 95);

  // Arquero
  const arquero = new Player(
    "player_1",
    "Andrés Lunin",
    Position.ARQ,
    { velocidad: 65, remate: 30, pase: 70, defensa: 85, fisico: 88 },
    25,
    1,
    50,
    2.5
  );

  // Defensas
  const defensas = [
    new Player(
      "player_2",
      "Antonio Rüdiger",
      Position.DEF,
      { velocidad: 78, remate: 45, pase: 75, defensa: 92, fisico: 90 },
      31,
      2,
      80,
      3.5
    ),
    new Player(
      "player_3",
      "Eder Militao",
      Position.DEF,
      { velocidad: 82, remate: 50, pase: 72, defensa: 90, fisico: 88 },
      25,
      3,
      120,
      4.5
    ),
    new Player(
      "player_4",
      "Ferland Mendy",
      Position.DEF,
      { velocidad: 88, remate: 40, pase: 70, defensa: 82, fisico: 85 },
      28,
      23,
      70,
      3.2
    ),
    new Player(
      "player_5",
      "Dani Carvajal",
      Position.DEF,
      { velocidad: 78, remate: 50, pase: 75, defensa: 85, fisico: 80 },
      32,
      2,
      50,
      2.8
    ),
  ];

  // Centrocampistas
  const centrocampistas = [
    new Player(
      "player_6",
      "Luka Modrić",
      Position.MED,
      { velocidad: 78, remate: 75, pase: 92, defensa: 70, fisico: 82 },
      38,
      10,
      60,
      4.2
    ),
    new Player(
      "player_7",
      "Toni Kroos",
      Position.MED,
      { velocidad: 76, remate: 80, pase: 90, defensa: 72, fisico: 80 },
      33,
      8,
      70,
      4.5
    ),
    new Player(
      "player_8",
      "Aurélien Tchouaméni",
      Position.MED,
      { velocidad: 82, remate: 72, pase: 80, defensa: 78, fisico: 85 },
      24,
      18,
      100,
      4.0
    ),
  ];

  // Delanteros
  const delanteros = [
    new Player(
      "player_9",
      "Vinícius Júnior",
      Position.DEL,
      { velocidad: 92, remate: 88, pase: 78, defensa: 45, fisico: 85 },
      23,
      20,
      180,
      5.5
    ),
    new Player(
      "player_10",
      "Rodrygo Goes",
      Position.DEL,
      { velocidad: 88, remate: 82, pase: 75, defensa: 50, fisico: 82 },
      22,
      21,
      150,
      4.8
    ),
  ];

  // Agregar jugadores al equipo
  [arquero, ...defensas, ...centrocampistas, ...delanteros].forEach((player) => {
    team.agregarJugador(player);
  });

  // Establecer titulares
  const titulares = [
    arquero,
    defensas[0],
    defensas[1],
    defensas[2],
    defensas[3],
    centrocampistas[0],
    centrocampistas[1],
    centrocampistas[2],
    delanteros[0],
    delanteros[1],
    new Player(
      "player_11",
      "Jude Bellingham",
      Position.MED,
      { velocidad: 85, remate: 80, pase: 82, defensa: 75, fisico: 88 },
      20,
      5,
      200,
      6.0
    ),
  ];

  team.agregarJugador(titulares[titulares.length - 1]);
  team.establecerTitulares(titulares);

  return team;
}
