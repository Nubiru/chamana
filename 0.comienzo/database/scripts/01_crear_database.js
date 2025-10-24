// =====================================================
// Script 01: Crear Base de Datos
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Propósito: Crear la base de datos chamana_db_fase0
// =====================================================

const { defaultPool } = require('./00_db');

async function crearBaseDeDatos() {
  console.log('=====================================================');
  console.log('🗄️  CHAMANA - Creación de Base de Datos');
  console.log('=====================================================\n');

  try {
    // Verificar si la base de datos ya existe
    const checkQuery = `
      SELECT 1 FROM pg_database WHERE datname = 'chamana_db_fase0';
    `;
    const checkResult = await defaultPool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  La base de datos "chamana_db_fase0" ya existe.');
      console.log('📌 Eliminando base de datos existente...\n');

      // Terminar todas las conexiones activas a la base de datos
      await defaultPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'chamana_db_fase0'
          AND pid <> pg_backend_pid();
      `);

      // Eliminar la base de datos existente
      await defaultPool.query('DROP DATABASE chamana_db_fase0;');
      console.log('✅ Base de datos eliminada correctamente.\n');
    }

    // Crear nueva base de datos
    console.log('📌 Creando nueva base de datos "chamana_db_fase0"...');
    await defaultPool.query('CREATE DATABASE chamana_db_fase0;');

    console.log('✅ Base de datos "chamana_db_fase0" creada exitosamente!\n');
    console.log('=====================================================');
    console.log('✨ Siguiente paso: Ejecutar "node 02_crear_tablas.js"');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que PostgreSQL esté ejecutándose');
    console.error('   - Verifica usuario y contraseña en 00_db.js');
    console.error('   - Verifica permisos para crear bases de datos');
  } finally {
    await defaultPool.end();
  }
}

// Ejecutar función
crearBaseDeDatos();
