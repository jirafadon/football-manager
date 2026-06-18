/**
 * GENERADOR DE PLACEHOLDERS
 * Crea imágenes PNG de escudos y caras de jugadores por defecto
 * Ejecutar en Node.js o navegador con canvas
 */

// Escudo genérico
function crearEscudoGenerico() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    // Fondo gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0066cc');
    grad.addColorStop(1, '#0052a3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borde
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
}

// Cara de jugador genérica
function crearCaraGenerico() {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    // Fondo
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#e0e0e0');
    grad.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cabeza (círculo)
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Ojos
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 12, 45, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 12, 45, 4, 0, Math.PI * 2);
    ctx.fill();

    // Boca
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 55, 8, 0, Math.PI);
    ctx.stroke();

    // Cuerpo (rectángulo)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(canvas.width / 2 - 25, 85, 50, 50);

    // Borde
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        crearEscudoGenerico,
        crearCaraGenerico
    };
}

// Uso en navegador:
// const escudoDataUrl = crearEscudoGenerico();
// const caraDataUrl = crearCaraGenerico();
