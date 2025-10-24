// =====================================================
// Configuración de Base de Datos - Fase 0: Comienzo
// Proyecto: Sistema de Gestión de Productos
// Fecha: 15 de Octubre, 2025
// Versión: 0.1.0
// =====================================================

const { Pool } = require('pg');

// Configuración de la base de datos
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chamana_db_fase0',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  max: 20, // Máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000 // Tiempo de espera para conexión
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Eventos del pool
pool.on('connect', () => {
  console.log('✅ Conexión a la base de datos establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para ejecutar consultas
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(
      `📊 Query ejecutada en ${duration}ms: ${text.substring(0, 50)}...`
    );
    return res;
  } catch (error) {
    console.error('❌ Error en consulta:', error);
    throw error;
  }
};

// Función para obtener un cliente del pool
const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Error al obtener cliente del pool:', error);
    throw error;
  }
};

// Función para cerrar el pool
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error al cerrar el pool:', error);
    throw error;
  }
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Conexión a la base de datos exitosa');
    console.log(
      `🕐 Hora actual de la base de datos: ${result.rows[0].current_time}`
    );
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para obtener información de la base de datos
const getDatabaseInfo = async () => {
  try {
    const result = await query(`
            SELECT 
                current_database() as database_name,
                current_user as current_user,
                version() as postgresql_version,
                inet_server_addr() as server_address,
                inet_server_port() as server_port
        `);
    return result.rows[0];
  } catch (error) {
    console.error(
      '❌ Error al obtener información de la base de datos:',
      error
    );
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  closePool,
  testConnection,
  getDatabaseInfo
};
