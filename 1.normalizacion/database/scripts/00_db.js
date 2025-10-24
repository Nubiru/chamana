// =====================================================
// Configuración de Conexión a PostgreSQL
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fase: 1.normalizacion (1NF)
// =====================================================

const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL Fase 1
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chamana_db_fase1',
  password: 'postgres',
  port: 5432
});

// Pool para Fase 0 (migración de datos)
const fase0Pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chamana_db_fase0',
  password: 'postgres',
  port: 5432
});

// Pool para operaciones en la base de datos por defecto 'postgres'
const defaultPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432
});

// Exportar todos los pools
module.exports = {
  pool, // Para operaciones en chamana_db_fase1
  fase0Pool, // Para leer datos de chamana_db_fase0
  defaultPool // Para crear la base de datos
};
