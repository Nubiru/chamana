/**
 * Database Configuration Module
 *
 * Provides centralized database connection configuration for all migration scripts.
 * Supports both Fase 1 (source) and Fase 2 (target) databases.
 */

const { Pool } = require('pg');

/**
 * Database configurations for both Phase 1 (source) and Phase 2 (target)
 */
const DB_CONFIGS = {
  fase1: {
    user: 'postgres',
    host: 'localhost',
    database: 'chamana_db_fase1',
    password: 'postgres',
    port: 5432
  },
  fase2: {
    user: 'postgres',
    host: 'localhost',
    database: 'chamana_db_fase2',
    password: 'postgres',
    port: 5432
  },
  postgres: {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // For administrative tasks (create/drop databases)
    password: 'postgres',
    port: 5432
  }
};

/**
 * Create a connection pool for the specified database
 * @param {string} dbName - Database name ('fase1', 'fase2', or 'postgres')
 * @returns {Pool} PostgreSQL connection pool
 */
function createPool(dbName = 'fase2') {
  if (!DB_CONFIGS[dbName]) {
    throw new Error(
      `Invalid database name: ${dbName}. Must be 'fase1', 'fase2', or 'postgres'.`
    );
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

// ===================================================================
// DATA NORMALIZATION UTILITIES (Phase 2+)
// ===================================================================

/**
 * Normalize text to Title Case (First Letter Uppercase, Rest Lowercase)
 * Handles NULL, empty strings, and whitespace
 *
 * Examples:
 *   - "INVIERNO" → "Invierno"
 *   - "verano" → "Verano"
 *   - "  OTOÑO  " → "Otoño"
 *   - null → null (preserves NULL for further handling)
 *
 * @param {string|null} text - Text to normalize
 * @returns {string|null} Normalized text or NULL
 */
function toTitleCase(text) {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  // Title case: First letter uppercase, rest lowercase
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Normalize text or provide a default value
 * Use this when NULL is not acceptable (e.g., NOT NULL columns)
 *
 * Examples:
 *   - ("INVIERNO", "Unknown") → "Invierno"
 *   - (null, "Sin Nombre") → "Sin Nombre"
 *   - ("", "Default") → "Default"
 *
 * @param {string|null} text - Text to normalize
 * @param {string} defaultValue - Default value if text is NULL/empty
 * @returns {string} Normalized text or default value (never NULL)
 */
function normalizeWithDefault(text, defaultValue) {
  const normalized = toTitleCase(text);
  return normalized || defaultValue;
}

/**
 * Generate a default name for prendas based on attributes
 * Used when nombre is NULL in Phase 1 data
 *
 * Examples:
 *   - { tipo: "Blusa", categoria_id: 1, id: 42 } → "Blusa-Cat1-ID42"
 *   - { tipo: null, categoria_id: 2, id: 99 } → "Prenda-Cat2-ID99"
 *
 * @param {object} prenda - Prenda object with tipo, categoria_id, id
 * @returns {string} Generated name
 */
function generatePrendaName(prenda) {
  const tipo = normalizeWithDefault(prenda.tipo, 'Prenda');
  const catId = prenda.categoria_id || 0;
  const id = prenda.id || 0;
  return `${tipo}-Cat${catId}-ID${id}`;
}

module.exports = {
  createPool,
  logError,
  logSuccess,
  executeQuery,
  DB_CONFIGS,
  // Data normalization utilities (Phase 2+)
  toTitleCase,
  normalizeWithDefault,
  generatePrendaName
};
