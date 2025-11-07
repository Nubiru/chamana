// =====================================================
// Blue-Green Database Configuration - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Blue-Green Database Deployment
 *
 * Permite cambiar entre versiones de base de datos mediante variable de entorno.
 *
 * Uso:
 *   DB_VERSION=fase1 npm start  → chamana_db_fase1
 *   DB_VERSION=fase2 npm start  → chamana_db_fase2
 *
 * Por defecto: fase2 (siempre usar la última versión)
 */

const { Pool } = require('pg');
const logger = require('./logger');

// ==========================================
// CONFIGURACIONES DE BASE DE DATOS
// ==========================================
const DB_CONFIGS = {
  fase1: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'chamana_db_fase1',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    max: 20, // Tamaño del pool de conexiones
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 2000, // Timeout de conexión después de 2s
  },
  fase2: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'chamana_db_fase2',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

// ==========================================
// VERSIÓN ACTIVA DE BASE DE DATOS
// ==========================================
const DB_VERSION = process.env.DB_VERSION || 'fase2';

// Validar DB_VERSION
if (!DB_CONFIGS[DB_VERSION]) {
  logger.error(`DB_VERSION inválido: "${DB_VERSION}"`, {
    valid_options: Object.keys(DB_CONFIGS),
  });
  console.error(`❌ DB_VERSION inválido: "${DB_VERSION}"`);
  console.error(`   Opciones válidas: ${Object.keys(DB_CONFIGS).join(', ')}`);
  process.exit(1);
}

// ==========================================
// CREAR POOL DE CONEXIONES
// ==========================================
const pool = new Pool(DB_CONFIGS[DB_VERSION]);

// Probar conexión al inicio
pool.query('SELECT NOW() as now, version() as version', (err, res) => {
  if (err) {
    logger.error('Error de conexión a base de datos', err);
    console.error('❌ Error conectando a base de datos:', err.message);
    process.exit(1);
  }

  logger.info('Conexión a base de datos exitosa', {
    database: `chamana_db_${DB_VERSION}`,
    timestamp: res.rows[0].now,
    postgres_version: res.rows[0].version.split(',')[0],
  });

  console.log(`
╔════════════════════════════════════════
║ 📊 CHAMANA Web Application
║ Base de datos: chamana_db_${DB_VERSION}
║ Conexión: ${DB_CONFIGS[DB_VERSION].host}:${DB_CONFIGS[DB_VERSION].port}
║ Usuario: ${DB_CONFIGS[DB_VERSION].user}
║ Pool: max ${DB_CONFIGS[DB_VERSION].max} conexiones
║ Timestamp: ${res.rows[0].now}
╚════════════════════════════════════════
  `);
});

// Manejar errores de conexión
pool.on('error', (err, _client) => {
  logger.error('Error inesperado en pool de base de datos', err);
  console.error('❌ Error inesperado en pool:', err.message);
});

// Apagado graceful
process.on('SIGINT', async () => {
  logger.info('Apagado graceful iniciado');
  console.log('\n🛑 Apagando servidor...');

  await pool.end();
  logger.info('Conexiones de base de datos cerradas');
  console.log('✅ Conexiones cerradas');

  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Apagado graceful iniciado (SIGTERM)');
  console.log('\n🛑 Apagando servidor...');

  await pool.end();
  logger.info('Conexiones de base de datos cerradas');
  console.log('✅ Conexiones cerradas');

  process.exit(0);
});

// ==========================================
// EXPORTAR
// ==========================================

/**
 * Helper function for simple queries (backwards compatibility with Phase 1 routes)
 * Delegates to pool.query() method
 *
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query, // Backwards compatibility helper
  DB_VERSION, // Exportar para detección de features
  isPhase2: () => DB_VERSION === 'fase2', // Helper para detectar fase
};

// =====================================================
// FIN DE CONFIGURACIÓN DE BASE DE DATOS
// =====================================================
