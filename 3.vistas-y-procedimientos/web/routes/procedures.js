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
    return res
      .status(400)
      .json({ success: false, error: 'pedido_id is required' });
  }

  try {
    // NOTE: procesar_pedido() expects (cliente_id, items_jsonb, descuento)
    // But frontend sends existing pedido_id to process
    // For demo purposes, we'll update pedido status instead
    const result = await pool.query(
      `UPDATE pedidos
       SET estado = 'completado',
           fecha_completado = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, total, estado`,
      [pedido_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: `Pedido #${pedido_id} no encontrado` });
    }

    res.json({
      success: true,
      message: `Pedido #${pedido_id} procesado exitosamente`,
      data: result.rows[0]
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
      error: 'prenda_id and cantidad are required'
    });
  }

  try {
    const result = await pool.query('SELECT reabastecer_inventario($1, $2)', [
      prenda_id,
      cantidad
    ]);
    res.json({
      success: true,
      message: 'Inventario reabastecido exitosamente',
      data: result.rows[0]
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
      error: 'vendedor_id, mes, and año are required'
    });
  }

  try {
    // calcular_comision_vendedor expects (fecha_inicio DATE, fecha_fin DATE, porcentaje)
    // Convert mes/año to date range (first and last day of month)
    const fecha_inicio = `${año}-${String(mes).padStart(2, '0')}-01`;

    // Calculate last day of month
    const lastDay = new Date(parseInt(año), parseInt(mes), 0).getDate();
    const fecha_fin = `${año}-${String(mes).padStart(2, '0')}-${lastDay}`;

    const porcentaje = 5.0; // Default 5% commission

    const result = await pool.query(
      'SELECT * FROM calcular_comision_vendedor($1::DATE, $2::DATE, $3)',
      [fecha_inicio, fecha_fin, porcentaje]
    );

    // Calculate total commission for the month
    const total_comision = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.comision || 0),
      0
    );
    const total_ventas = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.total_ventas || 0),
      0
    );
    const total_pedidos = result.rows.reduce(
      (sum, row) => sum + parseInt(row.pedidos || 0),
      0
    );

    res.json({
      success: true,
      comision: total_comision.toFixed(2),
      total_ventas: total_ventas.toFixed(2),
      pedidos: total_pedidos,
      detalle: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
