/**
 * Módulo de Audio - Gestor de sonidos del juego
 * Exportable e importable en controladores principales
 */

class AudioManager {
    constructor() {
        this.sonidos = {
            silbato: null,
            patada: null,
            gol: null,
            publico_fondo: null
        };
        this.volumenGlobal = 1.0;
        this.ambienteActivo = false;
        this.cargarSonidos();
    }

    /**
     * Carga todos los sonidos desde /assets/audio/
     */
    cargarSonidos() {
        const rutaBase = './assets/audio/';
        
        try {
            this.sonidos.silbato = new Audio(rutaBase + 'silbato.mp3');
            this.sonidos.patada = new Audio(rutaBase + 'patada.mp3');
            this.sonidos.gol = new Audio(rutaBase + 'gol.mp3');
            this.sonidos.publico_fondo = new Audio(rutaBase + 'publico_fondo.mp3');
            
            // Configurar sonido de fondo para loop
            this.sonidos.publico_fondo.loop = true;
            this.sonidos.publico_fondo.volume = 0.2;
            
            console.log('✓ Sonidos cargados correctamente');
        } catch (error) {
            console.warn('⚠ Error cargando sonidos:', error);
        }
    }

    /**
     * Reproduce un sonido por nombre
     * @param {string} nombre - Nombre del sonido: 'silbato', 'patada', 'gol'
     */
    play(nombre) {
        if (!this.sonidos[nombre]) {
            console.warn(`⚠ Sonido no encontrado: ${nombre}`);
            return;
        }

        try {
            const sonido = this.sonidos[nombre];
            sonido.currentTime = 0; // Reiniciar desde el inicio
            sonido.volume = this.volumenGlobal;
            sonido.play().catch(err => {
                console.warn(`⚠ Error reproduciendo ${nombre}:`, err);
            });
        } catch (error) {
            console.warn(`⚠ Error en play('${nombre}'):`, error);
        }
    }

    /**
     * Inicia el ambiente del estadio (sonido de fondo)
     */
    iniciarAmbiente() {
        if (this.ambienteActivo) return;
        
        try {
            this.sonidos.publico_fondo.volume = 0.2 * this.volumenGlobal;
            this.sonidos.publico_fondo.play().catch(err => {
                console.warn('⚠ Error iniciando ambiente:', err);
            });
            this.ambienteActivo = true;
            console.log('✓ Ambiente de estadio iniciado');
        } catch (error) {
            console.warn('⚠ Error en iniciarAmbiente():', error);
        }
    }

    /**
     * Detiene el ambiente del estadio
     */
    detenerAmbiente() {
        if (!this.ambienteActivo) return;
        
        try {
            this.sonidos.publico_fondo.pause();
            this.sonidos.publico_fondo.currentTime = 0;
            this.ambienteActivo = false;
            console.log('✓ Ambiente de estadio detenido');
        } catch (error) {
            console.warn('⚠ Error en detenerAmbiente():', error);
        }
    }

    /**
     * Ajusta el volumen global (0.0 a 1.0)
     * @param {number} volumen - Valor entre 0 y 1
     */
    setVolumen(volumen) {
        this.volumenGlobal = Math.max(0, Math.min(1, volumen));
        
        // Aplicar a todos los sonidos activos
        Object.values(this.sonidos).forEach(sonido => {
            if (sonido) {
                sonido.volume = this.volumenGlobal;
            }
        });
    }

    /**
     * Detiene todos los sonidos
     */
    detenerTodo() {
        Object.values(this.sonidos).forEach(sonido => {
            if (sonido) {
                sonido.pause();
                sonido.currentTime = 0;
            }
        });
        this.ambienteActivo = false;
    }
}

// Exportar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
