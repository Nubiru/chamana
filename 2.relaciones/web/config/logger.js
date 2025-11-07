// =====================================================
// Logger Configuration - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Logger Estructurado
 *
 * Proporciona logging estructurado con niveles (info, warn, error).
 * Formato JSON para fácil parsing en producción.
 */

// Niveles de log disponibles
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

/**
 * Formatear timestamp en ISO 8601
 * @returns {string} Timestamp en formato ISO
 */
const timestamp = () => new Date().toISOString();

/**
 * Obtener nivel de log desde environment
 * @returns {string} Nivel de log activo
 */
const getLogLevel = () => {
  return process.env.LOG_LEVEL || 'INFO';
};

/**
 * Verificar si un nivel debe ser loggeado
 * @param {string} level - Nivel del mensaje
 * @returns {boolean} True si debe loggearse
 */
const shouldLog = (level) => {
  const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  const currentLevel = getLogLevel();
  return levels.indexOf(level) <= levels.indexOf(currentLevel);
};

/**
 * Logger principal
 */
const logger = {
  /**
   * Log de información general
   * @param {string} message - Mensaje a loggear
   * @param {Object} data - Datos adicionales
   */
  info: (message, data = {}) => {
    if (!shouldLog('INFO')) return;

    console.log(
      JSON.stringify({
        level: LOG_LEVELS.INFO,
        timestamp: timestamp(),
        message,
        ...data,
      })
    );
  },

  /**
   * Log de advertencias
   * @param {string} message - Mensaje a loggear
   * @param {Object} data - Datos adicionales
   */
  warn: (message, data = {}) => {
    if (!shouldLog('WARN')) return;

    console.warn(
      JSON.stringify({
        level: LOG_LEVELS.WARN,
        timestamp: timestamp(),
        message,
        ...data,
      })
    );
  },

  /**
   * Log de errores
   * @param {string} message - Mensaje a loggear
   * @param {Error|Object} error - Error o datos adicionales
   */
  error: (message, error = {}) => {
    if (!shouldLog('ERROR')) return;

    console.error(
      JSON.stringify({
        level: LOG_LEVELS.ERROR,
        timestamp: timestamp(),
        message,
        error: {
          message: error.message || String(error),
          stack: error.stack,
          ...error,
        },
      })
    );
  },

  /**
   * Log de debug (solo en desarrollo)
   * @param {string} message - Mensaje a loggear
   * @param {Object} data - Datos adicionales
   */
  debug: (message, data = {}) => {
    if (!shouldLog('DEBUG')) return;

    console.log(
      JSON.stringify({
        level: LOG_LEVELS.DEBUG,
        timestamp: timestamp(),
        message,
        ...data,
      })
    );
  },
};

module.exports = logger;

// =====================================================
// FIN DE CONFIGURACIÓN DE LOGGER
// =====================================================
