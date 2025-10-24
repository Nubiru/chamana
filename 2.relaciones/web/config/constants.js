// =====================================================
// Application Constants - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Constantes de la Aplicación
 *
 * Centraliza todos los valores constantes usados en la aplicación.
 * Facilita mantenimiento y evita magic numbers/strings.
 */

// ==========================================
// ESTADOS DE PEDIDOS
// ==========================================
const ORDER_STATUS = {
  PENDING: 'pendiente',
  COMPLETED: 'completado',
  CANCELLED: 'cancelado'
};

// ==========================================
// TIPOS DE MOVIMIENTO DE INVENTARIO
// ==========================================
const INVENTORY_MOVEMENT_TYPES = {
  SALE: 'venta',
  ADJUSTMENT: 'ajuste',
  RECEPTION: 'recepción'
};

// ==========================================
// TEMPORADAS
// ==========================================
const SEASONS = {
  SUMMER: 'Verano',
  WINTER: 'Invierno'
};

// ==========================================
// LÍMITES DE PAGINACIÓN
// ==========================================
const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0
};

// ==========================================
// STOCK THRESHOLDS
// ==========================================
const STOCK_THRESHOLDS = {
  OUT_OF_STOCK: 0,
  LOW_STOCK: 10,
  NORMAL_STOCK: 11
};

// ==========================================
// MENSAJES DE ERROR COMUNES
// ==========================================
const ERROR_MESSAGES = {
  // Database
  DATABASE_ERROR: 'Error en base de datos',
  CONNECTION_ERROR: 'Error de conexión',

  // Validation
  REQUIRED_FIELD: 'es requerido',
  INVALID_TYPE: 'tiene un tipo inválido',
  INVALID_VALUE: 'tiene un valor inválido',

  // Not Found
  NOT_FOUND: 'no encontrado',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',

  // Authorization
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso prohibido',

  // Business Logic
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  INVALID_STATE: 'Estado inválido',
  CANNOT_CANCEL: 'No se puede cancelar'
};

// ==========================================
// MENSAJES DE ÉXITO COMUNES
// ==========================================
const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente',
  UPDATED: 'Actualizado exitosamente',
  DELETED: 'Eliminado exitosamente',
  COMPLETED: 'Completado exitosamente'
};

// ==========================================
// CÓDIGOS HTTP
// ==========================================
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// ==========================================
// EXPORTAR CONSTANTES
// ==========================================
module.exports = {
  ORDER_STATUS,
  INVENTORY_MOVEMENT_TYPES,
  SEASONS,
  PAGINATION,
  STOCK_THRESHOLDS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS
};

// =====================================================
// FIN DE CONSTANTES
// =====================================================
