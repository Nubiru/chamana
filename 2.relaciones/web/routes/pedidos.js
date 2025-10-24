/**
 * Rutas de Pedidos - Orders Domain
 */

const express = require('express');
const router = express.Router();
const pedidosService = require('../services/pedidos.service');
const logger = require('../config/logger');

/**
 * POST /api/pedidos - Crear pedido
 */
router.post('/', async (req, res, next) => {
  try {
    const { cliente_id, items, descuento, notas } = req.body;

    const result = await pedidosService.createOrder({
      cliente_id,
      items,
      descuento,
      notas
    });

    res.status(201).json({
      success: true,
      ...result,
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pedidos - Listar pedidos
 */
router.get('/', async (req, res, next) => {
  try {
    const { cliente_id, estado, limit, offset } = req.query;

    const orders = await pedidosService.listOrders({
      cliente_id: cliente_id ? parseInt(cliente_id) : undefined,
      estado,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pedidos/:id - Obtener pedido por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await pedidosService.getOrderById(parseInt(req.params.id));
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pedidos/:id/completar - Completar pedido
 */
router.put('/:id/completar', async (req, res, next) => {
  try {
    await pedidosService.completeOrder(parseInt(req.params.id));

    res.json({
      success: true,
      message: 'Pedido completado y stock actualizado'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pedidos/:id/cancelar - Cancelar pedido
 */
router.put('/:id/cancelar', async (req, res, next) => {
  try {
    await pedidosService.cancelOrder(parseInt(req.params.id));

    res.json({
      success: true,
      message: 'Pedido cancelado'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
