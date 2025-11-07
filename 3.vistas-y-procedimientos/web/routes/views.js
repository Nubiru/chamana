// =====================================================
// Views API Routes - Phase 3 Business Intelligence
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const express = require('express');
const router = express.Router();
const { createPool } = require('../../database/scripts/00_db');

const pool = createPool('fase3');

// GET /api/views/ventas-mensuales
router.get('/ventas-mensuales', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vista_ventas_mensuales ORDER BY mes DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/inventario-critico
router.get('/inventario-critico', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_inventario_critico ORDER BY stock_disponible ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/top-productos
router.get('/top-productos', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_top_productos ORDER BY ingresos_generados DESC LIMIT 10'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/analisis-clientes
router.get('/analisis-clientes', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_analisis_clientes ORDER BY total_gastado DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/rotacion-inventario
router.get('/rotacion-inventario', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_rotacion_inventario ORDER BY porcentaje_vendido DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
