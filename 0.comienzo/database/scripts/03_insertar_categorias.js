// =====================================================
// Script 03: Insertar Categorías
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Propósito: Insertar 5 categorías reales de CHAMANA
// =====================================================

const { pool } = require('./00_db');

// Categorías reales de CHAMANA (basadas en los tipos del catálogo real)
const categorias = [
  {
    nombre: 'Buzo',
    descripcion:
      'Buzos de algodón y mezclas cómodas para uso diario. Incluye diseños Gaia, Nube y Tormenta.'
  },
  {
    nombre: 'Remera',
    descripcion:
      'Remeras frescas y versátiles. Diseños Rocio, Brisa y otros en diferentes telas.'
  },
  {
    nombre: 'Vestido',
    descripcion:
      'Vestidos elegantes y casuales para toda ocasión. Diseño Aire y más.'
  },
  {
    nombre: 'Palazzo',
    descripcion:
      'Pantalones palazzo amplios y cómodos. Diseño Corteza en diferentes telas.'
  },
  {
    nombre: 'Pantalón',
    descripcion:
      'Pantalones clásicos y modernos. Diseño Raiz en diversos estilos.'
  }
];

async function insertarCategorias() {
  console.log('=====================================================');
  console.log('📁 CHAMANA - Inserción de Categorías');
  console.log('=====================================================\n');

  try {
    console.log('📌 Insertando 5 categorías reales de CHAMANA...\n');

    for (const cat of categorias) {
      const query = `
        INSERT INTO categorias (nombre, descripcion, activa)
        VALUES ($1, $2, $3)
        ON CONFLICT (nombre) DO NOTHING
        RETURNING *;
      `;
      const valores = [cat.nombre, cat.descripcion, true];

      const resultado = await pool.query(query, valores);

      if (resultado.rows.length > 0) {
        console.log(
          `✅ Categoría insertada: "${cat.nombre}" (ID: ${resultado.rows[0].id})`
        );
      } else {
        console.log(`⚠️  Categoría "${cat.nombre}" ya existía (omitida)`);
      }
    }

    // Mostrar resumen
    console.log('\n📊 Resumen de categorías:');
    const resumen = await pool.query(
      'SELECT id, nombre FROM categorias ORDER BY id;'
    );
    resumen.rows.forEach((cat) => {
      console.log(`   ${cat.id}. ${cat.nombre}`);
    });

    console.log('\n=====================================================');
    console.log('✨ Categorías insertadas exitosamente!');
    console.log(`   Total: ${resumen.rows.length} categorías`);
    console.log('=====================================================');
    console.log(
      '✨ Siguiente paso: Ejecutar "node 04_insertar_prendas_real.js"'
    );
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Error al insertar categorías:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que la tabla "categorias" exista');
    console.error('   - Ejecuta "node 02_crear_tablas.js" primero');
  } finally {
    await pool.end();
  }
}

// Ejecutar función
insertarCategorias();
