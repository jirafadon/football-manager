/**
 * Motor de Tácticas - Sistema interactivo de flechas de movimiento
 * Drag & Drop nativo en Canvas sin librerías externas
 */

class TacticaManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('⚠ Canvas de pizarra táctica no encontrado');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.jugadores = []; // Array de {id, x, y, numero, nombre}
        this.flechas = {}; // {idJugador: {fromX, fromY, toX, toY}}
        this.instruccionesTacticas = {}; // {idJugador: {offsetX, offsetY}}
        
        this.jugadorSeleccionado = null;
        this.dibujandoFlecha = false;
        this.puntoFinal = { x: 0, y: 0 };
        
        this.radioJugador = 15;
        this.anchoCancha = 400;
        this.altoCancha = 300;
        
        this.setupEventos();
        this.dibujarCancha();
    }

    /**
     * Configura eventos de mouse y touch
     */
    setupEventos() {
        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    /**
     * Obtiene coordenadas relativas al canvas
     */
    getCoordsRelativas(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        return { x, y };
    }

    /**
     * Detecta si un punto está dentro de un círculo (jugador)
     */
    puntoEnCirculo(px, py, cx, cy, radio) {
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= radio * radio;
    }

    /**
     * Busca jugador en coordenadas
     */
    buscarJugadorEnPunto(x, y) {
        for (let j of this.jugadores) {
            if (this.puntoEnCirculo(x, y, j.x, j.y, this.radioJugador)) {
                return j;
            }
        }
        return null;
    }

    // ============ EVENTOS DE MOUSE ============
    handleMouseDown(e) {
        const { x, y } = this.getCoordsRelativas(e);
        const jugador = this.buscarJugadorEnPunto(x, y);
        
        if (!jugador) return;
        
        // Click derecho o presión larga = dibujar flecha
        if (e.button === 2 || e.ctrlKey) {
            this.jugadorSeleccionado = jugador;
            this.dibujandoFlecha = true;
            this.puntoFinal = { x, y };
        }
    }

    handleMouseMove(e) {
        if (!this.dibujandoFlecha || !this.jugadorSeleccionado) return;
        
        const { x, y } = this.getCoordsRelativas(e);
        this.puntoFinal = { x, y };
        this.dibujar();
    }

    handleMouseUp(e) {
        if (!this.dibujandoFlecha || !this.jugadorSeleccionado) return;
        
        const { x, y } = this.getCoordsRelativas(e);
        
        // Calcular offset
        const offsetX = x - this.jugadorSeleccionado.x;
        const offsetY = y - this.jugadorSeleccionado.y;
        
        // Guardar instrucción táctica
        this.instruccionesTacticas[this.jugadorSeleccionado.id] = { offsetX, offsetY };
        this.flechas[this.jugadorSeleccionado.id] = {
            fromX: this.jugadorSeleccionado.x,
            fromY: this.jugadorSeleccionado.y,
            toX: x,
            toY: y
        };
        
        this.dibujandoFlecha = false;
        this.jugadorSeleccionado = null;
        this.dibujar();
    }

    // ============ EVENTOS DE TOUCH ============
    handleTouchStart(e) {
        const { x, y } = this.getCoordsRelativas(e);
        const jugador = this.buscarJugadorEnPunto(x, y);
        
        if (!jugador) return;
        
        this.jugadorSeleccionado = jugador;
        this.dibujandoFlecha = true;
        this.puntoFinal = { x, y };
    }

    handleTouchMove(e) {
        if (!this.dibujandoFlecha || !this.jugadorSeleccionado) return;
        
        e.preventDefault();
        const { x, y } = this.getCoordsRelativas(e);
        this.puntoFinal = { x, y };
        this.dibujar();
    }

    handleTouchEnd(e) {
        if (!this.dibujandoFlecha || !this.jugadorSeleccionado) return;
        
        const { x, y } = this.getCoordsRelativas(e);
        
        const offsetX = x - this.jugadorSeleccionado.x;
        const offsetY = y - this.jugadorSeleccionado.y;
        
        this.instruccionesTacticas[this.jugadorSeleccionado.id] = { offsetX, offsetY };
        this.flechas[this.jugadorSeleccionado.id] = {
            fromX: this.jugadorSeleccionado.x,
            fromY: this.jugadorSeleccionado.y,
            toX: x,
            toY: y
        };
        
        this.dibujandoFlecha = false;
        this.jugadorSeleccionado = null;
        this.dibujar();
    }

    // ============ RENDERIZADO ============
    dibujarCancha() {
        // Fondo verde
        this.ctx.fillStyle = '#2e7d32';
        this.ctx.fillRect(0, 0, this.anchoCancha, this.altoCancha);
        
        // Líneas
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Línea central
        this.ctx.beginPath();
        this.ctx.moveTo(this.anchoCancha / 2, 0);
        this.ctx.lineTo(this.anchoCancha / 2, this.altoCancha);
        this.ctx.stroke();
        
        // Círculo central
        this.ctx.beginPath();
        this.ctx.arc(this.anchoCancha / 2, this.altoCancha / 2, 25, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Punto central
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.anchoCancha / 2, this.altoCancha / 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    dibujar() {
        this.dibujarCancha();
        
        // Dibujar flechas guardadas
        Object.entries(this.flechas).forEach(([idJugador, flecha]) => {
            this.dibujarFlecha(flecha.fromX, flecha.fromY, flecha.toX, flecha.toY, '#00ff00');
        });
        
        // Dibujar jugadores
        this.jugadores.forEach(j => {
            const esSeleccionado = this.jugadorSeleccionado && this.jugadorSeleccionado.id === j.id;
            this.dibujarJugador(j, esSeleccionado);
        });
        
        // Dibujar flecha en progreso
        if (this.dibujandoFlecha && this.jugadorSeleccionado) {
            this.dibujarFlecha(
                this.jugadorSeleccionado.x,
                this.jugadorSeleccionado.y,
                this.puntoFinal.x,
                this.puntoFinal.y,
                '#ffff00'
            );
        }
    }

    dibujarJugador(jugador, seleccionado = false) {
        // Círculo
        this.ctx.fillStyle = seleccionado ? '#ffff00' : '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(jugador.x, jugador.y, this.radioJugador, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borde
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Número
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(jugador.numero, jugador.x, jugador.y);
    }

    dibujarFlecha(fromX, fromY, toX, toY, color) {
        const headlen = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Línea
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        // Punta de flecha
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();
    }

    // ============ API PÚBLICA ============
    agregarJugador(id, numero, nombre, x, y) {
        this.jugadores.push({ id, numero, nombre, x, y });
    }

    establecerJugadores(jugadoresArray) {
        this.jugadores = jugadoresArray;
        this.dibujar();
    }

    obtenerInstrucciones() {
        return this.instruccionesTacticas;
    }

    limpiarFlechas() {
        this.flechas = {};
        this.instruccionesTacticas = {};
        this.dibujar();
    }

    establecerFormacion(formacion) {
        // Formaciones predefinidas: 4-3-3, 4-2-3-1, 3-5-2, etc.
        const formaciones = {
            '4-3-3': [
                { x: 50, y: 150 }, // Portero
                { x: 100, y: 80 }, // Defensa izq
                { x: 100, y: 150 }, // Defensa central izq
                { x: 100, y: 210 }, // Defensa central der
                { x: 100, y: 280 }, // Defensa der
                { x: 200, y: 100 }, // Mediocampista izq
                { x: 200, y: 150 }, // Mediocampista central
                { x: 200, y: 200 }, // Mediocampista der
                { x: 300, y: 80 }, // Delantero izq
                { x: 300, y: 150 }, // Delantero central
                { x: 300, y: 220 } // Delantero der
            },
            '4-2-3-1': [
                { x: 50, y: 150 },
                { x: 100, y: 80 },
                { x: 100, y: 150 },
                { x: 100, y: 210 },
                { x: 100, y: 280 },
                { x: 180, y: 120 },
                { x: 180, y: 180 },
                { x: 250, y: 80 },
                { x: 250, y: 150 },
                { x: 250, y: 220 },
                { x: 320, y: 150 }
            ]
        };
        
        const posiciones = formaciones[formacion] || formaciones['4-3-3'];
        this.jugadores.forEach((j, idx) => {
            if (posiciones[idx]) {
                j.x = posiciones[idx].x;
                j.y = posiciones[idx].y;
            }
        });
        this.dibujar();
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TacticaManager;
}
