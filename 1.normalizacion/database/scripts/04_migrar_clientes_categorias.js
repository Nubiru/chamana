// =====================================================
// Script: Migrar Clientes y Categorías - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Copia clientes y categorías desde Fase 0
// =====================================================

const { pool, fase0Pool } = require('./00_db');

async function migrarClientesCategorias() {
  try {
    console.log('🚚 Migrando clientes y categorías desde chamana_db_fase0...\n');

    // 1. Migrar Clientes
    console.log('👥 Migrando clientes...');
    const clientesResult = await fase0Pool.query('SELECT * FROM clientes ORDER BY id');

    for (const cliente of clientesResult.rows) {
      await pool.query(
        `INSERT INTO clientes (id, nombre, apellido, email, telefono, fecha_registro, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [
          cliente.id,
          cliente.nombre,
          cliente.apellido,
          cliente.email,
          cliente.telefono,
          cliente.fecha_registro,
          cliente.activo,
        ]
      );
    }
    console.log(`   ✅ ${clientesResult.rows.length} clientes migrados`);

    // 2. Migrar Categorías
    console.log('📂 Migrando categorías...');
    const categoriasResult = await fase0Pool.query('SELECT * FROM categorias ORDER BY id');

    for (const categoria of categoriasResult.rows) {
      await pool.query(
        `INSERT INTO categorias (id, nombre, descripcion, activo)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (nombre) DO NOTHING`,
        [categoria.id, categoria.nombre, categoria.descripcion, categoria.activo]
      );
    }
    console.log(`   ✅ ${categoriasResult.rows.length} categorías migradas`);

    // Verificación
    console.log('\n📊 Verificando migración:');
    const clientesCount = await pool.query('SELECT COUNT(*) FROM clientes');
    const categoriasCount = await pool.query('SELECT COUNT(*) FROM categorias');

    console.log(`   - Clientes: ${clientesCount.rows[0].count}`);
    console.log(`   - Categorías: ${categoriasCount.rows[0].count}`);

    console.log('\n✅ Clientes y categorías migrados exitosamente!\n');
    console.log('📍 Siguiente paso: Ejecuta 05_extraer_disenos_telas.js\n');
  } catch (error) {
    console.error('❌ Error al migrar clientes y categorías:', error.message);
    throw error;
  } finally {
    await pool.end();
    await fase0Pool.end();
  }
}

// Ejecutar
migrarClientesCategorias();
