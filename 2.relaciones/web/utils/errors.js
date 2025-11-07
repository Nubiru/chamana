// =====================================================
// Custom Error Classes - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Clases de Error Personalizadas
 *
 * Proporciona tipos de error específicos para diferentes situaciones.
 * Facilita el manejo de errores y respuestas HTTP apropiadas.
 */

/**
 * Error de Validación (400 Bad Request)
 *
 * Se lanza cuando los datos de entrada no cumplen con las reglas de validación.
 *
 * @example
 * throw new ValidationError('El campo email es requerido');
 * throw new ValidationError('Stock insuficiente', { disponible: 5, solicitado: 10 });
 */
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

/**
 * Error de No Encontrado (404 Not Found)
 *
 * Se lanza cuando un recurso solicitado no existe.
 *
 * @example
 * throw new NotFoundError('Producto con id 123 no encontrado');
 */
class NotFoundError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.details = details;
  }
}

/**
 * Error de Base de Datos (500 Internal Server Error)
 *
 * Se lanza cuando ocurre un error en operaciones de base de datos.
 *
 * @example
 * throw new DatabaseError('Error al ejecutar query', { originalError: error });
 */
class DatabaseError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.details = details;
  }
}

/**
 * Error de Autorización (403 Forbidden)
 *
 * Se lanza cuando un usuario no tiene permisos para realizar una acción.
 *
 * @example
 * throw new AuthorizationError('No tienes permisos para eliminar este recurso');
 */
class AuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.details = details;
  }
}

/**
 * Error de Autenticación (401 Unauthorized)
 *
 * Se lanza cuando falta autenticación o las credenciales son inválidas.
 *
 * @example
 * throw new AuthenticationError('Token inválido o expirado');
 */
class AuthenticationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.details = details;
  }
}

/**
 * Error de Conflicto (409 Conflict)
 *
 * Se lanza cuando hay un conflicto con el estado actual del recurso.
 *
 * @example
 * throw new ConflictError('Ya existe un cliente con ese email');
 */
class ConflictError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.details = details;
  }
}

// ==========================================
// EXPORTAR CLASES DE ERROR
// ==========================================
module.exports = {
  ValidationError,
  NotFoundError,
  DatabaseError,
  AuthorizationError,
  AuthenticationError,
  ConflictError,
};

// =====================================================
// FIN DE CLASES DE ERROR
// =====================================================
