/**
 * Database Configuration Module - Phase 3
 *
 * Provides centralized database connection configuration for all migration scripts.
 * Supports Fase 2 (source) and Fase 3 (target) databases.
 */

const { Pool } = require('pg');

/**
 * Database configurations for Phase 2 (source) and Phase 3 (target)
 */
const DB_CONFIGS = {
  fase2: {
    user: 'postgres',
    host: 'localhost',
    database: 'chamana_db_fase2',
    password: 'postgres',
    port: 5432,
  },
  fase3: {
    user: 'postgres',
    host: 'localhost',
    database: 'chamana_db_fase3',
    password: 'postgres',
    port: 5432,
  },
  postgres: {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // For administrative tasks (create/drop databases)
    password: 'postgres',
    port: 5432,
  },
};

/**
 * Create a connection pool for the specified database
 * @param {string} dbName - Database name ('fase2', 'fase3', or 'postgres')
 * @returns {Pool} PostgreSQL connection pool
 */
function createPool(dbName = 'fase3') {
  if (!DB_CONFIGS[dbName]) {
    throw new Error(`Invalid database name: ${dbName}. Must be 'fase2', 'fase3', or 'postgres'.`);
  }

  return new Pool(DB_CONFIGS[dbName]);
}

/**
 * Standardized error logging for migration scripts
 * @param {string} scriptName - Name of the script that encountered the error
 * @param {string} phase - Phase description (e.g., 'Database Creation', 'Data Migration')
 * @param {Error} error - The error object
 */
function logError(scriptName, phase, error) {
  const timestamp = new Date().toISOString();
  console.error(`
╔════════════════════════════════════════════════════════════════
║ ❌ ERROR en ${scriptName}
║ Fase: ${phase}
║ Timestamp: ${timestamp}
║ Mensaje: ${error.message}
║ Stack: ${error.stack}
╚════════════════════════════════════════════════════════════════
  `);
}

/**
 * Standardized success logging for migration scripts
 * @param {string} scriptName - Name of the script
 * @param {string} message - Success message
 * @param {object} stats - Optional statistics object
 */
function logSuccess(scriptName, message, stats = {}) {
  console.log(`\n✅ ${scriptName}: ${message}`);
  if (Object.keys(stats).length > 0) {
    console.log('📊 Estadísticas:');
    for (const [key, value] of Object.entries(stats)) {
      console.log(`   - ${key}: ${value}`);
    }
  }
}

/**
 * Execute a query with error handling and logging
 * @param {object} client - PostgreSQL client
 * @param {string} query - SQL query to execute
 * @param {array} params - Query parameters (optional)
 * @returns {Promise<object>} Query result
 */
async function executeQuery(client, query, params = []) {
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error(`Query failed: ${query.substring(0, 100)}...`);
    throw error;
  }
}

module.exports = {
  createPool,
  logError,
  logSuccess,
  executeQuery,
  DB_CONFIGS,
};
