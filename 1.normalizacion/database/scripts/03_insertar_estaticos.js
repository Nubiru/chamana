// =====================================================
// Script: Insertar Datos Estáticos - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Inserta años, temporadas y colecciones
// =====================================================

const { pool } = require('./00_db');

async function insertarEstaticos() {
  try {
    console.log('📥 Insertando datos estáticos en chamana_db_fase1...\n');

    // 1. Insertar Años (2022-2032)
    console.log('📅 Insertando años (2022-2032)...');
    const años = [];
    for (let year = 2022; year <= 2032; year++) {
      años.push(year);
    }

    for (const año of años) {
      await pool.query('INSERT INTO años (año) VALUES ($1) ON CONFLICT (año) DO NOTHING', [año]);
    }
    console.log(`   ✅ ${años.length} años insertados`);

    // 2. Insertar Temporadas
    console.log('🌞 Insertando temporadas...');
    const temporadas = ['verano', 'invierno'];

    for (const temporada of temporadas) {
      await pool.query(
        'INSERT INTO temporadas (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING',
        [temporada]
      );
    }
    console.log(`   ✅ ${temporadas.length} temporadas insertadas`);

    // 3. Generar y insertar Colecciones (combinaciones de años y temporadas)
    console.log('📦 Generando colecciones...');

    // Obtener IDs de años y temporadas
    const añosResult = await pool.query('SELECT id, año FROM años ORDER BY año');
    const temporadasResult = await pool.query('SELECT id, nombre FROM temporadas ORDER BY nombre');

    let coleccionCount = 0;
    for (const añoRow of añosResult.rows) {
      for (const tempRow of temporadasResult.rows) {
        const nombreColeccion = `${tempRow.nombre.charAt(0).toUpperCase() + tempRow.nombre.slice(1)} ${añoRow.año}`;

        await pool.query(
          `INSERT INTO colecciones (año_id, temporada_id, nombre, activo) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (año_id, temporada_id) DO NOTHING`,
          [añoRow.id, tempRow.id, nombreColeccion, true]
        );
        coleccionCount++;
      }
    }
    console.log(`   ✅ ${coleccionCount} colecciones generadas`);

    // Verificación
    console.log('\n📊 Verificando datos insertados:');
    const añosCount = await pool.query('SELECT COUNT(*) FROM años');
    const temporadasCount = await pool.query('SELECT COUNT(*) FROM temporadas');
    const coleccionesCount = await pool.query('SELECT COUNT(*) FROM colecciones');

    console.log(`   - Años: ${añosCount.rows[0].count}`);
    console.log(`   - Temporadas: ${temporadasCount.rows[0].count}`);
    console.log(`   - Colecciones: ${coleccionesCount.rows[0].count}`);

    console.log('\n✅ Datos estáticos insertados exitosamente!\n');
    console.log('📍 Siguiente paso: Ejecuta 04_migrar_clientes_categorias.js\n');
  } catch (error) {
    console.error('❌ Error al insertar datos estáticos:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar
insertarEstaticos();
