// =====================================================
// Rutas de Categorías - Fase 0: Comienzo
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 15 de Octubre, 2025
// Versión: 0.1.0
// =====================================================

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// =====================================================
// GET /api/categorias
// Obtener todas las categorías con estadísticas
// =====================================================
router.get('/', async (_req, res) => {
  try {
    const result = await query(`
            SELECT 
                c.id,
                c.nombre,
                c.descripcion,
                COUNT(p.id) as total_prendas,
                COALESCE(SUM(p.stock), 0) as total_stock,
                COALESCE(AVG(p.precio_chamana), 0) as precio_promedio,
                COALESCE(MIN(p.precio_chamana), 0) as precio_minimo,
                COALESCE(MAX(p.precio_chamana), 0) as precio_maximo
            FROM categorias c
            LEFT JOIN prendas p ON c.id = p.categoria_id
            GROUP BY c.id, c.nombre, c.descripcion
            ORDER BY c.nombre
        `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      message: error.message,
    });
  }
});

// =====================================================
// GET /api/categorias/:id
// Obtener una categoría específica por ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
            SELECT 
                c.id,
                c.nombre,
                c.descripcion,
                COUNT(p.id) as total_prendas,
                COALESCE(SUM(p.stock), 0) as total_stock,
                COALESCE(AVG(p.precio_chamana), 0) as precio_promedio
            FROM categorias c
            LEFT JOIN prendas p ON c.id = p.categoria_id
            WHERE c.id = $1
            GROUP BY c.id, c.nombre, c.descripcion
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada',
        message: `No se encontró una categoría con ID ${id}`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categoría',
      message: error.message,
    });
  }
});

// =====================================================
// POST /api/categorias
// Crear una nueva categoría
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        message: 'El nombre es obligatorio',
      });
    }

    // Verificar si la categoría ya existe
    const existingCategory = await query(
      `
            SELECT id FROM categorias WHERE nombre = $1
        `,
      [nombre]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Categoría ya existe',
        message: 'Ya existe una categoría con este nombre',
      });
    }

    const result = await query(
      `
            INSERT INTO categorias (nombre, descripcion)
            VALUES ($1, $2)
            RETURNING *
        `,
      [nombre, descripcion]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Categoría creada exitosamente',
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear categoría',
      message: error.message,
    });
  }
});

// =====================================================
// PUT /api/categorias/:id
// Actualizar una categoría existente
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar si el nombre ya existe en otra categoría
    if (nombre) {
      const existingCategory = await query(
        `
                SELECT id FROM categorias WHERE nombre = $1 AND id != $2
            `,
        [nombre, id]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Nombre ya existe',
          message: 'Ya existe otra categoría con este nombre',
        });
      }
    }

    const result = await query(
      `
            UPDATE categorias 
            SET 
                nombre = COALESCE($1, nombre),
                descripcion = COALESCE($2, descripcion)
            WHERE id = $3
            RETURNING *
        `,
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada',
        message: `No se encontró una categoría con ID ${id}`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Categoría actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar categoría',
      message: error.message,
    });
  }
});

// =====================================================
// DELETE /api/categorias/:id
// Eliminar una categoría
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la categoría tiene prendas
    const productsInCategory = await query(
      `
            SELECT COUNT(*) as count FROM prendas WHERE categoria_id = $1
        `,
      [id]
    );

    if (parseInt(productsInCategory.rows[0].count, 10) > 0) {
      return res.status(409).json({
        success: false,
        error: 'No se puede eliminar la categoría',
        message: 'La categoría tiene prendas asociados. Elimine los prendas primero.',
      });
    }

    const result = await query(
      `
            DELETE FROM categorias 
            WHERE id = $1
            RETURNING *
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada',
        message: `No se encontró una categoría con ID ${id}`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar categoría',
      message: error.message,
    });
  }
});

// =====================================================
// GET /api/categorias/:id/prendas
// Obtener prendas de una categoría específica
// =====================================================
router.get('/:id/prendas', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
            SELECT 
                p.id,
                p.nombre_completo,
                p.tipo,
                p.tela_nombre,
                p.precio_chamana,
                p.stock,
                p.fecha_creacion,
                c.nombre as categoria_nombre
            FROM prendas p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE c.id = $1
            ORDER BY p.nombre_completo
        `,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener prendas de la categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener prendas de la categoría',
      message: error.message,
    });
  }
});

// =====================================================
// GET /api/categorias/buscar/:termino
// Buscar categorías por nombre o descripción
// =====================================================
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;

    const result = await query(
      `
            SELECT 
                c.id,
                c.nombre,
                c.descripcion,
                COUNT(p.id) as total_prendas
            FROM categorias c
            LEFT JOIN prendas p ON c.id = p.categoria_id
            WHERE c.nombre ILIKE $1 OR c.descripcion ILIKE $1
            GROUP BY c.id, c.nombre, c.descripcion
            ORDER BY c.nombre
        `,
      [`%${termino}%`]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      termino: termino,
    });
  } catch (error) {
    console.error('Error al buscar categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar categorías',
      message: error.message,
    });
  }
});

module.exports = router;
