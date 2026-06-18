/**
 * UTILIDADES DE IMAGEN CON FALLBACK
 * Sistema de manejo de imágenes con fallback automático
 * Inspirado en Openfoot Manager
 */

class ImagenFallback {
    constructor() {
        this.fotoDefault = './assets/images/default-player.png';
        this.escudoDefault = './assets/images/default-shield.png';
        this.cache = new Map();
    }

    /**
     * Crea un atributo onerror para una imagen de jugador
     * @param {string} fotoUrl - URL de la foto
     * @param {string} fallback - URL de fallback (opcional)
     * @returns {string} Código del evento onerror
     */
    crearOnerrorFoto(fotoUrl, fallback = null) {
        const urlFallback = fallback || this.fotoDefault;
        return `this.onerror=null; this.src='${urlFallback}'; this.classList.add('imagen-fallback');`;
    }

    /**
     * Crea un atributo onerror para un escudo
     * @param {string} escudoUrl - URL del escudo
     * @param {string} fallback - URL de fallback (opcional)
     * @returns {string} Código del evento onerror
     */
    crearOnerrorEscudo(escudoUrl, fallback = null) {
        const urlFallback = fallback || this.escudoDefault;
        return `this.onerror=null; this.src='${urlFallback}'; this.classList.add('imagen-fallback');`;
    }

    /**
     * Crea un tag <img> con fallback integrado para jugador
     * @param {string} jugadorId - ID del jugador
     * @param {string} nombre - Nombre del jugador
     * @param {Object} opciones - Opciones de renderizado
     * @returns {string} HTML de la imagen
     */
    crearImgJugador(jugadorId, nombre, opciones = {}) {
        const {
            clase = 'jugador-foto',
            ancho = 70,
            alto = 70,
            fotoUrl = null,
            fallback = null
        } = opciones;

        const url = fotoUrl || `./assets/faces/${jugadorId}.png`;
        const onerror = this.crearOnerrorFoto(url, fallback);

        return `<img 
            src="${url}" 
            alt="${nombre}"
            class="${clase}"
            width="${ancho}"
            height="${alto}"
            onerror="${onerror}"
        >`;
    }

    /**
     * Crea un tag <img> con fallback integrado para escudo
     * @param {string} equipoId - ID del equipo
     * @param {string} nombre - Nombre del equipo
     * @param {Object} opciones - Opciones de renderizado
     * @returns {string} HTML de la imagen
     */
    crearImgEscudo(equipoId, nombre, opciones = {}) {
        const {
            clase = 'escudo-equipo',
            ancho = 48,
            alto = 48,
            escudoUrl = null,
            fallback = null
        } = opciones;

        const url = escudoUrl || `./assets/shields/${equipoId}.png`;
        const onerror = this.crearOnerrorEscudo(url, fallback);

        return `<img 
            src="${url}" 
            alt="${nombre}"
            class="${clase}"
            width="${ancho}"
            height="${alto}"
            onerror="${onerror}"
        >`;
    }

    /**
     * Registra un listener de onerror en una imagen existente
     * @param {HTMLImageElement} img - Elemento img
     * @param {string} tipoAsset - 'foto' o 'escudo'
     */
    registrarOnerror(img, tipoAsset = 'foto') {
        if (!img) return;

        const fallback = tipoAsset === 'escudo' ? this.escudoDefault : this.fotoDefault;

        img.onerror = function() {
            this.src = fallback;
            this.classList.add('imagen-fallback');
            this.onerror = null; // Prevenir loop infinito
        };
    }

    /**
     * Procesa todas las imágenes de una sección del DOM
     * @param {string} selector - Selector CSS
     * @param {string} tipoAsset - 'foto' o 'escudo'
     */
    procesarImagenesDOM(selector, tipoAsset = 'foto') {
        const imagenes = document.querySelectorAll(selector);
        imagenes.forEach(img => {
            this.registrarOnerror(img, tipoAsset);
        });
    }

    /**
     * Obtiene la URL de una imagen con validación
     * @param {string} jugadorId - ID del jugador
     * @param {string} tipo - 'foto' o 'escudo'
     * @returns {string} URL de la imagen
     */
    obtenerURL(id, tipo = 'foto') {
        if (tipo === 'escudo') {
            return `./assets/shields/${id}.png`;
        }
        return `./assets/faces/${id}.png`;
    }

    /**
     * Precargar imágenes para mejor rendimiento
     * @param {Array<string>} urls - Array de URLs
     * @returns {Promise<void>}
     */
    async precargarImagenes(urls) {
        const promesas = urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.cache.set(url, true);
                    resolve();
                };
                img.onerror = () => {
                    this.cache.set(url, false);
                    resolve();
                };
                img.src = url;
            });
        });

        await Promise.all(promesas);
    }

    /**
     * Obtiene estadísticas de caché
     * @returns {Object} Estadísticas
     */
    obtenerEstadisticas() {
        let cargadas = 0;
        let fallidas = 0;

        this.cache.forEach(valor => {
            if (valor) cargadas++;
            else fallidas++;
        });

        return {
            total: this.cache.size,
            cargadas,
            fallidas,
            porcentajeExito: this.cache.size > 0 ? ((cargadas / this.cache.size) * 100).toFixed(2) : 0
        };
    }
}

// Instancia global
const imagenFallback = new ImagenFallback();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImagenFallback;
}
