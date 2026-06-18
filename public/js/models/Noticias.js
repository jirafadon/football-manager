/**
 * Módulo de Noticias - Sistema de Bandeja de Entrada
 * Gestiona eventos del juego como notificaciones inmersivas
 */

class NoticiasManager {
    constructor() {
        this.bandeja = [];
        this.idCounter = 0;
    }

    /**
     * Agrega una noticia a la bandeja
     * @param {string} remitente - Origen de la noticia (ej: 'Cuerpo Médico', 'Directiva', 'Mercado')
     * @param {string} asunto - Título de la noticia
     * @param {string} cuerpo - Contenido detallado
     * @param {number} fecha - Fecha del evento (número de jornada)
     * @returns {object} Noticia creada
     */
    agregar(remitente, asunto, cuerpo, fecha) {
        const noticia = {
            id: this.idCounter++,
            fecha,
            remitente,
            asunto,
            cuerpo,
            leida: false,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.bandeja.unshift(noticia); // Agregar al inicio
        console.log(`📰 Noticia: ${remitente} - ${asunto}`);
        return noticia;
    }

    /**
     * Obtiene todas las noticias
     * @returns {array} Array de noticias
     */
    obtenerTodas() {
        return this.bandeja;
    }

    /**
     * Obtiene noticias no leídas
     * @returns {array} Array de noticias no leídas
     */
    obtenerNoLeidas() {
        return this.bandeja.filter(n => !n.leida);
    }

    /**
     * Marca una noticia como leída
     * @param {number} id - ID de la noticia
     */
    marcarComoLeida(id) {
        const noticia = this.bandeja.find(n => n.id === id);
        if (noticia) {
            noticia.leida = true;
        }
    }

    /**
     * Elimina una noticia
     * @param {number} id - ID de la noticia
     */
    eliminar(id) {
        this.bandeja = this.bandeja.filter(n => n.id !== id);
    }

    /**
     * Limpia toda la bandeja
     */
    limpiar() {
        this.bandeja = [];
    }

    /**
     * Obtiene el conteo de noticias no leídas
     * @returns {number} Cantidad de noticias no leídas
     */
    contarNoLeidas() {
        return this.obtenerNoLeidas().length;
    }

    // ============ EVENTOS PREDEFINIDOS ============

    /**
     * Noticia de lesión de jugador
     */
    lesionJugador(nombreJugador, semanas, fecha) {
        return this.agregar(
            'Cuerpo Médico',
            '🏥 Lesión en la plantilla',
            `El jugador ${nombreJugador} ha sufrido una lesión y será baja por ${semanas} semana(s).`,
            fecha
        );
    }

    /**
     * Noticia de transferencia completada
     */
    transferenciaCompletada(nombreJugador, equipoOrigen, equipoDestino, precio, fecha) {
        return this.agregar(
            'Mercado',
            '💰 Transferencia completada',
            `${nombreJugador} ha sido transferido de ${equipoOrigen} a ${equipoDestino} por €${precio.toLocaleString()}.`,
            fecha
        );
    }

    /**
     * Noticia de resumen de partido
     */
    resumenPartido(equipoLocal, equipoVisitante, golesLocal, golesVisitante, fecha) {
        const resultado = golesLocal > golesVisitante ? 'Victoria' : golesLocal < golesVisitante ? 'Derrota' : 'Empate';
        return this.agregar(
            'Resultados',
            `⚽ ${resultado}: ${equipoLocal} ${golesLocal} - ${golesVisitante} ${equipoVisitante}`,
            `Partido completado. ${equipoLocal} vs ${equipoVisitante} finalizó ${golesLocal}-${golesVisitante}.`,
            fecha
        );
    }

    /**
     * Noticia de alineación confirmada
     */
    alineacionConfirmada(equipo, formacion, fecha) {
        return this.agregar(
            'Directiva',
            '📋 Alineación confirmada',
            `${equipo} ha confirmado su alineación con formación ${formacion}.`,
            fecha
        );
    }

    /**
     * Noticia de cambio de técnico
     */
    cambioTecnico(equipo, tecnicoAnterior, tecnicoNuevo, fecha) {
        return this.agregar(
            'Directiva',
            '👨‍💼 Cambio de técnico',
            `${equipo} ha destituido a ${tecnicoAnterior} y ha contratado a ${tecnicoNuevo} como nuevo entrenador.`,
            fecha
        );
    }

    /**
     * Noticia de récord o hito
     */
    hito(titulo, descripcion, fecha) {
        return this.agregar(
            'Hitos',
            `🏅 ${titulo}`,
            descripcion,
            fecha
        );
    }

    /**
     * Noticia genérica
     */
    noticia(remitente, asunto, cuerpo, fecha) {
        return this.agregar(remitente, asunto, cuerpo, fecha);
    }
}

// Exportar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoticiasManager;
}
