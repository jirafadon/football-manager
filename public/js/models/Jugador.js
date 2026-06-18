/**
 * MODELO DE JUGADOR CON SISTEMA DE CONTRATOS
 * Gestión profesional de contratos, renovaciones y cláusulas
 */

class Jugador {
    constructor(datos) {
        // Datos básicos
        this.id = datos.id || `jug_${Math.random()}`;
        this.nombre = datos.nombre || 'Jugador';
        this.posicion = datos.posicion || 'MED';
        this.numero = datos.numero || 0;
        this.edad = datos.edad || 25;
        this.nacionalidad = datos.nacionalidad || 'España';
        
        // Atributos
        this.atributos = {
            velocidad: datos.velocidad || 70,
            remate: datos.remate || 70,
            pase: datos.pase || 70,
            defensa: datos.defensa || 70,
            fisico: datos.fisico || 70
        };
        
        // Estado
        this.moral = datos.moral || 80;
        this.energia = datos.energia || 100;
        this.lesionado = datos.lesionado || false;
        this.diasLesion = datos.diasLesion || 0;
        this.valor = datos.valor || 5000000; // En euros
        this.sueldo = datos.sueldo || 50000; // Sueldo mensual
        
        // SISTEMA DE CONTRATOS
        this.contrato = {
            sueldoMensual: datos.sueldoMensual || datos.sueldo || 50000,
            anoVencimiento: datos.anoVencimiento || 2026,
            clausulaRescision: datos.clausulaRescision || this.valor * 0.8,
            fechaFirma: datos.fechaFirma || new Date().getFullYear(),
            bonificacionesAdicionales: datos.bonificacionesAdicionales || 0,
            historialRenovaciones: []
        };
        
        // Historial
        this.estadisticas = {
            partidosJugados: datos.partidosJugados || 0,
            goles: datos.goles || 0,
            asistencias: datos.asistencias || 0,
            tarjetasAmarillas: datos.tarjetasAmarillas || 0,
            tarjetasRojas: datos.tarjetasRojas || 0
        };
    }

    /**
     * Calcula el promedio de atributos
     */
    calcularPromedio() {
        const { velocidad, remate, pase, defensa, fisico } = this.atributos;
        return (velocidad + remate + pase + defensa + fisico) / 5;
    }

    /**
     * Obtiene los años restantes del contrato
     */
    obtenerAnosRestantes(anoActual = new Date().getFullYear()) {
        return this.contrato.anoVencimiento - anoActual;
    }

    /**
     * Verifica si el contrato vence pronto (menos de 1 año)
     */
    contratoProntoAVencer(anoActual = new Date().getFullYear()) {
        return this.obtenerAnosRestantes(anoActual) <= 1 && this.obtenerAnosRestantes(anoActual) > 0;
    }

    /**
     * Verifica si el contrato ya venció
     */
    contratoVencido(anoActual = new Date().getFullYear()) {
        return this.obtenerAnosRestantes(anoActual) <= 0;
    }

    /**
     * Calcula el sueldo anual
     */
    calcularSueldoAnual() {
        return this.contrato.sueldoMensual * 12 + this.contrato.bonificacionesAdicionales;
    }

    /**
     * Negocia una renovación de contrato
     * @param {number} nuevoSueldo - Nuevo sueldo mensual propuesto
     * @param {number} nuevosAnos - Años de extensión del contrato
     * @param {number} reputacionClub - Reputación del club (0-100)
     * @returns {object} {aceptado: boolean, razon: string, nuevoContrato?: object}
     */
    negociarRenovacion(nuevoSueldo, nuevosAnos, reputacionClub = 70) {
        // Validaciones
        if (nuevosAnos < 1 || nuevosAnos > 5) {
            return {
                aceptado: false,
                razon: 'Los años de contrato deben estar entre 1 y 5'
            };
        }

        const anoActual = new Date().getFullYear();
        const sueldoActual = this.contrato.sueldoMensual;
        const overallActual = this.calcularPromedio();
        
        // Calcular factores de aceptación
        const mejoraSalarial = ((nuevoSueldo - sueldoActual) / sueldoActual) * 100;
        const sueldoEsperado = (overallActual / 100) * 50000; // Sueldo base esperado según overall
        const sueldoOfertadoVsEsperado = ((nuevoSueldo - sueldoEsperado) / sueldoEsperado) * 100;

        // Factores de decisión
        let probabilidadAceptacion = 50; // Base 50%

        // Factor 1: Moral (más moral = más probable aceptar)
        probabilidadAceptacion += (this.moral - 50) * 0.5;

        // Factor 2: Reputación del club (más reputación = más probable aceptar)
        probabilidadAceptacion += (reputacionClub - 50) * 0.3;

        // Factor 3: Mejora salarial (más mejora = más probable aceptar)
        if (mejoraSalarial >= 20) {
            probabilidadAceptacion += 25;
        } else if (mejoraSalarial >= 10) {
            probabilidadAceptacion += 15;
        } else if (mejoraSalarial < 0) {
            probabilidadAceptacion -= Math.abs(mejoraSalarial) * 1.5;
        }

        // Factor 4: Años de contrato (más años = menos probable aceptar)
        if (nuevosAnos > 3) {
            probabilidadAceptacion -= 15;
        }

        // Factor 5: Edad del jugador (jugadores jóvenes más flexibles)
        if (this.edad < 25) {
            probabilidadAceptacion += 10;
        } else if (this.edad > 32) {
            probabilidadAceptacion += 5; // Veteranos quieren seguridad
        }

        // Generar resultado con cierta aleatoriedad
        const aceptacion = Math.random() * 100 < probabilidadAceptacion;

        if (aceptacion) {
            // Guardar contrato anterior en historial
            this.contrato.historialRenovaciones.push({
                anoRenovacion: anoActual,
                sueldoAnterior: sueldoActual,
                anoVencimientoAnterior: this.contrato.anoVencimiento
            });

            // Actualizar contrato
            const nuevoContratoObj = {
                sueldoMensual: nuevoSueldo,
                anoVencimiento: anoActual + nuevosAnos,
                clausulaRescision: this.valor * 0.8,
                fechaFirma: anoActual,
                bonificacionesAdicionales: this.contrato.bonificacionesAdicionales,
                historialRenovaciones: this.contrato.historialRenovaciones
            };

            this.contrato = nuevoContratoObj;
            this.moral = Math.min(100, this.moral + 10); // Aumentar moral

            return {
                aceptado: true,
                razon: `¡${this.nombre} ha aceptado la renovación!`,
                nuevoContrato: nuevoContratoObj,
                detalles: {
                    sueldoAnterior: sueldoActual,
                    sueldoNuevo: nuevoSueldo,
                    mejoraSalarial: mejoraSalarial.toFixed(1),
                    anoVencimiento: anoActual + nuevosAnos
                }
            };
        } else {
            // Reducir moral si rechaza
            this.moral = Math.max(0, this.moral - 5);

            let razon = `${this.nombre} ha rechazado la renovación.`;
            
            if (mejoraSalarial < 0) {
                razon += ' Considera que la oferta es insuficiente.';
            } else if (nuevosAnos > 3) {
                razon += ' Prefiere un contrato más corto.';
            } else if (reputacionClub < 50) {
                razon += ' La reputación del club no es suficiente.';
            } else {
                razon += ' Quiere esperar a mejores ofertas.';
            }

            return {
                aceptado: false,
                razon,
                detalles: {
                    probabilidadAceptacion: probabilidadAceptacion.toFixed(0),
                    moral: this.moral
                }
            };
        }
    }

    /**
     * Obtiene información del contrato formateada
     */
    obtenerInfoContrato() {
        const anoActual = new Date().getFullYear();
        const anosRestantes = this.obtenerAnosRestantes(anoActual);
        
        return {
            sueldoMensual: this.contrato.sueldoMensual,
            sueldoAnual: this.calcularSueldoAnual(),
            anoVencimiento: this.contrato.anoVencimiento,
            anosRestantes,
            clausulaRescision: this.contrato.clausulaRescision,
            estado: this.contratoVencido(anoActual) ? 'VENCIDO' : 
                    this.contratoProntoAVencer(anoActual) ? 'PRÓXIMO A VENCER' : 'VIGENTE'
        };
    }

    /**
     * Calcula el costo total del jugador (sueldo + bonificaciones)
     */
    calcularCostoAnual() {
        return this.calcularSueldoAnual();
    }

    /**
     * Obtiene el estado del contrato como string
     */
    obtenerEstadoContrato(anoActual = new Date().getFullYear()) {
        if (this.contratoVencido(anoActual)) {
            return '⚠️ VENCIDO';
        } else if (this.contratoProntoAVencer(anoActual)) {
            return '🔴 VENCE PRONTO';
        } else {
            return '✅ VIGENTE';
        }
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Jugador;
}
