/**
 * Script 04: Migrar Datos desde Fase 1
 *
 * Migrates all data from chamana_db_fase1 to chamana_db_fase2:
 * - clientes (20 records)
 * - categorias (5 records)
 * - disenos (8 records)
 * - telas (14 records)
 * - años (11 records)
 * - temporadas (2 records)
 * - colecciones (22 records)
 * - prendas (30 records with stock initialization)
 *
 * Critical: Uses transaction to ensure atomicity (all or nothing)
 *
 * If this script fails:
 * 1. Verify Phase 1 database exists: psql -U postgres -l | grep chamana_db_fase1
 * 2. Check Phase 2 tables exist: psql -U postgres -d chamana_db_fase2 -c "\dt"
 * 3. Manual rollback: Truncate all tables or drop/recreate database
 * 4. Check data counts in Phase 1: psql -U postgres -d chamana_db_fase1 -c "SELECT COUNT(*) FROM prendas;"
 */

const { Pool } = require('pg');
const {
  logError,
  logSuccess,
  DB_CONFIGS,
  toTitleCase,
  normalizeWithDefault,
  generatePrendaName
} = require('./00_db');

async function migrarDatos() {
  // Create separate pools for source and target databases
  const poolFase1 = new Pool(DB_CONFIGS.fase1);
  const poolFase2 = new Pool(DB_CONFIGS.fase2);

  const clientFase1 = await poolFase1.connect();
  const clientFase2 = await poolFase2.connect();

  try {
    // Start transaction in target database
    await clientFase2.query('BEGIN');
    console.log('🚀 Iniciando migración de datos desde Fase 1...\n');

    const stats = {};

    // ===================================================================
    // TABLE 1: clientes (WITH ACTIVATION)
    // ===================================================================
    console.log('📦 Migrando clientes...');
    const clientes = await clientFase1.query(
      'SELECT * FROM clientes ORDER BY id'
    );

    for (const cliente of clientes.rows) {
      await clientFase2.query(
        `
        INSERT INTO clientes (id, nombre, apellido, email, telefono, direccion, ciudad, codigo_postal, fecha_registro, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          cliente.id,
          cliente.nombre,
          cliente.apellido,
          cliente.email,
          cliente.telefono,
          cliente.direccion,
          cliente.ciudad,
          cliente.codigo_postal,
          cliente.fecha_registro,
          true // ✅ Always activate in Phase 2
        ]
      );
    }
    stats['clientes'] = clientes.rows.length;
    console.log(
      `   ✅ ${clientes.rows.length} registros migrados (todos activos)`
    );

    // Update sequence
    await clientFase2.query(
      `SELECT setval('clientes_id_seq', (SELECT MAX(id) FROM clientes))`
    );

    // ===================================================================
    // TABLE 2: categorias (no changes)
    // ===================================================================
    console.log('\n📦 Migrando categorias...');
    const categorias = await clientFase1.query(
      'SELECT * FROM categorias ORDER BY id'
    );

    for (const categoria of categorias.rows) {
      await clientFase2.query(
        `
        INSERT INTO categorias (id, nombre, descripcion)
        VALUES ($1, $2, $3)
      `,
        [categoria.id, categoria.nombre, categoria.descripcion]
      );
    }
    stats['categorias'] = categorias.rows.length;
    console.log(`   ✅ ${categorias.rows.length} registros migrados`);

    await clientFase2.query(
      `SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias))`
    );

    // ===================================================================
    // TABLE 3: disenos (no changes)
    // ===================================================================
    console.log('\n📦 Migrando disenos...');
    const disenos = await clientFase1.query(
      'SELECT * FROM disenos ORDER BY id'
    );

    for (const diseno of disenos.rows) {
      await clientFase2.query(
        `
        INSERT INTO disenos (id, nombre, descripcion, fecha_creacion)
        VALUES ($1, $2, $3, $4)
      `,
        [diseno.id, diseno.nombre, diseno.descripcion, diseno.fecha_creacion]
      );
    }
    stats['disenos'] = disenos.rows.length;
    console.log(`   ✅ ${disenos.rows.length} registros migrados`);

    await clientFase2.query(
      `SELECT setval('disenos_id_seq', (SELECT MAX(id) FROM disenos))`
    );

    // ===================================================================
    // TABLE 4: telas (no changes)
    // ===================================================================
    console.log('\n📦 Migrando telas...');
    const telas = await clientFase1.query('SELECT * FROM telas ORDER BY id');

    for (const tela of telas.rows) {
      await clientFase2.query(
        `
        INSERT INTO telas (id, nombre, tipo, descripcion)
        VALUES ($1, $2, $3, $4)
      `,
        [tela.id, tela.nombre, tela.tipo, tela.descripcion]
      );
    }
    stats['telas'] = telas.rows.length;
    console.log(`   ✅ ${telas.rows.length} registros migrados`);

    await clientFase2.query(
      `SELECT setval('telas_id_seq', (SELECT MAX(id) FROM telas))`
    );

    // ===================================================================
    // TABLE 5: años (no changes)
    // ===================================================================
    console.log('\n📦 Migrando años...');
    const años = await clientFase1.query('SELECT * FROM años ORDER BY id');

    for (const año of años.rows) {
      await clientFase2.query(
        `
        INSERT INTO años (id, año)
        VALUES ($1, $2)
      `,
        [año.id, año.año]
      );
    }
    stats['años'] = años.rows.length;
    console.log(`   ✅ ${años.rows.length} registros migrados`);

    await clientFase2.query(
      `SELECT setval('años_id_seq', (SELECT MAX(id) FROM años))`
    );

    // ===================================================================
    // TABLE 6: temporadas (WITH NORMALIZATION)
    // ===================================================================
    console.log('\n📦 Migrando temporadas...');
    const temporadas = await clientFase1.query(
      'SELECT * FROM temporadas ORDER BY id'
    );

    let normalizedSeasons = 0;
    for (const temporada of temporadas.rows) {
      // Normalize: "INVIERNO" → "Invierno", "verano" → "Verano"
      const nombreNormalizado = normalizeWithDefault(
        temporada.nombre,
        'Desconocida'
      );

      if (nombreNormalizado !== temporada.nombre) {
        normalizedSeasons++;
      }

      await clientFase2.query(
        `
        INSERT INTO temporadas (id, nombre)
        VALUES ($1, $2)
      `,
        [temporada.id, nombreNormalizado]
      );
    }
    stats['temporadas'] = temporadas.rows.length;
    console.log(`   ✅ ${temporadas.rows.length} registros migrados`);
    if (normalizedSeasons > 0) {
      console.log(
        `   📝 ${normalizedSeasons} temporadas normalizadas a Title Case`
      );
    }

    await clientFase2.query(
      `SELECT setval('temporadas_id_seq', (SELECT MAX(id) FROM temporadas))`
    );

    // ===================================================================
    // TABLE 7: colecciones (WITH ACTIVATION)
    // ===================================================================
    console.log('\n📦 Migrando colecciones...');
    const colecciones = await clientFase1.query(
      'SELECT * FROM colecciones ORDER BY id'
    );

    for (const coleccion of colecciones.rows) {
      await clientFase2.query(
        `
        INSERT INTO colecciones (id, nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          coleccion.id,
          coleccion.nombre,
          coleccion.año_id,
          coleccion.temporada_id,
          coleccion.descripcion,
          coleccion.fecha_inicio,
          coleccion.fecha_fin,
          true // ✅ Always activate in Phase 2
        ]
      );
    }
    stats['colecciones'] = colecciones.rows.length;
    console.log(
      `   ✅ ${colecciones.rows.length} registros migrados (todas activas)`
    );

    await clientFase2.query(
      `SELECT setval('colecciones_id_seq', (SELECT MAX(id) FROM colecciones))`
    );

    // ===================================================================
    // TABLE 8: prendas (ENHANCED - initialize stock columns + DATA NORMALIZATION)
    // ===================================================================
    console.log(
      '\n📦 Migrando prendas (con inicialización de stock y normalización)...'
    );
    const prendas = await clientFase1.query(
      'SELECT * FROM prendas ORDER BY id'
    );

    let generatedNames = 0;
    let normalizedTipos = 0;

    for (const prenda of prendas.rows) {
      // Handle NULL nombres: Generate default if missing
      let nombreFinal = toTitleCase(prenda.nombre);
      if (!nombreFinal) {
        nombreFinal = generatePrendaName(prenda);
        generatedNames++;
      }

      // Normalize tipo to Title Case
      const tipoNormalizado = normalizeWithDefault(prenda.tipo, 'Prenda');
      if (tipoNormalizado !== prenda.tipo) {
        normalizedTipos++;
      }

      // Initialize stock: Use Phase 1 value if > 0, otherwise default to 10 for testing
      const stockInicial =
        prenda.stock_disponible && prenda.stock_disponible > 0
          ? prenda.stock_disponible
          : 10; // Default stock for testing Phase 2 orders

      await clientFase2.query(
        `
        INSERT INTO prendas (
          id, nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, 
          coleccion_id, descripcion, fecha_creacion, activa,
          stock_inicial, stock_vendido
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
        [
          prenda.id,
          nombreFinal, // ✅ Normalized or generated
          tipoNormalizado, // ✅ Normalized to Title Case
          prenda.precio_chamana,
          prenda.categoria_id,
          prenda.diseno_id,
          prenda.tela_id,
          prenda.coleccion_id,
          prenda.descripcion,
          prenda.fecha_creacion,
          true, // ✅ Always activate in Phase 2
          stockInicial, // ✅ Default to 10 if Phase 1 had 0
          0 // stock_vendido starts at 0
          // stock_disponible will be auto-calculated by generated column
        ]
      );
    }
    stats['prendas'] = prendas.rows.length;
    console.log(
      `   ✅ ${prendas.rows.length} registros migrados (todas activas)`
    );
    if (generatedNames > 0) {
      console.log(
        `   🔧 ${generatedNames} nombres generados automáticamente (NULL en Fase 1)`
      );
    }
    if (normalizedTipos > 0) {
      console.log(`   📝 ${normalizedTipos} tipos normalizados a Title Case`);
    }
    console.log(`   📦 Stock inicial: Fase 1 si >0, sino default=10 unidades`);
    console.log(
      `   📊 stock_disponible calculado automáticamente (generated column)`
    );

    await clientFase2.query(
      `SELECT setval('prendas_id_seq', (SELECT MAX(id) FROM prendas))`
    );

    // Commit transaction
    await clientFase2.query('COMMIT');

    logSuccess(
      '04_migrar_datos_fase1.js',
      'Migración completada exitosamente',
      stats
    );

    console.log('\n📋 Verificación:');
    console.log('   • Todas las relaciones preservadas');
    console.log('   • Sequences actualizadas correctamente');
    console.log('   • Stock inicial configurado para Fase 2');
    console.log('   • Listo para inicializar telas_temporadas\n');
  } catch (error) {
    await clientFase2.query('ROLLBACK');
    logError('04_migrar_datos_fase1.js', 'Migración de Datos', error);
    throw error;
  } finally {
    clientFase1.release();
    clientFase2.release();
    await poolFase1.end();
    await poolFase2.end();
  }
}

// Execute script
migrarDatos()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
