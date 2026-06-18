# Motor de la Liga - Football Manager

## Descripción General

El motor de la liga es el núcleo del sistema de campeonato de Football Manager. Implementa un sistema completo de gestión de ligas con 20 equipos, 38 fechas (Round Robin), simulación de partidos realista y tabla de posiciones dinámica.

## Componentes Principales

### 1. Clase Match (`lib/models/Match.ts`)

Representa un partido individual entre dos equipos.

**Atributos:**
- `id`: Identificador único del partido
- `fecha`: Número de fecha (1-38)
- `equipoLocal` / `equipoVisitante`: IDs de los equipos
- `golesLocal` / `golesVisitante`: Goles marcados
- `resultado`: Resultado del partido (HOME_WIN, AWAY_WIN, DRAW)
- `jugado`: Booleano indicando si el partido ya se jugó
- `fechaPartido`: Timestamp del partido

**Métodos Clave:**
- `establecerResultado(golesLocal, golesVisitante)`: Establece el resultado
- `obtenerPuntosLocal()` / `obtenerPuntosVisitante()`: Retorna puntos (3 victoria, 1 empate, 0 derrota)

### 2. Generador de Fixtures (`lib/models/FixtureGenerator.ts`)

Implementa el algoritmo Round Robin para generar 38 fechas de campeonato.

**Algoritmo:**
- Genera 19 fechas de ida (todos contra todos)
- Genera 19 fechas de vuelta (invertidas)
- Total: 38 fechas, 380 partidos (20 equipos × 19 partidos cada uno)

**Métodos Clave:**
- `generarFixture(equipoIds, nombreLiga)`: Crea un fixture completo
- `validarFixture(fixture)`: Valida que el fixture sea válido
- `obtenerPartidosPorFecha(fixture, numeroFecha)`: Retorna partidos de una fecha
- `obtenerPartidosEquipo(fixture, equipoId)`: Retorna todos los partidos de un equipo

### 3. Tabla de Posiciones (`lib/models/LeagueTable.ts`)

Gestiona el cálculo y ordenamiento automático de posiciones.

**Estadísticas por Equipo:**
- Partidos jugados, ganados, empatados, perdidos
- Goles a favor, goles en contra, diferencia
- Puntos (ganados × 3 + empatados × 1)

**Criterios de Ordenamiento:**
1. Puntos (descendente)
2. Diferencia de goles (descendente)
3. Goles a favor (descendente)
4. Orden alfabético (ascendente)

**Métodos Clave:**
- `actualizarTabla(partidos)`: Recalcula la tabla basándose en los partidos
- `obtenerPosicionEquipo(equipoId)`: Retorna la posición de un equipo
- `obtenerTopEquipos(cantidad)`: Retorna los primeros N equipos
- `obtenerUltimosEquipos(cantidad)`: Retorna los últimos N equipos

### 4. Simulador de Partidos (`lib/models/MatchSimulator.ts`)

Simula resultados de partidos basándose en la fuerza de los equipos.

**Factores Considerados:**
- **Promedio de Atributos**: Se calcula el promedio general de cada equipo
- **Factor de Localía**: El equipo local tiene una ventaja del 15% (FACTOR_LOCALÍA = 1.15)
- **Probabilidad de Victoria**: Calculada usando fórmula de Elo modificada
- **Distribución de Goles**: Usa aproximación de Poisson para generar goles realistas

**Fórmula de Probabilidad:**
```
P(Victoria Local) = 1 / (1 + 10^((Visitante - Local) / 40))
```

**Métodos Clave:**
- `simularPartido(partido, equipoLocal, equipoVisitante)`: Simula un partido individual
- `simularPartidos(partidos, equipos)`: Simula múltiples partidos
- `simularFecha(partidos, equipos, numeroFecha)`: Simula una fecha completa
- `simularCampeonatoCompleto(partidos, equipos)`: Simula el resto del campeonato

### 5. Servicio de Liga (`lib/services/LeagueService.ts`)

Orquesta todas las operaciones de la liga.

**Métodos Principales:**
- `crearLiga(equipos, nombreLiga)`: Crea una nueva liga
- `simularFecha(fixture, equipos, numeroFecha)`: Simula una fecha
- `simularCampeonatoCompleto(fixture, equipos)`: Simula el resto del campeonato
- `obtenerProximoPartido(fixture, equipoId)`: Obtiene el próximo partido de un equipo
- `obtenerEstadisticasEquipo(fixture, equipoId)`: Retorna estadísticas de un equipo
- `obtenerTabla(fixture)`: Retorna la tabla de posiciones actual
- `obtenerZonaChampions(fixture)`: Retorna los 4 primeros (Champions)
- `obtenerZonaDescenso(fixture)`: Retorna los 3 últimos (Descenso)

## Flujo de Uso

### 1. Crear una Liga

```typescript
import { crearEquiposLiga } from "@/lib/utils/leagueMockData";
import { LeagueService } from "@/lib/services/LeagueService";

const equipos = crearEquiposLiga();
const fixture = LeagueService.crearLiga(equipos, "Campeonato 2024-2025");
```

### 2. Simular una Fecha

```typescript
const equiposMap = crearMapaEquipos(equipos);
const resultados = LeagueService.simularFecha(fixture, equiposMap, 1);
```

### 3. Obtener Tabla de Posiciones

```typescript
const tabla = LeagueService.obtenerTabla(fixture);
console.log(tabla.posiciones); // Array de posiciones ordenadas
```

### 4. Obtener Estadísticas de un Equipo

```typescript
const stats = LeagueService.obtenerEstadisticasEquipo(fixture, "team_liga_0");
console.log(stats.posicion, stats.puntos, stats.golesAFavor);
```

### 5. Simular el Campeonato Completo

```typescript
const todosLosResultados = LeagueService.simularCampeonatoCompleto(fixture, equiposMap);
```

## Estructura de Datos

### IMatch
```typescript
{
  id: string;
  fecha: number; // 1-38
  equipoLocal: string;
  equipoVisitante: string;
  golesLocal: number;
  golesVisitante: number;
  resultado: MatchResult; // HOME_WIN | AWAY_WIN | DRAW
  jugado: boolean;
  fechaPartido?: string;
}
```

### ITeamStanding
```typescript
{
  equipoId: string;
  nombre: string;
  posicion: number;
  partidos: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferencia: number;
  puntos: number;
}
```

### ILeagueFixture
```typescript
{
  id: string;
  nombre: string;
  equipos: string[]; // IDs de equipos
  partidos: IMatch[];
  tablaActual: ILeagueTable;
  estado: "NO_INICIADA" | "EN_CURSO" | "FINALIZADA";
  fechaActual: number;
}
```

## Características Avanzadas

### Validación de Fixtures

El generador valida que:
- Haya exactamente 38 partidos
- Cada equipo juegue 38 partidos (19 de local + 19 de visitante)
- No haya partidos duplicados

### Simulación Realista

- **Factor de Localía**: El equipo local tiene ventaja estadística
- **Distribución de Goles**: Usa Poisson para resultados realistas
- **Probabilidades Dinámicas**: Basadas en la fuerza relativa de los equipos
- **Variabilidad**: Cada simulación puede producir resultados diferentes

### Persistencia

Las ligas se pueden exportar/importar en JSON:
```typescript
const json = LeagueService.exportarLiga(fixture);
const fixtureRecuperado = LeagueService.importarLiga(json);
```

## Ejemplos de Uso

### Obtener Próximos Partidos de un Equipo

```typescript
const proximosPartidos = LeagueService.obtenerProximosPartidos(fixture, "team_liga_0", 5);
```

### Obtener Equipos en Zona de Champions

```typescript
const champions = LeagueService.obtenerZonaChampions(fixture);
```

### Obtener Estadísticas Generales de la Liga

```typescript
const stats = LeagueService.obtenerEstadisticasLiga(fixture);
console.log(stats.totalPartidos, stats.totalGoles, stats.promGolesPorPartido);
```

## Notas Técnicas

- **Algoritmo Round Robin**: Garantiza que todos los equipos jueguen contra todos
- **Complejidad**: O(n²) para generar fixtures, O(n) para simular partidos
- **Precisión**: Las probabilidades se basan en modelos estadísticos reales
- **Escalabilidad**: Diseñado para 20 equipos, pero puede adaptarse a otros números

## Futuras Mejoras

- Simulación con lesiones de jugadores
- Sistema de puntos deducidos (sanciones)
- Playoffs y fases finales
- Análisis de tendencias y predicciones
- Integración con API de datos reales
