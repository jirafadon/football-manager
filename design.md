# Football Manager - Diseño de Interfaz Móvil

## Visión General

Football Manager es una aplicación móvil de gestión de equipos de fútbol que permite a los usuarios crear, gestionar y personalizar sus propios equipos. La aplicación está diseñada para ser intuitiva, rápida y accesible desde cualquier dispositivo móvil en orientación vertical (9:16).

## Pantallas Principales

### 1. Pantalla de Inicio (Home)
**Propósito:** Menú principal de la aplicación

**Contenido:**
- Logo y título "Football Manager"
- Botón primario "Nuevo Equipo"
- Botón secundario "Cargar Equipo" (si hay equipos guardados)
- Lista de equipos guardados recientemente
- Información descriptiva de la aplicación

**Funcionalidad:**
- Crear un nuevo equipo con datos de ejemplo
- Cargar un equipo previamente guardado
- Ver historial de equipos

### 2. Pantalla de Equipo (Team)
**Propósito:** Visualizar y gestionar el equipo actual

**Contenido:**
- Encabezado con información del equipo:
  - Nombre del equipo
  - Estadio
  - Presupuesto disponible
  - Reputación (0-100)
  - Promedio general del equipo

- Tabs de navegación:
  - Plantel (todos los jugadores)
  - Titulares (11 jugadores)
  - Suplentes (resto del plantel)

- Lista de jugadores con:
  - Número de camiseta
  - Nombre
  - Posición (ARQ, DEF, MED, DEL)
  - Promedio de atributos
  - Edad
  - Atributos principales (Velocidad, Remate, Pase, Defensa, Físico)
  - Estado (Moral, Energía)
  - Valor de mercado
  - Sueldo mensual

- Estadísticas del equipo:
  - Costo total de sueldos mensuales
  - Valor total del plantel

- Botones de acción:
  - Guardar Equipo
  - Volver

### 3. Pantalla de Detalle de Jugador (Futuro)
**Propósito:** Ver y editar información detallada de un jugador

**Contenido:**
- Información completa del jugador
- Gráfico de atributos
- Historial de cambios
- Opciones de edición

## Flujos de Usuario Principales

### Flujo 1: Crear Nuevo Equipo
1. Usuario abre la aplicación → Pantalla de Inicio
2. Toca "Nuevo Equipo"
3. Se crea un equipo de ejemplo (Real Madrid)
4. Se navega a Pantalla de Equipo
5. Usuario puede visualizar el plantel completo

### Flujo 2: Cargar Equipo Guardado
1. Usuario abre la aplicación → Pantalla de Inicio
2. Selecciona un equipo de la lista de guardados
3. Se carga el equipo desde almacenamiento local
4. Se navega a Pantalla de Equipo

### Flujo 3: Guardar Equipo
1. Usuario está en Pantalla de Equipo
2. Realiza cambios (agregar/remover jugadores, cambiar titulares)
3. Toca "Guardar Equipo"
4. Se persisten los cambios en AsyncStorage
5. Se muestra confirmación

## Paleta de Colores

| Elemento | Color | Uso |
|----------|-------|-----|
| Primario | #0a7ea4 (Azul) | Botones principales, acentos |
| Fondo | #ffffff (Blanco) | Fondo de pantalla (light mode) |
| Fondo | #151718 (Gris oscuro) | Fondo de pantalla (dark mode) |
| Superficie | #f5f5f5 (Gris claro) | Tarjetas, componentes |
| Texto Principal | #11181C (Gris oscuro) | Títulos, texto principal |
| Texto Secundario | #687076 (Gris) | Subtítulos, texto secundario |
| Borde | #E5E7EB (Gris muy claro) | Bordes, divisores |
| Éxito | #22C55E (Verde) | Estados positivos |
| Advertencia | #F59E0B (Naranja) | Estados de advertencia |
| Error | #EF4444 (Rojo) | Estados de error |

## Colores por Posición (Tarjetas de Jugador)

| Posición | Color de Fondo | Significado |
|----------|---|---|
| ARQ (Arquero) | Azul claro | Portero |
| DEF (Defensa) | Verde claro | Defensa |
| MED (Centrocampista) | Amarillo claro | Mediocampo |
| DEL (Delantero) | Rojo claro | Ataque |

## Principios de Diseño

### 1. Uso de Una Mano
- Todos los elementos interactivos están dentro del rango de alcance del pulgar
- Botones principales en la parte inferior de la pantalla
- Información importante en la parte superior

### 2. Jerarquía Visual
- Títulos grandes y en negrita para nombres de equipos y jugadores
- Información secundaria en gris más claro
- Uso de espaciado para separar secciones

### 3. Feedback Inmediato
- Cambio de opacidad al tocar elementos
- Indicadores de carga durante operaciones
- Mensajes de confirmación después de guardar

### 4. Consistencia
- Mismos patrones de diseño en todas las pantallas
- Mismo sistema de colores y tipografía
- Mismos componentes reutilizables

### 5. Accesibilidad
- Contraste suficiente entre texto y fondo
- Tamaños de fuente legibles
- Espaciado adecuado entre elementos

## Componentes Reutilizables

| Componente | Descripción |
|---|---|
| ScreenContainer | Envoltorio de pantalla con SafeArea |
| PlayerCard | Tarjeta de jugador con información resumida |
| StatisticBox | Caja de estadísticas del equipo |
| TabButton | Botón de tab para cambiar vistas |
| ActionButton | Botón de acción primario/secundario |

## Animaciones y Transiciones

- **Transiciones de pantalla:** Fade suave (250ms)
- **Presión de botones:** Escala 0.97 (80ms)
- **Cambio de tabs:** Fade suave (200ms)
- **Carga de datos:** Spinner centrado

## Tipografía

| Elemento | Fuente | Tamaño | Peso |
|---|---|---|---|
| Título de pantalla | Sistema | 32px | Bold |
| Encabezado de sección | Sistema | 18px | Semibold |
| Texto principal | Sistema | 16px | Regular |
| Texto secundario | Sistema | 14px | Regular |
| Etiqueta | Sistema | 12px | Regular |

## Espaciado

- Padding estándar: 16px
- Gap entre elementos: 8px
- Gap entre secciones: 16px
- Radio de bordes: 8-12px

## Consideraciones Futuras

- Pantalla de edición de jugadores
- Pantalla de creación de equipos personalizado
- Pantalla de configuración
- Pantalla de estadísticas avanzadas
- Sistema de logros
- Modo multijugador
