// =====================================================
// Validation Utilities - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Utilidades de Validación
 *
 * Funciones helper para validar inputs de forma consistente.
 * Todas las funciones lanzan ValidationError si la validación falla.
 */

const { ValidationError } = require('./errors');

/**
 * Validar que un campo es requerido (no null, undefined, o string vacío)
 *
 * @param {*} value - Valor a validar
 * @param {string} fieldName - Nombre del campo (para mensaje de error)
 * @returns {*} El valor si es válido
 * @throws {ValidationError} Si el valor es null, undefined o string vacío
 *
 * @example
 * required(req.body.email, 'email'); // OK si email existe
 * required(null, 'nombre');          // Lanza ValidationError
 */
const required = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} es requerido`);
  }
  return value;
};

/**
 * Validar tipo de dato
 *
 * @param {*} value - Valor a validar
 * @param {string} type - Tipo esperado ('string', 'number', 'boolean', 'object')
 * @param {string} fieldName - Nombre del campo
 * @returns {*} El valor si es válido
 * @throws {ValidationError} Si el tipo no coincide
 *
 * @example
 * isType(42, 'number', 'edad');           // OK
 * isType('texto', 'number', 'edad');      // Lanza ValidationError
 */
const isType = (value, type, fieldName) => {
  if (typeof value !== type) {
    throw new ValidationError(
      `${fieldName} debe ser de tipo ${type}, recibido: ${typeof value}`
    );
  }
  return value;
};

/**
 * Validar número positivo
 *
 * @param {number} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {number} El valor si es válido
 * @throws {ValidationError} Si no es un número positivo
 *
 * @example
 * isPositive(10, 'cantidad');     // OK
 * isPositive(0, 'cantidad');      // Lanza ValidationError
 * isPositive(-5, 'cantidad');     // Lanza ValidationError
 */
const isPositive = (value, fieldName) => {
  if (typeof value !== 'number' || value <= 0) {
    throw new ValidationError(
      `${fieldName} debe ser un número positivo, recibido: ${value}`
    );
  }
  return value;
};

/**
 * Validar número no negativo (permite cero)
 *
 * @param {number} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {number} El valor si es válido
 * @throws {ValidationError} Si es negativo
 *
 * @example
 * isNonNegative(0, 'descuento');   // OK
 * isNonNegative(10, 'descuento');  // OK
 * isNonNegative(-5, 'descuento');  // Lanza ValidationError
 */
const isNonNegative = (value, fieldName) => {
  if (typeof value !== 'number' || value < 0) {
    throw new ValidationError(
      `${fieldName} no puede ser negativo, recibido: ${value}`
    );
  }
  return value;
};

/**
 * Validar array no vacío
 *
 * @param {Array} value - Array a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {Array} El array si es válido
 * @throws {ValidationError} Si no es array o está vacío
 *
 * @example
 * isNonEmptyArray([1,2,3], 'items');  // OK
 * isNonEmptyArray([], 'items');       // Lanza ValidationError
 * isNonEmptyArray('texto', 'items');  // Lanza ValidationError
 */
const isNonEmptyArray = (value, fieldName) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError(`${fieldName} debe ser un array no vacío`);
  }
  return value;
};

/**
 * Validar email
 *
 * @param {string} value - Email a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string} El email si es válido
 * @throws {ValidationError} Si el formato es inválido
 *
 * @example
 * isEmail('usuario@example.com', 'email');  // OK
 * isEmail('invalido', 'email');             // Lanza ValidationError
 */
const isEmail = (value, fieldName) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(
      `${fieldName} debe ser un email válido, recibido: ${value}`
    );
  }
  return value;
};

/**
 * Validar longitud de string
 *
 * @param {string} value - String a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {string} El string si es válido
 * @throws {ValidationError} Si la longitud está fuera del rango
 *
 * @example
 * hasLength('Hola', 2, 10, 'nombre');     // OK
 * hasLength('A', 2, 10, 'nombre');        // Lanza ValidationError (muy corto)
 * hasLength('Muy largo...', 2, 5, 'cod'); // Lanza ValidationError (muy largo)
 */
const hasLength = (value, min, max, fieldName) => {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} debe ser un string`);
  }
  if (value.length < min || value.length > max) {
    throw new ValidationError(
      `${fieldName} debe tener entre ${min} y ${max} caracteres, recibido: ${value.length}`
    );
  }
  return value;
};

/**
 * Validar que el valor está en una lista de opciones válidas
 *
 * @param {*} value - Valor a validar
 * @param {Array} validOptions - Opciones válidas
 * @param {string} fieldName - Nombre del campo
 * @returns {*} El valor si es válido
 * @throws {ValidationError} Si el valor no está en las opciones
 *
 * @example
 * isOneOf('pendiente', ['pendiente', 'completado'], 'estado');  // OK
 * isOneOf('invalido', ['pendiente', 'completado'], 'estado');   // Lanza ValidationError
 */
const isOneOf = (value, validOptions, fieldName) => {
  if (!validOptions.includes(value)) {
    throw new ValidationError(
      `${fieldName} debe ser uno de: ${validOptions.join(
        ', '
      )}. Recibido: ${value}`
    );
  }
  return value;
};

/**
 * Validar número entero
 *
 * @param {number} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {number} El valor si es válido
 * @throws {ValidationError} Si no es un entero
 *
 * @example
 * isInteger(42, 'id');      // OK
 * isInteger(42.5, 'id');    // Lanza ValidationError
 * isInteger('42', 'id');    // Lanza ValidationError
 */
const isInteger = (value, fieldName) => {
  if (!Number.isInteger(value)) {
    throw new ValidationError(
      `${fieldName} debe ser un número entero, recibido: ${value}`
    );
  }
  return value;
};

// ==========================================
// EXPORTAR VALIDADORES
// ==========================================
module.exports = {
  required,
  isType,
  isPositive,
  isNonNegative,
  isNonEmptyArray,
  isEmail,
  hasLength,
  isOneOf,
  isInteger
};

// =====================================================
// FIN DE UTILIDADES DE VALIDACIÓN
// =====================================================
