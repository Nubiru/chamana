// =====================================================
// Error Handler Middleware - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Middleware de Manejo de Errores
 *
 * Maneja todos los errores de la aplicación de forma centralizada.
 * Convierte errores a respuestas HTTP apropiadas.
 */

const logger = require('../config/logger');
const {
  ValidationError,
  NotFoundError,
  DatabaseError,
  AuthorizationError,
  AuthenticationError,
  ConflictError
} = require('../utils/errors');

/**
 * Middleware de manejo de errores (debe ser el último middleware)
 *
 * Este middleware captura todos los errores lanzados en la aplicación
 * y los convierte en respuestas HTTP apropiadas.
 *
 * @param {Error} err - Error capturado
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next function
 *
 * @example
 * // En app.js (debe ser el último middleware):
 * app.use(errorHandler);
 */
const errorHandler = (err, req, res, next) => {
  // Log completo del error para debugging
  logger.error('Error en request', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    details: err.details || {}
  });

  // Respuesta por defecto
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details = err.details || {};

  // Manejar tipos específicos de error
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  } else if (err instanceof AuthorizationError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof AuthenticationError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    message = err.message;
  } else if (err instanceof DatabaseError) {
    statusCode = 500;
    message = 'Error en base de datos';
    // No exponer detalles de DB en producción
    if (process.env.NODE_ENV !== 'production') {
      details = err.details;
    }
  }

  // Enviar respuesta
  const response = {
    success: false,
    error: message
  };

  // Agregar detalles si existen
  if (Object.keys(details).length > 0) {
    response.details = details;
  }

  // Agregar stack trace solo en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

// =====================================================
// FIN DE ERROR HANDLER MIDDLEWARE
// =====================================================
