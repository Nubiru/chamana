// =====================================================
// Stored Procedures API Routes - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const express = require('express');
const router = express.Router();
const { createPool } = require('../../database/scripts/00_db');

const pool = createPool('fase3');

// POST /api/procedures/procesar-pedido
router.post('/procesar-pedido', async (req, res) => {
  const { pedido_id } = req.body;

  if (!pedido_id) {
    return res.status(400).json({ success: false, error: 'pedido_id is required' });
  }

  try {
    const result = await pool.query('SELECT procesar_pedido($1)', [pedido_id]);
    res.json({
      success: true,
      message: 'Pedido procesado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/procedures/reabastecer-inventario
router.post('/reabastecer-inventario', async (req, res) => {
  const { prenda_id, cantidad } = req.body;

  if (!prenda_id || !cantidad) {
    return res.status(400).json({
      success: false,
      error: 'prenda_id and cantidad are required',
    });
  }

  try {
    const result = await pool.query('SELECT reabastecer_inventario($1, $2)', [prenda_id, cantidad]);
    res.json({
      success: true,
      message: 'Inventario reabastecido exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/procedures/calcular-comision
router.post('/calcular-comision', async (req, res) => {
  const { vendedor_id, mes, año } = req.body;

  if (!vendedor_id || !mes || !año) {
    return res.status(400).json({
      success: false,
      error: 'vendedor_id, mes, and año are required',
    });
  }

  try {
    const result = await pool.query('SELECT calcular_comision_vendedor($1, $2, $3)', [
      vendedor_id,
      mes,
      año,
    ]);
    res.json({
      success: true,
      comision: result.rows[0].calcular_comision_vendedor,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
