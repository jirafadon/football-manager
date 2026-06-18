/**
 * CARGADOR DE BASE DE DATOS
 * Fetch y mapeo de JSON a instancias de Equipo y Jugador
 */

/**
 * Carga la base de datos desde JSON y crea instancias de Equipo y Jugador
 * @returns {Promise<Array>} Array de equipos cargados
 */
async function inicializarBaseDeDatos() {
    try {
        console.log('📦 Cargando base de datos...');
        
        // Fetch del JSON
        const response = await fetch('./data/db.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.equipos || !Array.isArray(data.equipos)) {
            throw new Error('Estructura de JSON inválida: falta array "equipos"');
        }
        
        // Mapear equipos y jugadores
        const equiposCargados = data.equipos.map(equipoData => {
            console.log(`  ⚽ Cargando equipo: ${equipoData.nombre}`);
            
            // Crear instancia de Equipo
            const equipo = new Equipo({
                id: equipoData.id,
                nombre: equipoData.nombre,
                escudoUrl: equipoData.escudoUrl,
                presupuesto: equipoData.presupuesto,
                estadio: equipoData.estadio,
                ciudad: equipoData.ciudad,
                pais: equipoData.pais,
                reputacion: equipoData.reputacion || 70,
                fundacion: equipoData.fundacion
            });
            
            // Mapear jugadores
            if (equipoData.plantilla && Array.isArray(equipoData.plantilla)) {
                const jugadores = equipoData.plantilla.map(jugadorData => {
                    // Crear instancia de Jugador con todos los datos
                    const jugador = new Jugador({
                        id: jugadorData.id,
                        nombre: jugadorData.nombre,
                        fotoUrl: jugadorData.fotoUrl,
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
                        // Valor
                        valor: calcularValorJugador(jugadorData)
                    });
                    
                    return jugador;
                });
                
                // Asignar plantilla al equipo
                equipo.plantel = jugadores;
                
                // Asignar titulares (primeros 11)
                equipo.alineacionTitular = jugadores.slice(0, 11);
                
                console.log(`    ✓ ${jugadores.length} jugadores cargados`);
            }
            
            return equipo;
        });
        
        console.log(`✅ Base de datos cargada: ${equiposCargados.length} equipos`);
        
        return equiposCargados;
        
    } catch (error) {
        console.error('❌ Error cargando base de datos:', error);
        throw error;
    }
}

/**
 * Calcula el valor de un jugador basado en sus atributos y edad
 * @param {Object} jugadorData - Datos del jugador
 * @returns {number} Valor en euros
 */
function calcularValorJugador(jugadorData) {
    const atributos = jugadorData.atributos || {};
    const edad = jugadorData.edad || 25;
    
    // Promedio de atributos (excluyendo portero)
    const promedio = (
        (atributos.velocidad || 70) +
        (atributos.remate || 70) +
        (atributos.pase || 70) +
        (atributos.defensa || 70) +
        (atributos.fisico || 70)
    ) / 5;
    
    // Valor base: 100k por punto de promedio
    let valor = promedio * 100000;
    
    // Ajuste por edad
    if (edad < 23) {
        valor *= 1.3; // Jóvenes talentos: +30%
    } else if (edad > 32) {
        valor *= 0.7; // Veteranos: -30%
    } else if (edad >= 28 && edad <= 31) {
        valor *= 1.1; // Jugadores en su prime: +10%
    }
    
    return Math.round(valor);
}

/**
 * Carga la base de datos y crea la liga
 * Función wrapper para integración fácil
 */
async function cargarLigaDesdeDB() {
    try {
        const equipos = await inicializarBaseDeDatos();
        
        // Crear liga con equipos cargados
        liga = new Liga(equipos);
        
        // Asignar equipo del usuario (primer equipo por defecto)
        if (equipos.length > 0) {
            equipoUsuario = equipos[0];
            console.log(`👤 Equipo del usuario: ${equipoUsuario.nombre}`);
        }
        
        return liga;
        
    } catch (error) {
        console.error('❌ Error creando liga:', error);
        throw error;
    }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inicializarBaseDeDatos,
        calcularValorJugador,
        cargarLigaDesdeDB
    };
}
