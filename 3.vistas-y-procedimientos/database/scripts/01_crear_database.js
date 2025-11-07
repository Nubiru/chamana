/**
 * Script 01: Crear Database - chamana_db_fase3
 *
 * Creates the Phase 3 database for CHAMANA project (3NF + Views + Procedures + Triggers).
 * This script connects to the 'postgres' system database to create the new database.
 *
 * If this script fails:
 * 1. Check PostgreSQL is running: pg_isready
 * 2. Verify postgres user credentials
 * 3. Check if database already exists: psql -U postgres -l
 * 4. Manual cleanup: psql -U postgres -c "DROP DATABASE IF EXISTS chamana_db_fase3;"
 */

const { createPool, logError, logSuccess } = require('./00_db');

async function crearDatabase() {
  const pool = createPool('postgres'); // Connect to postgres system database
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando creación de base de datos Fase 3 (3NF)...\n');

    // Check if database exists
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'chamana_db_fase3'`
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Base de datos chamana_db_fase3 ya existe. Eliminando...');

      // Terminate existing connections
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'chamana_db_fase3'
          AND pid <> pg_backend_pid();
      `);

      // Drop existing database
      await client.query('DROP DATABASE IF EXISTS chamana_db_fase3');
      console.log('✅ Base de datos anterior eliminada');
    }

    // Create new database
    await client.query('CREATE DATABASE chamana_db_fase3');

    logSuccess('01_crear_database.js', 'Base de datos chamana_db_fase3 creada exitosamente');

    console.log('\n📝 Detalles:');
    console.log('   - Nombre: chamana_db_fase3');
    console.log('   - Owner: postgres');
    console.log('   - Encoding: UTF8');
    console.log('   - Estado: Listo para recibir tablas (3NF)\n');
  } catch (error) {
    logError('01_crear_database.js', 'Creación de Base de Datos', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
crearDatabase()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
