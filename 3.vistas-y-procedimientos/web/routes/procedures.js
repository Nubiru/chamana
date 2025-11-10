// =====================================================
// Stored Procedures API Routes - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const express = require('express');
const router = express.Router();
const { createPool } = require('../../database/scripts/00_db');
const { validate, schemas } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const pool = createPool('fase3');

// Protect all procedure routes - they modify data and require authentication
router.use(authenticate);

// POST /api/procedures/procesar-pedido
router.post(
  '/procesar-pedido',
  validate(schemas.procesarPedido),
  async (req, res) => {
    const { pedido_id } = req.body;
    // Validation is handled by middleware

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
        return res.status(404).json({
          success: false,
          error: `Pedido #${pedido_id} no encontrado`
        });
      }

      res.json({
        success: true,
        message: `Pedido #${pedido_id} procesado exitosamente`,
        data: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// POST /api/procedures/reabastecer-inventario
router.post(
  '/reabastecer-inventario',
  validate(schemas.reabastecerInventario),
  async (req, res) => {
    const { prenda_id, cantidad } = req.body;

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
  }
);

// POST /api/procedures/calcular-comision
router.post(
  '/calcular-comision',
  validate(schemas.calcularComision),
  async (req, res) => {
    const { vendedor_id, fecha_inicio, fecha_fin, mes, año } = req.body;

    try {
      // calcular_comision_vendedor expects (fecha_inicio DATE, fecha_fin DATE, porcentaje)
      // Use provided dates or convert mes/año to date range (backward compatibility)
      let startDate = fecha_inicio;
      let endDate = fecha_fin;

      if (!startDate && mes && año) {
        // Convert mes/año to date range (first and last day of month)
        startDate = `${año}-${String(mes).padStart(2, '0')}-01`;
        const lastDay = new Date(parseInt(año), parseInt(mes), 0).getDate();
        endDate = `${año}-${String(mes).padStart(2, '0')}-${lastDay}`;
      }

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'fecha_inicio/fecha_fin o mes/año son requeridos'
        });
      }

      const porcentaje = 5.0; // Default 5% commission

      const result = await pool.query(
        'SELECT * FROM calcular_comision_vendedor($1::DATE, $2::DATE, $3)',
        [startDate, endDate, porcentaje]
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
  }
);

module.exports = router;
