// =====================================================
// Base Service - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Servicio Base
 *
 * Proporciona utilidades comunes para todos los servicios de dominio.
 * Manejo de transacciones, errores y logging.
 *
 * Todos los servicios de dominio deben heredar de esta clase.
 */

const { pool } = require('../config/database');
const logger = require('../config/logger');
const { DatabaseError, NotFoundError } = require('../utils/errors');

class BaseService {
  /**
   * Ejecutar operación dentro de transacción
   *
   * Esta función maneja automáticamente BEGIN, COMMIT y ROLLBACK.
   * Garantiza atomicidad de operaciones (todo o nada).
   *
   * @param {Function} operation - Función async que recibe client
   * @returns {Promise<any>} Resultado de la operación
   * @throws {DatabaseError} Si ocurre un error en la transacción
   *
   * @example
   * const result = await this.executeInTransaction(async (client) => {
   *   const order = await client.query('INSERT INTO pedidos ...');
   *   const items = await client.query('INSERT INTO pedidos_prendas ...');
   *   return { order, items };
   * });
   */
  async executeInTransaction(operation) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      logger.info('Transacción iniciada');

      const result = await operation(client);

      await client.query('COMMIT');
      logger.info('Transacción completada exitosamente');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transacción revertida', {
        error: error.message,
        stack: error.stack
      });

      throw new DatabaseError(`Error en transacción: ${error.message}`, {
        originalError: error
      });
    } finally {
      client.release();
      logger.debug('Cliente de base de datos liberado');
    }
  }

  /**
   * Ejecutar query simple (sin transacción)
   *
   * Para queries de solo lectura o operaciones atómicas simples.
   *
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   * @throws {DatabaseError} Si ocurre un error
   *
   * @example
   * const result = await this.executeQuery(
   *   'SELECT * FROM prendas WHERE id = $1',
   *   [prendaId]
   * );
   */
  async executeQuery(query, params = []) {
    try {
      const start = Date.now();
      const result = await pool.query(query, params);
      const duration = Date.now() - start;

      logger.debug('Query ejecutada', {
        duration: `${duration}ms`,
        query: query.substring(0, 100), // Primeros 100 caracteres
        rowCount: result.rowCount
      });

      return result;
    } catch (error) {
      logger.error('Error ejecutando query', {
        error: error.message,
        query: query.substring(0, 100),
        params
      });

      throw new DatabaseError(`Error en query: ${error.message}`, {
        originalError: error,
        query: query.substring(0, 100)
      });
    }
  }

  /**
   * Validar que un registro existe
   *
   * Verifica que un registro con el ID dado existe en la tabla.
   * Útil antes de actualizar o eliminar.
   *
   * @param {string} table - Nombre de tabla
   * @param {number} id - ID del registro
   * @param {string} [idColumn='id'] - Nombre de la columna ID
   * @throws {NotFoundError} Si el registro no existe
   *
   * @example
   * await this.ensureExists('prendas', 42);  // OK si existe
   * await this.ensureExists('prendas', 999); // Lanza NotFoundError
   */
  async ensureExists(table, id, idColumn = 'id') {
    const result = await this.executeQuery(
      `SELECT ${idColumn} FROM ${table} WHERE ${idColumn} = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(
        `Registro no encontrado en ${table} con ${idColumn} = ${id}`
      );
    }
  }

  /**
   * Contar registros en una tabla con filtros opcionales
   *
   * @param {string} table - Nombre de tabla
   * @param {string} [whereClause=''] - Cláusula WHERE (sin el WHERE)
   * @param {Array} [params=[]] - Parámetros para la cláusula WHERE
   * @returns {Promise<number>} Cantidad de registros
   *
   * @example
   * const total = await this.count('prendas');
   * const activas = await this.count('prendas', 'activa = $1', [true]);
   */
  async count(table, whereClause = '', params = []) {
    const query = whereClause
      ? `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`
      : `SELECT COUNT(*) as count FROM ${table}`;

    const result = await this.executeQuery(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Verificar si un registro existe
   *
   * Similar a ensureExists pero devuelve boolean en lugar de lanzar error.
   *
   * @param {string} table - Nombre de tabla
   * @param {number} id - ID del registro
   * @param {string} [idColumn='id'] - Nombre de la columna ID
   * @returns {Promise<boolean>} True si existe, false si no
   *
   * @example
   * const existe = await this.exists('prendas', 42);
   * if (existe) { ... }
   */
  async exists(table, id, idColumn = 'id') {
    try {
      await this.ensureExists(table, id, idColumn);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      throw error;
    }
  }
}

module.exports = BaseService;

// =====================================================
// FIN DE BASE SERVICE
// =====================================================
