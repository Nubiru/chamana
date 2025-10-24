// =====================================================
// Rutas de Prendas - Fase 1: Primera Forma Normal (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 20 de Octubre, 2025
// Versión: 1.0.0
// =====================================================

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// =====================================================
// GET /api/prendas
// Obtener todas las prendas con información normalizada (JOINs a diseños, telas, colecciones)
// =====================================================
router.get('/', async (req, res) => {
  try {
    const result = await query(`
            SELECT 
                p.id,
                p.nombre_completo,
                p.tipo_prenda,
                p.precio_chamana,
                p.precio_arro,
                p.stock_disponible,
                p.activo,
                p.fecha_creacion,
                c.nombre as categoria_nombre,
                c.descripcion as categoria_descripcion,
                d.nombre as diseno_nombre,
                d.descripcion as diseno_descripcion,
                t.nombre as tela_nombre,
                t.tipo as tela_tipo,
                col.nombre as coleccion_nombre,
                a.año as coleccion_año,
                temp.nombre as coleccion_temporada
            FROM prendas p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN disenos d ON p.diseno_id = d.id
            LEFT JOIN telas t ON p.tela_id = t.id
            LEFT JOIN colecciones col ON p.coleccion_id = col.id
            LEFT JOIN años a ON col.año_id = a.id
            LEFT JOIN temporadas temp ON col.temporada_id = temp.id
            WHERE p.activo = true
            ORDER BY p.nombre_completo
        `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener prendas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener prendas',
      message: error.message
    });
  }
});

// =====================================================
// GET /api/prendas/:id
// Obtener una prenda específica por ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
            SELECT 
                p.id,
                p.nombre_completo,
                p.tipo_prenda,
                p.precio_chamana,
                p.precio_arro,
                p.stock_disponible,
                p.activo,
                p.fecha_creacion,
                c.nombre as categoria_nombre,
                c.descripcion as categoria_descripcion,
                d.nombre as diseno_nombre,
                d.descripcion as diseno_descripcion,
                t.nombre as tela_nombre,
                t.tipo as tela_tipo,
                col.nombre as coleccion_nombre,
                a.año as coleccion_año,
                temp.nombre as coleccion_temporada
            FROM prendas p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN disenos d ON p.diseno_id = d.id
            LEFT JOIN telas t ON p.tela_id = t.id
            LEFT JOIN colecciones col ON p.coleccion_id = col.id
            LEFT JOIN años a ON col.año_id = a.id
            LEFT JOIN temporadas temp ON col.temporada_id = temp.id
            WHERE p.id = $1
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prenda no encontrada',
        message: `No se encontró una prenda con ID ${id}`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener prenda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener prenda',
      message: error.message
    });
  }
});

// =====================================================
// POST /api/prendas
// Crear una nueva prenda
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      precio_original,
      categoria_id,
      talla,
      color,
      material,
      marca,
      stock,
      stock_minimo,
      imagen_principal,
      etiquetas,
      activa,
      destacada
    } = req.body;

    // Validaciones básicas
    if (!nombre || !precio) {
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        message: 'El nombre y precio son obligatorios'
      });
    }

    if (precio < 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'El precio no puede ser negativo'
      });
    }

    const result = await query(
      `
            INSERT INTO prendas (
              nombre, descripcion, precio, precio_original, categoria_id, 
              talla, color, material, marca, stock, stock_minimo, 
              imagen_principal, etiquetas, activa, destacada
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `,
      [
        nombre,
        descripcion,
        precio,
        precio_original,
        categoria_id,
        talla,
        color,
        material,
        marca || 'CHAMANA',
        stock || 0,
        stock_minimo || 5,
        imagen_principal,
        etiquetas || [],
        activa !== false,
        destacada || false
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Prenda creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear prenda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear prenda',
      message: error.message
    });
  }
});

// =====================================================
// PUT /api/productos/:id
// Actualizar un producto existente
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, stock } = req.body;

    // Validaciones básicas
    if (precio !== undefined && precio < 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'El precio no puede ser negativo'
      });
    }

    const result = await query(
      `
            UPDATE productos 
            SET 
                nombre = COALESCE($1, nombre),
                descripcion = COALESCE($2, descripcion),
                precio = COALESCE($3, precio),
                categoria_id = COALESCE($4, categoria_id),
                stock = COALESCE($5, stock)
            WHERE id = $6
            RETURNING *
        `,
      [nombre, descripcion, precio, categoria_id, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        message: `No se encontró un producto con ID ${id}`
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto',
      message: error.message
    });
  }
});

// =====================================================
// DELETE /api/productos/:id
// Eliminar un producto
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
            DELETE FROM productos 
            WHERE id = $1
            RETURNING *
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        message: `No se encontró un producto con ID ${id}`
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto',
      message: error.message
    });
  }
});

// =====================================================
// GET /api/productos/categoria/:categoria_id
// Obtener productos por categoría
// =====================================================
router.get('/categoria/:categoria_id', async (req, res) => {
  try {
    const { categoria_id } = req.params;

    const result = await query(
      `
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock_disponible,
                p.fecha_creacion,
                c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.categoria_id = $1
            ORDER BY p.nombre
        `,
      [categoria_id]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos por categoría',
      message: error.message
    });
  }
});

// =====================================================
// GET /api/productos/buscar/:termino
// Buscar productos por nombre o descripción
// =====================================================
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;

    const result = await query(
      `
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock_disponible,
                p.fecha_creacion,
                c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.nombre ILIKE $1 OR p.descripcion ILIKE $1
            ORDER BY p.nombre
        `,
      [`%${termino}%`]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      termino: termino
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar productos',
      message: error.message
    });
  }
});

module.exports = router;
