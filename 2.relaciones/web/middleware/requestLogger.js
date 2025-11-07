// =====================================================
// Request Logger Middleware - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Middleware de Logging de Requests
 *
 * Registra todas las peticiones HTTP con timing.
 * Útil para debugging y monitoreo de performance.
 */

const logger = require('../config/logger');

/**
 * Middleware para loggear todas las requests HTTP
 *
 * Registra:
 * - Método HTTP
 * - URL
 * - Status code de respuesta
 * - Duración de la request
 * - User agent
 *
 * También detecta requests lentas (>1000ms) y las marca como warnings.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next function
 *
 * @example
 * // En app.js:
 * app.use(requestLogger);
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
    });

    // Advertir sobre requests lentas (>1000ms)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        threshold: '1000ms',
      });
    }
  });

  next();
};

module.exports = requestLogger;

// =====================================================
// FIN DE REQUEST LOGGER MIDDLEWARE
// =====================================================
