# Football Manager - TODO

## Clases Base y Lógica Core
- [x] Clase Jugador con atributos de rendimiento (Velocidad, Remate, Pase, Defensa, Físico)
- [x] Atributos de Jugador: posición (ARQ, DEF, MED, DEL), moral, energía, valor de mercado y sueldo
- [x] Método calcularPromedio() en Jugador
- [x] Clase Equipo con atributos (Nombre, Presupuesto, Estadio, Reputación)
- [x] Gestión de plantel, titulares y suplentes en Equipo
- [x] Validación de 11 titulares con al menos 1 arquero
- [x] Lógica de guardado/carga en JSON
- [x] Servicio de almacenamiento con AsyncStorage
- [x] Contexto global para gestionar estado del club
- [x] Utilidades para generar datos de prueba

## Interfaz de Usuario - Pantallas
- [ ] Pantalla de inicio/menú principal
- [ ] Pantalla de creación de nuevo equipo
- [ ] Pantalla de carga de equipo guardado
- [ ] Pantalla de vista del plantel completo
- [ ] Pantalla de titulares (11 jugadores)
- [ ] Pantalla de suplentes
- [ ] Pantalla de detalles del jugador
- [ ] Pantalla de gestión de presupuesto
- [ ] Pantalla de estadísticas del equipo
- [ ] Pantalla de configuración

## Funcionalidades Adicionales
- [ ] Agregar/remover jugadores del plantel
- [ ] Editar atributos de jugadores
- [ ] Cambiar titulares y suplentes
- [ ] Visualizar promedio del equipo
- [ ] Calcular costo total de sueldos
- [ ] Calcular valor total del plantel
- [ ] Exportar/importar club en JSON
- [ ] Historial de guardados
- [ ] Búsqueda de jugadores
- [ ] Filtrar jugadores por posición

## Branding y Configuración
- [x] Generar logo personalizado de la aplicación
- [x] Actualizar app.config.ts con nombre y logo
- [ ] Configurar colores del tema
- [ ] Configurar iconos de tab bar

## Testing y Validación
- [ ] Pruebas unitarias de Jugador
- [ ] Pruebas unitarias de Equipo
- [ ] Pruebas de guardado/carga JSON
- [ ] Pruebas de StorageService
- [ ] Pruebas de validación de titulares
- [ ] Pruebas end-to-end de flujos principales
