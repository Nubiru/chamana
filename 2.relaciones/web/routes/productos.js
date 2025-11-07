/**
 * Rutas de Productos (Enhanced) - Fase 2: 2NF
 *
 * Endpoints para gestión de productos con stock breakdown
 * e historial de inventario.
 */

const express = require('express');
const router = express.Router();
const productosService = require('../services/productos.service');

/**
 * GET /api/productos - Listar productos (con filtros opcionales)
 *
 * Query params:
 *   ?categoria_id=1
 *   ?activa=true
 *   ?tela_ids=1,2,3 (para seasonal filtering)
 *   ?limit=50
 *   ?offset=0
 */
router.get('/', async (req, res, next) => {
  try {
    const { categoria_id, activa, tela_ids, limit, offset } = req.query;

    const productos = await productosService.listProducts({
      categoria_id: categoria_id ? parseInt(categoria_id, 10) : undefined,
      activa: activa !== 'false', // Default to true unless explicitly set to 'false'
      tela_ids: tela_ids ? tela_ids.split(',').map((id) => parseInt(id.trim(), 10)) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    res.json(productos);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/productos/:id/historial-stock - ⭐ NEW
 * Obtener historial de movimientos de inventario
 *
 * Query params:
 *   ?limit=50 (opcional)
 *
 * Retorna:
 *   - Movimientos ordenados por fecha DESC
 *   - Incluye referencia a pedido si aplicable
 *
 * NOTA: Esta ruta debe estar ANTES de '/:id' para que Express la reconozca
 */
router.get('/:id/historial-stock', async (req, res, next) => {
  try {
    const { limit } = req.query;

    const history = await productosService.getStockHistory(
      parseInt(req.params.id, 10),
      limit ? parseInt(limit, 10) : undefined
    );

    res.json(history);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/productos/:id - Obtener producto con stock breakdown
 *
 * Incluye:
 *   - Stock inicial, vendido, disponible
 *   - Fecha última venta
 *   - Información completa de categoría, diseño, tela, colección
 */
router.get('/:id', async (req, res, next) => {
  try {
    const producto = await productosService.getProductById(parseInt(req.params.id, 10));
    res.json(producto);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
