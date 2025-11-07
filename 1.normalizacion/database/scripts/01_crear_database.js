// =====================================================
// Script: Crear Base de Datos - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Crea la base de datos chamana_db_fase1
// =====================================================

const { defaultPool } = require('./00_db');

async function crearDatabase() {
  try {
    console.log('🔨 Creando base de datos chamana_db_fase1...\n');

    // Verificar si la base de datos ya existe
    const checkQuery = `
      SELECT 1 FROM pg_database WHERE datname = 'chamana_db_fase1'
    `;
    const checkResult = await defaultPool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  La base de datos chamana_db_fase1 ya existe.');
      console.log('   Si deseas recrearla, elimínala manualmente primero.\n');
      return;
    }

    // Crear la base de datos
    await defaultPool.query('CREATE DATABASE chamana_db_fase1');

    console.log('✅ Base de datos chamana_db_fase1 creada exitosamente!\n');
    console.log('📍 Siguiente paso: Ejecuta 02_crear_tablas.js\n');
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    throw error;
  } finally {
    await defaultPool.end();
  }
}

// Ejecutar
crearDatabase();
