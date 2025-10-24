// =====================================================
// Transaction Service - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Servicio de Transacciones
 *
 * Utilidades específicas para manejo de transacciones complejas.
 * Extiende BaseService con métodos para operaciones paralelas y secuenciales.
 */

const BaseService = require('./base.service');
const logger = require('../config/logger');

class TransactionService extends BaseService {
  /**
   * Ejecutar múltiples operaciones en paralelo dentro de transacción
   *
   * Todas las operaciones se ejecutan concurrentemente dentro de la misma transacción.
   * Útil cuando las operaciones no dependen entre sí.
   *
   * @param {Array<Function>} operations - Array de funciones async que reciben client
   * @returns {Promise<Array>} Resultados de todas las operaciones en el mismo orden
   * @throws {DatabaseError} Si alguna operación falla (rollback automático)
   *
   * @example
   * const [result1, result2] = await transactionService.executeParallel([
   *   (client) => client.query('UPDATE prendas SET stock = stock - 1 WHERE id = 1'),
   *   (client) => client.query('UPDATE prendas SET stock = stock - 1 WHERE id = 2')
   * ]);
   */
  async executeParallel(operations) {
    logger.info('Ejecutando operaciones en paralelo', {
      operationsCount: operations.length
    });

    return this.executeInTransaction(async (client) => {
      const results = await Promise.all(operations.map((op) => op(client)));

      logger.info('Operaciones paralelas completadas', {
        resultsCount: results.length
      });

      return results;
    });
  }

  /**
   * Ejecutar operaciones en secuencia dentro de transacción
   *
   * Las operaciones se ejecutan una después de otra, en orden.
   * Útil cuando operaciones posteriores dependen de resultados anteriores.
   *
   * @param {Array<Function>} operations - Array de funciones async que reciben client
   * @returns {Promise<Array>} Resultados en orden de ejecución
   * @throws {DatabaseError} Si alguna operación falla (rollback automático)
   *
   * @example
   * const [order, items] = await transactionService.executeSequential([
   *   (client) => client.query('INSERT INTO pedidos ... RETURNING id'),
   *   (client) => client.query('INSERT INTO pedidos_prendas ...')
   * ]);
   */
  async executeSequential(operations) {
    logger.info('Ejecutando operaciones en secuencia', {
      operationsCount: operations.length
    });

    return this.executeInTransaction(async (client) => {
      const results = [];

      for (let i = 0; i < operations.length; i++) {
        logger.debug(`Ejecutando operación ${i + 1}/${operations.length}`);
        const result = await operations[i](client);
        results.push(result);
      }

      logger.info('Operaciones secuenciales completadas', {
        resultsCount: results.length
      });

      return results;
    });
  }

  /**
   * Ejecutar operación con retry automático
   *
   * Si la operación falla, se reintenta hasta N veces con delay exponencial.
   * Útil para operaciones que pueden fallar temporalmente (locks, conflictos).
   *
   * @param {Function} operation - Función async a ejecutar
   * @param {number} [maxRetries=3] - Número máximo de reintentos
   * @param {number} [delayMs=100] - Delay inicial en ms (se duplica en cada reintento)
   * @returns {Promise<any>} Resultado de la operación
   * @throws {DatabaseError} Si todos los reintentos fallan
   *
   * @example
   * const result = await transactionService.executeWithRetry(
   *   () => this.executeQuery('SELECT * FROM prendas WHERE id = $1', [id]),
   *   3,  // 3 reintentos
   *   100 // 100ms initial delay
   * );
   */
  async executeWithRetry(operation, maxRetries = 3, delayMs = 100) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Intento ${attempt}/${maxRetries}`);
        const result = await operation();

        if (attempt > 1) {
          logger.info('Operación exitosa después de retry', {
            attempt,
            maxRetries
          });
        }

        return result;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          const delay = delayMs * Math.pow(2, attempt - 1);
          logger.warn('Operación falló, reintentando', {
            attempt,
            maxRetries,
            delayMs: delay,
            error: error.message
          });

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    logger.error('Operación falló después de todos los reintentos', {
      maxRetries,
      error: lastError.message
    });

    throw lastError;
  }
}

// Exportar singleton para reutilizar en toda la aplicación
module.exports = new TransactionService();

// =====================================================
// FIN DE TRANSACTION SERVICE
// =====================================================
