/**
 * Servicio de Pedidos - Orders Domain
 * Maneja toda la lógica de negocio relacionada con pedidos
 */

const BaseService = require('./base.service');
const { ValidationError, NotFoundError } = require('../utils/errors');
const {
  required,
  isPositive,
  isNonEmptyArray
} = require('../utils/validation');
const logger = require('../config/logger');

class PedidosService extends BaseService {
  /**
   * Crear nuevo pedido
   *
   * @param {Object} data - Datos del pedido
   * @param {number} data.cliente_id - ID del cliente
   * @param {Array} data.items - Items del pedido
   * @param {number} data.descuento - Descuento aplicado
   * @param {string} data.notas - Notas adicionales
   * @returns {Promise<{pedido_id: number, total: number}>}
   */
  async createOrder({ cliente_id, items, descuento = 0, notas = null }) {
    // Validar entrada
    required(cliente_id, 'cliente_id');
    isNonEmptyArray(items, 'items');

    if (descuento < 0) {
      throw new ValidationError('descuento no puede ser negativo');
    }

    // Validar que cliente existe
    await this.ensureExists('clientes', cliente_id);

    return this.executeInTransaction(async (client) => {
      // Calcular subtotal
      const subtotal = items.reduce(
        (sum, item) => sum + item.cantidad * item.precio_unitario,
        0
      );
      const total = subtotal - descuento;

      logger.info('Creando pedido', {
        cliente_id,
        items_count: items.length,
        subtotal,
        descuento,
        total
      });

      // Crear pedido
      const orderResult = await client.query(
        `INSERT INTO pedidos 
         (cliente_id, subtotal, descuento, total, estado, notas, fecha_pedido)
         VALUES ($1, $2, $3, $4, 'pendiente', $5, NOW())
         RETURNING id`,
        [cliente_id, subtotal, descuento, total, notas]
      );
      const pedido_id = orderResult.rows[0].id;

      // Insertar items y validar stock
      for (const item of items) {
        // Validar item
        required(item.prenda_id, 'prenda_id');
        isPositive(item.cantidad, 'cantidad');
        isPositive(item.precio_unitario, 'precio_unitario');

        // Verificar que prenda existe y tiene stock suficiente
        const stockCheck = await client.query(
          'SELECT stock_disponible FROM prendas WHERE id = $1 AND activa = true',
          [item.prenda_id]
        );

        if (stockCheck.rows.length === 0) {
          throw new NotFoundError(
            `Prenda ${item.prenda_id} no existe o está inactiva`
          );
        }

        const stockDisponible = stockCheck.rows[0].stock_disponible;
        if (stockDisponible < item.cantidad) {
          throw new ValidationError(
            `Stock insuficiente para prenda ${item.prenda_id}. ` +
              `Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}`
          );
        }

        // Insertar item del pedido
        const itemSubtotal = item.cantidad * item.precio_unitario;
        await client.query(
          `INSERT INTO pedidos_prendas 
           (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            pedido_id,
            item.prenda_id,
            item.cantidad,
            item.precio_unitario,
            itemSubtotal
          ]
        );

        logger.info('Item agregado al pedido', {
          pedido_id,
          prenda_id: item.prenda_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        });
      }

      logger.info('Pedido creado exitosamente', { pedido_id, total });

      return { pedido_id, total };
    });
  }

  /**
   * Completar pedido (actualiza stock)
   *
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<void>}
   */
  async completeOrder(pedidoId) {
    required(pedidoId, 'pedidoId');
    await this.ensureExists('pedidos', pedidoId);

    return this.executeInTransaction(async (client) => {
      // Verificar que el pedido está en estado pendiente
      const orderCheck = await client.query(
        'SELECT estado FROM pedidos WHERE id = $1',
        [pedidoId]
      );

      if (orderCheck.rows[0].estado !== 'pendiente') {
        throw new ValidationError(
          `Solo se pueden completar pedidos en estado pendiente. ` +
            `Estado actual: ${orderCheck.rows[0].estado}`
        );
      }

      // Obtener items del pedido
      const items = await client.query(
        'SELECT prenda_id, cantidad FROM pedidos_prendas WHERE pedido_id = $1',
        [pedidoId]
      );

      logger.info('Completando pedido', {
        pedido_id: pedidoId,
        items_count: items.rows.length
      });

      // Actualizar stock para cada item
      for (const item of items.rows) {
        // Obtener stock actual
        const stockResult = await client.query(
          'SELECT stock_disponible FROM prendas WHERE id = $1',
          [item.prenda_id]
        );

        const stockAnterior = stockResult.rows[0].stock_disponible;
        const stockNuevo = stockAnterior - item.cantidad;

        // Verificar que hay stock suficiente (por si cambió desde creación)
        if (stockAnterior < item.cantidad) {
          throw new ValidationError(
            `Stock insuficiente al completar pedido. ` +
              `Prenda ${item.prenda_id}: disponible ${stockAnterior}, necesario ${item.cantidad}`
          );
        }

        // Actualizar stock (disponible y vendido)
        await client.query(
          `UPDATE prendas 
           SET stock_disponible = stock_disponible - $1,
               stock_vendido = stock_vendido + $1,
               fecha_ultima_venta = NOW()
           WHERE id = $2`,
          [item.cantidad, item.prenda_id]
        );

        // Registrar movimiento de inventario
        await client.query(
          `INSERT INTO movimientos_inventario
           (prenda_id, tipo, cantidad, stock_anterior, stock_nuevo, pedido_id, motivo, fecha)
           VALUES ($1, 'venta', $2, $3, $4, $5, 'Venta por pedido', NOW())`,
          [item.prenda_id, item.cantidad, stockAnterior, stockNuevo, pedidoId]
        );

        logger.info('Stock actualizado', {
          prenda_id: item.prenda_id,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo
        });
      }

      // Marcar pedido como completado
      await client.query(
        `UPDATE pedidos 
         SET estado = 'completado', fecha_completado = NOW()
         WHERE id = $1`,
        [pedidoId]
      );

      logger.info('Pedido completado exitosamente', { pedido_id: pedidoId });
    });
  }

  /**
   * Cancelar pedido
   *
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<void>}
   */
  async cancelOrder(pedidoId) {
    required(pedidoId, 'pedidoId');
    await this.ensureExists('pedidos', pedidoId);

    const result = await this.executeQuery(
      `UPDATE pedidos 
       SET estado = 'cancelado', fecha_cancelado = NOW()
       WHERE id = $1 AND estado = 'pendiente'
       RETURNING id`,
      [pedidoId]
    );

    if (result.rows.length === 0) {
      throw new ValidationError(
        'Solo se pueden cancelar pedidos en estado pendiente'
      );
    }

    logger.info('Pedido cancelado', { pedido_id: pedidoId });
  }

  /**
   * Listar pedidos con filtros
   *
   * @param {Object} filters - Filtros
   * @returns {Promise<Array>}
   */
  async listOrders({ cliente_id, estado, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        p.id, 
        p.fecha_pedido, 
        p.estado, 
        p.total,
        p.descuento,
        c.nombre || ' ' || c.apellido AS cliente_nombre,
        COUNT(pp.id) AS items_count
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN pedidos_prendas pp ON p.id = pp.pedido_id
    `;

    const conditions = [];
    const params = [];

    if (cliente_id) {
      params.push(cliente_id);
      conditions.push(`p.cliente_id = $${params.length}`);
    }

    if (estado) {
      params.push(estado);
      conditions.push(`p.estado = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY p.id, c.nombre, c.apellido';
    query += ' ORDER BY p.fecha_pedido DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await this.executeQuery(query, params);
    return result.rows;
  }

  /**
   * Obtener pedido por ID con detalles
   *
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<Object>}
   */
  async getOrderById(pedidoId) {
    required(pedidoId, 'pedidoId');

    const result = await this.executeQuery(
      `SELECT 
         p.id,
         p.fecha_pedido,
         p.estado,
         p.subtotal,
         p.descuento,
         p.total,
         p.notas,
         p.fecha_completado,
         p.fecha_cancelado,
         c.nombre || ' ' || c.apellido AS cliente_nombre,
         c.email AS cliente_email,
         c.telefono AS cliente_telefono,
         json_agg(
           json_build_object(
             'prenda_id', pr.id,
             'prenda_nombre', pr.nombre,
             'prenda_tipo', pr.tipo,
             'cantidad', pp.cantidad,
             'precio_unitario', pp.precio_unitario,
             'subtotal', pp.subtotal
           ) ORDER BY pp.id
         ) AS items
       FROM pedidos p
       JOIN clientes c ON p.cliente_id = c.id
       JOIN pedidos_prendas pp ON p.id = pp.pedido_id
       JOIN prendas pr ON pp.prenda_id = pr.id
       WHERE p.id = $1
       GROUP BY p.id, c.nombre, c.apellido, c.email, c.telefono`,
      [pedidoId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Pedido ${pedidoId} no encontrado`);
    }

    return result.rows[0];
  }
}

module.exports = new PedidosService();
