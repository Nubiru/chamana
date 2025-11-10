// =====================================================
// Views API Routes - Phase 3 Business Intelligence
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const express = require('express');
const router = express.Router();
const { createPool } = require('../../database/scripts/00_db');
const { optionalAuthenticate } = require('../middleware/auth');

const pool = createPool('fase3');

// Apply optional authentication to all views routes
// Views can be accessed publicly, but authenticated users get better experience
router.use(optionalAuthenticate);

// GET /api/views/ventas-mensuales
router.get('/ventas-mensuales', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_ventas_mensuales ORDER BY mes DESC'
    );
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

// ===================================================================
// Phase 4: Additional Views
// ===================================================================

// GET /api/views/ventas-por-categoria
router.get('/ventas-por-categoria', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_ventas_por_categoria ORDER BY ingresos_totales DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/ventas-por-temporada
router.get('/ventas-por-temporada', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_ventas_por_temporada ORDER BY ingresos_totales DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/tendencias-productos
router.get('/tendencias-productos', async (req, res) => {
  try {
    const { producto_id, meses = 12 } = req.query;
    let query = 'SELECT * FROM vista_tendencias_productos';
    const params = [];

    if (producto_id) {
      query += ' WHERE prenda_id = $1';
      params.push(producto_id);
    }

    query += ` ORDER BY mes DESC LIMIT ${parseInt(meses) * 10}`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/analisis-proveedores
router.get('/analisis-proveedores', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_analisis_proveedores ORDER BY productos_activos DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/views/analisis-metodos-pago
router.get('/analisis-metodos-pago', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vista_analisis_metodos_pago ORDER BY monto_total DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
