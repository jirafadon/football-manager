#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crear carpeta public si no existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copiar index.html a public/index.html
const indexPath = path.join(__dirname, 'index.html');
const publicIndexPath = path.join(publicDir, 'index.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, publicIndexPath);
  console.log('✅ index.html copiado a public/index.html');
} else {
  console.error('❌ index.html no encontrado');
  process.exit(1);
}
