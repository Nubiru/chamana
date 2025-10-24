// =====================================================
// Productos Service - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Servicio de Productos
 *
 * Maneja lógica de negocio relacionada con productos,
 * incluyendo stock breakdown e historial de inventario.
 */

const BaseService = require('./base.service');
const { NotFoundError } = require('../utils/errors');
const { required, isPositive } = require('../utils/validation');
const logger = require('../config/logger');

class ProductosService extends BaseService {
  /**
   * Obtener producto por ID con stock breakdown
   *
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto con stock
   */
  async getProductById(id) {
    required(id, 'id');
    isPositive(id, 'id');

    const result = await this.executeQuery(
      `SELECT 
         p.id,
         p.nombre,
         p.tipo,
         p.precio_chamana,
         p.activa,
         p.stock_inicial,
         p.stock_vendido,
         p.stock_disponible,
         p.fecha_ultima_venta,
         p.fecha_creacion,
         c.id AS categoria_id,
         c.nombre AS categoria_nombre,
         c.descripcion AS categoria_descripcion,
         d.id AS diseno_id,
         d.nombre AS diseno_nombre,
         d.descripcion AS diseno_descripcion,
         t.id AS tela_id,
         t.nombre AS tela_nombre,
         t.tipo AS tela_tipo,
         col.id AS coleccion_id,
         col.nombre AS coleccion_nombre,
         a.año AS coleccion_año,
         temp.nombre AS coleccion_temporada
       FROM prendas p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       LEFT JOIN disenos d ON p.diseno_id = d.id
       LEFT JOIN telas t ON p.tela_id = t.id
       LEFT JOIN colecciones col ON p.coleccion_id = col.id
       LEFT JOIN años a ON col.año_id = a.id
       LEFT JOIN temporadas temp ON col.temporada_id = temp.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Producto ${id} no encontrado`);
    }

    logger.info('Producto obtenido', { producto_id: id });
    return result.rows[0];
  }

  /**
   * Obtener historial de stock para producto
   *
   * @param {number} prendaId - ID de prenda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Movimientos de inventario
   */
  async getStockHistory(prendaId, limit = 50) {
    required(prendaId, 'prendaId');
    isPositive(prendaId, 'prendaId');
    await this.ensureExists('prendas', prendaId);

    const result = await this.executeQuery(
      `SELECT 
         mi.id,
         mi.fecha,
         mi.tipo,
         mi.cantidad,
         mi.stock_anterior,
         mi.stock_nuevo,
         mi.motivo,
         p.id AS pedido_id,
         p.fecha_pedido,
         p.total AS pedido_total
       FROM movimientos_inventario mi
       LEFT JOIN pedidos p ON mi.pedido_id = p.id
       WHERE mi.prenda_id = $1
       ORDER BY mi.fecha DESC
       LIMIT $2`,
      [prendaId, limit]
    );

    logger.info('Historial de stock obtenido', {
      prenda_id: prendaId,
      movimientos: result.rows.length
    });

    return result.rows;
  }

  /**
   * Listar productos con filtros (incluyendo seasonal filtering)
   *
   * @param {Object} filters - Filtros
   * @param {number} filters.categoria_id - Filtrar por categoría
   * @param {boolean} filters.activa - Filtrar por activo
   * @param {Array<number>} filters.tela_ids - Filtrar por IDs de telas (para seasonal filtering)
   * @param {number} filters.limit - Límite de resultados
   * @param {number} filters.offset - Offset para paginación
   * @returns {Promise<Array>}
   */
  async listProducts(filters = {}) {
    const {
      categoria_id,
      activa,
      tela_ids, // ⭐ NEW: Filter by fabric IDs (for seasonal filtering)
      limit = 50,
      offset = 0
    } = filters;

    let query = `
      SELECT 
        p.id,
        p.nombre,
        p.tipo,
        p.precio_chamana,
        p.activa,
        p.stock_disponible,
        p.stock_inicial,
        p.stock_vendido,
        p.fecha_ultima_venta,
        c.nombre AS categoria_nombre,
        t.nombre AS tela_nombre,
        d.nombre AS diseno_nombre,
        col.nombre AS coleccion_nombre
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN telas t ON p.tela_id = t.id
      LEFT JOIN disenos d ON p.diseno_id = d.id
      LEFT JOIN colecciones col ON p.coleccion_id = col.id
    `;

    const conditions = [];
    const params = [];

    if (categoria_id) {
      params.push(categoria_id);
      conditions.push(`p.categoria_id = $${params.length}`);
    }

    if (activa !== undefined) {
      params.push(activa);
      conditions.push(`p.activa = $${params.length}`);
    }

    // ⭐ NEW: Filter by fabric IDs (seasonal filtering)
    if (tela_ids && Array.isArray(tela_ids) && tela_ids.length > 0) {
      params.push(tela_ids);
      conditions.push(`p.tela_id = ANY($${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.nombre';

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await this.executeQuery(query, params);

    logger.info('Productos listados', {
      count: result.rows.length,
      filters: { categoria_id, activa, tela_ids_count: tela_ids?.length }
    });

    return result.rows;
  }
}

module.exports = new ProductosService();

// =====================================================
// FIN DE PRODUCTOS SERVICE
// =====================================================
