// =====================================================
// Rutas de Clientes - Fase 0: Comienzo
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 15 de Octubre, 2025
// Versión: 0.1.0
// =====================================================

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// =====================================================
// GET /api/clientes
// Obtener todos los clientes CHAMANA
// =====================================================
router.get('/', async (req, res) => {
  try {
    const result = await query(`
            SELECT 
                id,
                nombre,
                apellido,
                email,
                telefono,
                fecha_registro,
                activo
            FROM clientes
            ORDER BY fecha_registro DESC
        `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener clientes',
      message: error.message
    });
  }
});

// =====================================================
// GET /api/clientes/:id
// Obtener un usuario específico por ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
            SELECT 
                id,
                nombre,
                email,
                fecha_registro
            FROM clientes
            WHERE id = $1
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
      message: error.message
    });
  }
});

// =====================================================
// POST /api/clientes
// Crear un nuevo usuario
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { nombre, email } = req.body;

    // Validaciones básicas
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        message: 'El nombre y email son obligatorios'
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
        message: 'El formato del email no es válido'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await query(
      `
            SELECT id FROM clientes WHERE email = $1
        `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email ya registrado',
        message: 'Ya existe un usuario con este email'
      });
    }

    const result = await query(
      `
            INSERT INTO clientes (nombre, email)
            VALUES ($1, $2)
            RETURNING *
        `,
      [nombre, email]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario',
      message: error.message
    });
  }
});

// =====================================================
// PUT /api/clientes/:id
// Actualizar un usuario existente
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    // Validar formato de email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido',
          message: 'El formato del email no es válido'
        });
      }

      // Verificar si el email ya existe en otro usuario
      const existingUser = await query(
        `
                SELECT id FROM clientes WHERE email = $1 AND id != $2
            `,
        [email, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Email ya registrado',
          message: 'Ya existe otro usuario con este email'
        });
      }
    }

    const result = await query(
      `
            UPDATE clientes 
            SET 
                nombre = COALESCE($1, nombre),
                email = COALESCE($2, email)
            WHERE id = $3
            RETURNING *
        `,
      [nombre, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario',
      message: error.message
    });
  }
});

// =====================================================
// DELETE /api/clientes/:id
// Eliminar un usuario
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
            DELETE FROM clientes 
            WHERE id = $1
            RETURNING *
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario',
      message: error.message
    });
  }
});

// =====================================================
// GET /api/clientes/buscar/:termino
// Buscar clientes por nombre o email
// =====================================================
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;

    const result = await query(
      `
            SELECT 
                id,
                nombre,
                email,
                fecha_registro
            FROM clientes
            WHERE nombre ILIKE $1 OR email ILIKE $1
            ORDER BY nombre
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
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar clientes',
      message: error.message
    });
  }
});

// =====================================================
// GET /api/clientes/estadisticas
// Obtener estadísticas de clientes
// =====================================================
router.get('/estadisticas', async (req, res) => {
  try {
    const result = await query(`
            SELECT 
                COUNT(*) as total_clientes,
                COUNT(CASE WHEN fecha_registro >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as clientes_ultima_semana,
                COUNT(CASE WHEN fecha_registro >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as clientes_ultimo_mes,
                MIN(fecha_registro) as primer_usuario,
                MAX(fecha_registro) as ultimo_usuario
            FROM clientes
        `);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
});

module.exports = router;
