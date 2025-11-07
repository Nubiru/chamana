// =====================================================
// Aplicación Web - Fase 0: Comienzo
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 15 de Octubre, 2025
// Versión: 0.1.0
// =====================================================

const express = require('express');
const path = require('node:path');

// Importar rutas modulares
const prendasRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');

// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar motor de vistas (usando archivos HTML estáticos)
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// =====================================================
// RUTAS PRINCIPALES (HTML PAGES)
// =====================================================

// Página principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Página de prendas
app.get('/prendas', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'productos.html'));
});

// Página de clientes
app.get('/clientes', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'usuarios.html'));
});

// Página de categorías
app.get('/categorias', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'categorias.html'));
});

// Redirecciones para compatibilidad
app.get('/productos', (_req, res) => {
  res.redirect('/prendas');
});

app.get('/usuarios', (_req, res) => {
  res.redirect('/clientes');
});

// =====================================================
// API ROUTES (MODULAR)
// =====================================================

// Montar rutas de API
app.use('/api/prendas', prendasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/categorias', categoriasRoutes);

// Redirecciones de compatibilidad para API
app.use('/api/productos', (req, res) => {
  res.redirect(307, `/api/prendas${req.url}`);
});

app.use('/api/usuarios', (req, res) => {
  res.redirect(307, `/api/clientes${req.url}`);
});

// Ruta de prueba de conexión
app.get('/api/test', (_req, res) => {
  res.json({
    success: true,
    message: '✅ CHAMANA E-commerce API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Manejador de errores global
app.use((err, _req, res, _next) => {
  console.error('❌ Error en la aplicación:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// =====================================================
// INICIO DEL SERVIDOR
// =====================================================

async function startServer() {
  try {
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('=====================================================');
      console.log('🚀 Servidor CHAMANA iniciado exitosamente');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('=====================================================');
      console.log('📋 Rutas disponibles:');
      console.log('   GET  / - Página principal');
      console.log('   GET  /prendas - Catálogo de prendas CHAMANA');
      console.log('   GET  /clientes - Gestión de clientes');
      console.log('   GET  /api/test - Prueba de conexión');
      console.log('   /api/prendas - API de prendas (GET, POST, PUT, DELETE)');
      console.log('   /api/clientes - API de clientes (GET, POST, PUT, DELETE)');
      console.log('   /api/categorias - API de categorías (GET, POST, PUT, DELETE)');
      console.log('=====================================================');
      console.log('✨ CHAMANA E-commerce listo para operar');
      console.log('=====================================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor CHAMANA...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor CHAMANA...');
  process.exit(0);
});

// Iniciar la aplicación
startServer().catch((error) => {
  console.error('❌ Error fatal al iniciar la aplicación:', error);
  process.exit(1);
});

// =====================================================
// FIN DE LA APLICACIÓN
// =====================================================
