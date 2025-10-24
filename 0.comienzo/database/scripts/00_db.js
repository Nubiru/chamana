// =====================================================
// Configuración de Conexión a PostgreSQL
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fase: 0.comienzo
// =====================================================

const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
// NOTA: Modifica estos valores según tu configuración local
const pool = new Pool({
  user: 'postgres', // Usuario de PostgreSQL
  host: 'localhost', // Host (localhost para desarrollo local)
  database: 'chamana_db_fase0', // Base de datos CHAMANA
  password: 'postgres', // Contraseña (CAMBIAR según tu instalación)
  port: 5432 // Puerto por defecto de PostgreSQL
});

// Pool para operaciones en la base de datos por defecto 'postgres'
// Usado solo para crear la base de datos inicial
const defaultPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Base de datos por defecto de PostgreSQL
  password: 'postgres',
  port: 5432
});

// Exportar ambos pools
module.exports = {
  pool, // Para operaciones en chamana_db_fase0
  defaultPool // Para crear la base de datos
};
