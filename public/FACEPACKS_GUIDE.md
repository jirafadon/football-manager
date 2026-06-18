# 📦 Guía de Instalación de Facepacks y Logopacks

## Descripción

Football Manager soporta **Facepacks** (fotos de jugadores) y **Logopacks** (escudos de equipos) locales, inspirado en el sistema de Openfoot Manager.

Si no instalas estos packs, el juego mostrará imágenes genéricas por defecto, pero funcionará perfectamente.

---

## 📂 Estructura de Carpetas

```
public/
├── assets/
│   ├── faces/
│   │   ├── p_rossi.png           ← Foto del jugador (150x150px recomendado)
│   │   ├── p_martinez.png
│   │   ├── r_armani.png
│   │   ├── default-player.png    ← Fallback genérico (incluido)
│   │   └── ...
│   ├── shields/
│   │   ├── BOC.png               ← Escudo del equipo (200x240px recomendado)
│   │   ├── RIV.png
│   │   ├── default-shield.png    ← Fallback genérico (incluido)
│   │   └── ...
│   └── images/
│       ├── default-player.png    ← Imagen por defecto de jugador
│       └── default-shield.png    ← Imagen por defecto de escudo
```

---

## 🎯 Instalación de Facepacks

### Paso 1: Obtener las fotos

Descarga fotos de jugadores en formato PNG (150x150px o 200x200px).

**Fuentes recomendadas:**
- [Transfermarkt](https://www.transfermarkt.com/) - Descargar fotos de perfil
- [Wikipedia](https://www.wikipedia.org/) - Fotos de jugadores
- [Wikimedia Commons](https://commons.wikimedia.org/) - Imágenes libres

### Paso 2: Nombrar los archivos

Los nombres de archivo **DEBEN coincidir** con los IDs de los jugadores en `data/db.json`:

```json
{
  "id": "p_rossi",           ← Este es el ID
  "nombre": "Sergio Rossi",
  ...
}
```

Archivo esperado: `assets/faces/p_rossi.png`

### Paso 3: Copiar a la carpeta

```bash
# Copiar todas las fotos a assets/faces/
cp /ruta/descargadas/*.png public/assets/faces/
```

### Paso 4: Verificar

Recarga el juego. Las fotos deberían aparecer en:
- Tarjetas de jugadores (Plantilla)
- Modal de renovación de contratos
- Mercado de jugadores

---

## 🏆 Instalación de Logopacks

### Paso 1: Obtener los escudos

Descarga escudos de equipos en formato PNG (200x240px o 256x256px).

**Fuentes recomendadas:**
- [Wikimedia Commons](https://commons.wikimedia.org/) - Escudos libres
- [Transfermarkt](https://www.transfermarkt.com/) - Logos de equipos
- [Wikipedia](https://www.wikipedia.org/) - Escudos de equipos

### Paso 2: Nombrar los archivos

Los nombres **DEBEN coincidir** con los IDs de los equipos en `data/db.json`:

```json
{
  "id": "BOC",               ← Este es el ID
  "nombre": "Boca Juniors",
  ...
}
```

Archivo esperado: `assets/shields/BOC.png`

### Paso 3: Copiar a la carpeta

```bash
# Copiar todos los escudos a assets/shields/
cp /ruta/descargados/*.png public/assets/shields/
```

### Paso 4: Verificar

Recarga el juego. Los escudos deberían aparecer en:
- Header del juego
- Tabla de posiciones
- Tarjetas de equipos

---

## 📋 Lista de IDs de Jugadores (Boca Juniors)

| ID | Nombre | Posición |
|----|--------|----------|
| p_rossi | Sergio Rossi | POR |
| p_martinez | Carlos Martínez | DEF |
| p_fernandez | Juan Fernández | DEF |
| p_lopez | Roberto López | DEF |
| p_torres | Diego Torres | MED |
| p_sanchez | Miguel Sánchez | MED |
| p_garcia | Pablo García | MED |
| p_moreno | Andrés Moreno | MED |
| p_ramirez | Cristian Ramírez | DEL |
| p_perez | Javier Pérez | DEL |
| p_silva | Mateo Silva | DEL |
| p_gomez | Francisco Gómez | POR |
| p_vega | Lucas Vega | DEF |
| p_ruiz | Alejandro Ruiz | MED |
| p_herrera | Nicolás Herrera | DEL |

---

## 📋 Lista de IDs de Jugadores (River Plate)

| ID | Nombre | Posición |
|----|--------|----------|
| r_armani | Franco Armani | POR |
| r_diaz | Gonzalo Díaz | DEF |
| r_rojas | Enzo Rojas | DEF |
| r_tapia | Nicolás Tapia | DEF |
| r_ponzio | Javier Ponzio | MED |
| r_alvarez | Julián Álvarez | MED |
| r_fernandez | Matías Fernández | MED |
| r_gomez | Agustín Gómez | MED |
| r_borja | Sebastián Borja | DEL |
| r_torres | Braian Torres | DEL |
| r_sosa | Ezequiel Sosa | DEL |
| r_lux | Gastón Lux | POR |
| r_casco | Milton Casco | DEF |
| r_carrascal | Santiago Carrascal | MED |
| r_simone | Ignacio Simone | DEL |

---

## 📋 Lista de IDs de Equipos

| ID | Equipo |
|----|--------|
| BOC | Boca Juniors |
| RIV | River Plate |

---

## 🎨 Recomendaciones de Tamaño

### Fotos de Jugadores
- **Ideal**: 150x150px o 200x200px
- **Formato**: PNG con transparencia
- **Proporción**: Cuadrada (1:1)
- **Compresión**: Optimizada para web (< 50KB por imagen)

### Escudos de Equipos
- **Ideal**: 200x240px o 256x256px
- **Formato**: PNG con transparencia
- **Proporción**: Vertical (5:6)
- **Compresión**: Optimizada para web (< 100KB por imagen)

---

## 🔄 Sistema de Fallback

Si una imagen no se carga:

1. El navegador intenta cargar la imagen especificada
2. Si falla (404 o timeout), se ejecuta el evento `onerror`
3. Se muestra automáticamente la imagen genérica por defecto
4. Se agrega la clase CSS `imagen-fallback` para identificarla

**Imágenes genéricas incluidas:**
- `assets/images/default-player.png` - Cara genérica
- `assets/images/default-shield.png` - Escudo genérico

---

## 🛠️ Solución de Problemas

### Las imágenes no aparecen

**Causa**: Nombres de archivo incorrectos

**Solución**: 
1. Verifica que el nombre coincida exactamente con el ID en `db.json`
2. Verifica que estén en la carpeta correcta (`assets/faces/` o `assets/shields/`)
3. Recarga el juego (Ctrl+F5 para limpiar caché)

### Las imágenes se ven pixeladas

**Causa**: Resolución muy baja

**Solución**:
1. Usa imágenes de al menos 150x150px
2. Considera usar 200x200px para mejor calidad

### El juego es lento con muchas imágenes

**Causa**: Muchas imágenes sin optimizar

**Solución**:
1. Comprime las imágenes con herramientas como [TinyPNG](https://tinypng.com/)
2. Usa formato PNG optimizado
3. Considera usar WebP para mejor compresión

---

## 📦 Crear tu propio Facepack

### Opción 1: Descargar masivamente

```bash
# Usando wget (Linux/Mac)
wget -r -A "*.png" https://ejemplo.com/fotos/ -P ./assets/faces/

# Usando PowerShell (Windows)
# Descarga manualmente o usa herramientas como DownThemAll
```

### Opción 2: Usar scripts de scraping

```python
# Python - Descargar fotos de Transfermarkt
import requests
from bs4 import BeautifulSoup

url = "https://www.transfermarkt.com/boca-juniors/kader/verein/141"
# ... script de scraping
```

### Opción 3: Usar herramientas online

- [Bulk Image Downloader](https://www.bulkimagedownloader.com/)
- [DownThemAll](https://www.downthemall.net/)
- [Image Cyborg](https://www.imagecyborg.com/)

---

## 📝 Notas Importantes

- **No es obligatorio** instalar Facepacks/Logopacks. El juego funciona perfectamente con imágenes genéricas.
- Las imágenes se cachean automáticamente en el navegador.
- Puedes actualizar imágenes en cualquier momento reemplazando los archivos.
- El sistema de fallback es automático y no requiere configuración.

---

## 🤝 Contribuir

¿Tienes un Facepack o Logopack de alta calidad?

Puedes compartirlo en el repositorio del proyecto:
- Crea un issue con el enlace de descarga
- O haz un Pull Request con las imágenes

---

**¡Disfruta del juego!** ⚽
