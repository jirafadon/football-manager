// ============ RENDERIZAR CANCHA CON EFECTOS MEJORADOS ============
function renderizarCancha() {
    const canvas = document.getElementById('cancha');
    const ctx = canvas.getContext('2d');
    
    // CÉSPED REALISTA: Franjas intercaladas de dos tonos de verde
    const stripeHeight = 30;
    for (let y = 0; y < canvas.height; y += stripeHeight) {
        ctx.fillStyle = (y / stripeHeight) % 2 === 0 ? '#2e7d32' : '#276b2b';
        ctx.fillRect(0, y, canvas.width, stripeHeight);
    }
    
    // LÍNEAS DEL CAMPO
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Línea central vertical
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Líneas de banda (horizontales)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Punto central
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Áreas de penalti (izquierda)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, canvas.height / 2 - 60, 120, 120);
    
    // Área de meta (izquierda)
    ctx.strokeRect(0, canvas.height / 2 - 40, 50, 80);
    
    // Áreas de penalti (derecha)
    ctx.strokeRect(canvas.width - 120, canvas.height / 2 - 60, 120, 120);
    
    // Área de meta (derecha)
    ctx.strokeRect(canvas.width - 50, canvas.height / 2 - 40, 50, 80);
    
    // PELOTA CON TRAIL
    if (!estadoPartido.pelotaTrail) {
        estadoPartido.pelotaTrail = [];
    }
    
    // Posición simulada de pelota (se puede animar después)
    const pelotaX = canvas.width / 2 + (Math.sin(estadoPartido.tick * 0.01) * 50);
    const pelotaY = canvas.height / 2 + (Math.cos(estadoPartido.tick * 0.01) * 30);
    
    // Agregar a trail
    estadoPartido.pelotaTrail.push({ x: pelotaX, y: pelotaY });
    if (estadoPartido.pelotaTrail.length > 3) {
        estadoPartido.pelotaTrail.shift();
    }
    
    // Dibujar trail con opacidad descendente
    estadoPartido.pelotaTrail.forEach((pos, idx) => {
        const opacity = 0.5 * (idx / estadoPartido.pelotaTrail.length);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Pelota principal (blanca)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pelotaX, pelotaY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Sombra de pelota
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(pelotaX, pelotaY + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // MARCADOR DIGITAL
    const marcadorX = canvas.width / 2 - 50;
    const marcadorY = 10;
    const marcadorWidth = 100;
    const marcadorHeight = 40;
    
    // Fondo semitransparente oscuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(marcadorX, marcadorY, marcadorWidth, marcadorHeight);
    
    // Borde blanco
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(marcadorX, marcadorY, marcadorWidth, marcadorHeight);
    
    // Texto: Minuto
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${estadoPartido.minuto || 0}'`, marcadorX + marcadorWidth / 2, marcadorY + 15);
    
    // Texto: Marcador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${estadoPartido.golesLocal || 0} - ${estadoPartido.golesVisitante || 0}`, marcadorX + marcadorWidth / 2, marcadorY + 35);
    
    // Incrementar tick para animación
    estadoPartido.tick = (estadoPartido.tick || 0) + 1;
}
