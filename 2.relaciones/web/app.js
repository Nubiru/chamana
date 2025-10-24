// =====================================================
// Aplicación Web - Fase 2: Segunda Forma Normal (2NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * CHAMANA E-commerce - Production-Grade Architecture
 *
 * Arquitectura en capas:
 * - Presentation Layer: Routes (HTTP concerns)
 * - Business Logic Layer: Services (business rules)
 * - Data Access Layer: Database (SQL)
 *
 * Características:
 * - Blue-Green deployment (database versioning)
 * - Service layer pattern (business logic isolated)
 * - Transaction management (ACID compliance)
 * - Error handling (custom error classes)
 * - Structured logging (JSON format)
 * - Input validation (reusable validators)
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

// Importar configuración
const { DB_VERSION } = require('./config/database');
const logger = require('./config/logger');

// Importar middleware
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas modulares
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');
const telasRoutes = require('./routes/telas');

// =====================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// =====================================================
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE DE SEGURIDAD
// =====================================================
// Helmet: Security headers
app.use(
  helmet({
    contentSecurityPolicy: false // Deshabilitado para desarrollo (activar en producción)
  })
);

// CORS: Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// =====================================================
// MIDDLEWARE DE PARSEO
// =====================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// MIDDLEWARE DE LOGGING
// =====================================================
app.use(requestLogger);

// =====================================================
// ARCHIVOS ESTÁTICOS
// =====================================================
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// RUTAS PRINCIPALES (HTML PAGES)
// =====================================================
// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Página de productos
app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'productos.html'));
});

// Página de categorías
app.get('/categorias', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'categorias.html'));
});

// Página de usuarios/clientes
app.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'usuarios.html'));
});

// Alias: /clientes también sirve usuarios.html
app.get('/clientes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'usuarios.html'));
});

// Página de pedidos
app.get('/pedidos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'pedidos.html'));
});

// =====================================================
// API ROUTES (MODULAR)
// =====================================================
// API de categorías
app.use('/api/categorias', categoriasRoutes);

// API de productos
app.use('/api/productos', productosRoutes);

// API de usuarios/clientes
app.use('/api/usuarios', usuariosRoutes);

// API de pedidos
app.use('/api/pedidos', pedidosRoutes);

// API de telas (seasonal filtering)
app.use('/api/telas', telasRoutes);

// Ruta de información del sistema
app.get('/api/system/info', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    database: {
      version: DB_VERSION,
      name: `chamana_db_${DB_VERSION}`
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba de conexión
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ CHAMANA E-commerce API funcionando correctamente',
    version: '2.0.0',
    database: `chamana_db_${DB_VERSION}`,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
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
    path: req.path
  });
});

// Manejador de errores global (debe ser el último middleware)
app.use(errorHandler);

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
      console.log(`📊 Base de datos: chamana_db_${DB_VERSION}`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('=====================================================');
      console.log('📋 Rutas disponibles:');
      console.log('   GET  / - Página principal');
      console.log('   GET  /productos - Catálogo de productos');
      console.log('   GET  /categorias - Gestión de categorías');
      console.log('   GET  /usuarios - Gestión de usuarios/clientes');
      console.log('   GET  /api/test - Prueba de conexión');
      console.log('   GET  /api/system/info - Información del sistema');
      console.log('   GET  /health - Health check');
      console.log('   /api/categorias - API de categorías (CRUD)');
      console.log('   /api/productos - API de productos (CRUD)');
      console.log('   /api/usuarios - API de usuarios (CRUD)');
      console.log('=====================================================');
      console.log('✨ CHAMANA E-commerce listo para operar');
      console.log('=====================================================');

      logger.info('Servidor iniciado', {
        port: PORT,
        database: `chamana_db_${DB_VERSION}`,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor', error);
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida, cerrando servidor...');
  console.log('\n🛑 Cerrando servidor CHAMANA...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida, cerrando servidor...');
  console.log('\n🛑 Cerrando servidor CHAMANA...');
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Iniciar la aplicación
startServer().catch((error) => {
  logger.error('Error fatal al iniciar la aplicación', error);
  console.error('❌ Error fatal al iniciar la aplicación:', error);
  process.exit(1);
});

// =====================================================
// FIN DE LA APLICACIÓN
// =====================================================
