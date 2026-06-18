/**
 * MÓDULO CARGADOR DE BASE DE DATOS
 * Inspirado en Openfoot Manager - Sistema de carga de equipos, jugadores y assets
 * Soporta Facepacks y Logopacks locales con fallback automático
 */

class CargadorBD {
    constructor() {
        this.equipos = [];
        this.jugadores = [];
        this.assetsPendientes = [];
        this.pathFaces = './assets/faces/';
        this.pathShields = './assets/shields/';
        this.pathDefault = './assets/images/';
        this.config = {
            validarAssets: true,
            reintentos: 1,
            timeout: 5000
        };
    }

    /**
     * Carga la base de datos desde JSON
     * @param {string} rutaDB - Ruta al archivo db.json
     * @returns {Promise<Object>} Objeto con equipos y jugadores cargados
     */
    async cargarDB(rutaDB = './data/db.json') {
        try {
            console.log(`📦 Cargando base de datos desde: ${rutaDB}`);
            
            const response = await fetch(rutaDB);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: No se pudo cargar la BD`);
            }
            
            const data = await response.json();
            
            // Validar estructura
            if (!data.equipos || !Array.isArray(data.equipos)) {
                throw new Error('Estructura JSON inválida: falta array "equipos"');
            }
            
            console.log(`✓ JSON cargado correctamente`);
            
            // Procesar equipos y jugadores
            return this.procesarDatos(data);
            
        } catch (error) {
            console.error('❌ Error cargando BD:', error);
            throw error;
        }
    }

    /**
     * Procesa los datos del JSON y crea instancias
     * @param {Object} data - Datos del JSON
     * @returns {Promise<Object>} {equipos, jugadores}
     */
    async procesarDatos(data) {
        try {
            const equiposProcesados = [];
            const jugadoresProcesados = [];
            
            for (const equipoData of data.equipos) {
                console.log(`⚽ Procesando equipo: ${equipoData.nombre}`);
                
                // Crear equipo
                const equipo = this.crearEquipo(equipoData);
                equiposProcesados.push(equipo);
                
                // Procesar jugadores
                if (equipoData.plantilla && Array.isArray(equipoData.plantilla)) {
                    const jugadores = equipoData.plantilla.map(jugadorData => {
                        return this.crearJugador(jugadorData, equipo.id);
                    });
                    
                    equipo.plantel = jugadores;
                    equipo.alineacionTitular = jugadores.slice(0, 11);
                    
                    jugadoresProcesados.push(...jugadores);
                    console.log(`  ✓ ${jugadores.length} jugadores agregados`);
                }
            }
            
            this.equipos = equiposProcesados;
            this.jugadores = jugadoresProcesados;
            
            console.log(`✅ Datos procesados: ${equiposProcesados.length} equipos, ${jugadoresProcesados.length} jugadores`);
            
            return {
                equipos: equiposProcesados,
                jugadores: jugadoresProcesados
            };
            
        } catch (error) {
            console.error('❌ Error procesando datos:', error);
            throw error;
        }
    }

    /**
     * Crea una instancia de Equipo
     * @param {Object} equipoData - Datos del equipo
     * @returns {Equipo} Instancia de Equipo
     */
    crearEquipo(equipoData) {
        const equipo = new Equipo({
            id: equipoData.id,
            nombre: equipoData.nombre,
            escudoUrl: this.construirURLEscudo(equipoData.id),
            presupuesto: equipoData.presupuesto,
            estadio: equipoData.estadio,
            ciudad: equipoData.ciudad,
            pais: equipoData.pais,
            reputacion: equipoData.reputacion || 70,
            fundacion: equipoData.fundacion
        });
        
        return equipo;
    }

    /**
     * Crea una instancia de Jugador
     * @param {Object} jugadorData - Datos del jugador
     * @param {string} equipoId - ID del equipo
     * @returns {Jugador} Instancia de Jugador
     */
    crearJugador(jugadorData, equipoId) {
        const jugador = new Jugador({
            id: jugadorData.id,
            nombre: jugadorData.nombre,
            fotoUrl: this.construirURLFoto(jugadorData.id),
            numero: jugadorData.numero,
            edad: jugadorData.edad,
            nacionalidad: jugadorData.nacionalidad,
            posicion: jugadorData.posicion,
            // Atributos
            velocidad: jugadorData.atributos?.velocidad || 70,
            remate: jugadorData.atributos?.remate || 70,
            pase: jugadorData.atributos?.pase || 70,
            defensa: jugadorData.atributos?.defensa || 70,
            fisico: jugadorData.atributos?.fisico || 70,
            // Contrato
            sueldoMensual: jugadorData.contrato?.sueldoMensual || 30000,
            anoVencimiento: jugadorData.contrato?.anoVencimiento || 2026,
            clausulaRescision: jugadorData.contrato?.clausulaRescision || 5000000,
            fechaFirma: jugadorData.contrato?.fechaFirma || 2023,
            bonificacionesAdicionales: jugadorData.contrato?.bonificacionesAdicionales || 0,
            // Estado
            moral: jugadorData.moral || 80,
            energia: jugadorData.energia || 100,
            lesionado: jugadorData.lesionado || false,
            diasLesion: jugadorData.diasLesion || 0,
            valor: this.calcularValor(jugadorData)
        });
        
        jugador.equipoId = equipoId;
        return jugador;
    }

    /**
     * Construye la URL de la foto del jugador
     * @param {string} jugadorId - ID del jugador
     * @returns {string} URL de la foto
     */
    construirURLFoto(jugadorId) {
        return `${this.pathFaces}${jugadorId}.png`;
    }

    /**
     * Construye la URL del escudo del equipo
     * @param {string} equipoId - ID del equipo
     * @returns {string} URL del escudo
     */
    construirURLEscudo(equipoId) {
        return `${this.pathShields}${equipoId}.png`;
    }

    /**
     * Obtiene la URL de fallback para fotos
     * @returns {string} URL de foto por defecto
     */
    obtenerFotoDefault() {
        return `${this.pathDefault}default-player.png`;
    }

    /**
     * Obtiene la URL de fallback para escudos
     * @returns {string} URL de escudo por defecto
     */
    obtenerEscudoDefault() {
        return `${this.pathDefault}default-shield.png`;
    }

    /**
     * Calcula el valor de un jugador
     * @param {Object} jugadorData - Datos del jugador
     * @returns {number} Valor en euros
     */
    calcularValor(jugadorData) {
        const atributos = jugadorData.atributos || {};
        const edad = jugadorData.edad || 25;
        
        const promedio = (
            (atributos.velocidad || 70) +
            (atributos.remate || 70) +
            (atributos.pase || 70) +
            (atributos.defensa || 70) +
            (atributos.fisico || 70)
        ) / 5;
        
        let valor = promedio * 100000;
        
        if (edad < 23) {
            valor *= 1.3;
        } else if (edad > 32) {
            valor *= 0.7;
        } else if (edad >= 28 && edad <= 31) {
            valor *= 1.1;
        }
        
        return Math.round(valor);
    }

    /**
     * Verifica la disponibilidad de un asset
     * @param {string} url - URL del asset
     * @returns {Promise<boolean>} true si existe, false si no
     */
    async verificarAsset(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Obtiene estadísticas de carga
     * @returns {Object} Estadísticas
     */
    obtenerEstadisticas() {
        return {
            equiposCargados: this.equipos.length,
            jugadoresCargados: this.jugadores.length,
            sueldoTotalMensual: this.jugadores.reduce((sum, j) => sum + j.contrato.sueldoMensual, 0),
            valorTotalPlantel: this.jugadores.reduce((sum, j) => sum + j.valor, 0)
        };
    }
}

// Instancia global
const cargadorBD = new CargadorBD();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CargadorBD;
}
