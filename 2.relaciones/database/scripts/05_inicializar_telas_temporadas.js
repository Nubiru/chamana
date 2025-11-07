/**
 * Script 05: Inicializar Telas Temporadas
 * 
 * Assigns all fabrics to 2025 seasons based on fabric type logic:
 * - Natural fabrics (Algodón, Lino, Seda, Lana) → Both seasons
 * - Synthetic/Warm fabrics (Plush, Jersey, Polar) → Winter primarily
 * - Light synthetic (Poly

éster, Rayón, Nylon) → Summer primarily
 * 
 * This creates the initial telas_temporadas records to support seasonal queries.
 * 
 * If this script fails:
 * 1. Verify telas table has data: SELECT COUNT(*) FROM telas;
 * 2. Check años/temporadas exist: SELECT * FROM años; SELECT * FROM temporadas;
 * 3. Manual cleanup: TRUNCATE telas_temporadas;
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function inicializarTelasTemporadas() {
  const pool = createPool('fase2');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Iniciando inicialización de telas por temporada...\n');

    // Get all fabrics
    const telasResult = await client.query('SELECT id, nombre, tipo FROM telas ORDER BY id');
    const telas = telasResult.rows;

    // Get 2025 year ID
    const añoResult = await client.query(`SELECT id FROM años WHERE año = 2025`);
    if (añoResult.rows.length === 0) {
      throw new Error('Año 2025 no encontrado. Asegúrese de que los datos estén migrados.');
    }
    const año2025Id = añoResult.rows[0].id;

    // Get season IDs
    const veranoResult = await client.query(`SELECT id FROM temporadas WHERE nombre = 'Verano'`);
    const inviernoResult = await client.query(
      `SELECT id FROM temporadas WHERE nombre = 'Invierno'`
    );

    if (veranoResult.rows.length === 0 || inviernoResult.rows.length === 0) {
      throw new Error('Temporadas no encontradas. Asegúrese de que los datos estén migrados.');
    }

    const veranoId = veranoResult.rows[0].id;
    const inviernoId = inviernoResult.rows[0].id;

    console.log(`📊 Configuración:`);
    console.log(`   • Año: 2025 (ID: ${año2025Id})`);
    console.log(`   • Verano ID: ${veranoId}`);
    console.log(`   • Invierno ID: ${inviernoId}`);
    console.log(`   • Total telas: ${telas.length}\n`);

    // Fabric assignment logic
    const naturalFabrics = ['Algodón', 'Lino', 'Seda', 'Lana', 'Cashmere'];
    const winterFabrics = ['Plush', 'Jersey', 'Polar', 'Felpa', 'Terciopelo'];
    const summerFabrics = ['Poliéster', 'Rayón', 'Nylon', 'Lycra'];

    let veranoCount = 0;
    let inviernoCount = 0;
    let ambosCount = 0;

    for (const tela of telas) {
      const nombre = tela.nombre;
      let assignedSeasons = [];

      // Determine which seasons this fabric belongs to
      if (naturalFabrics.some((nat) => nombre.includes(nat))) {
        // Natural fabrics → both seasons
        assignedSeasons = [veranoId, inviernoId];
        ambosCount++;
        console.log(`   🌿 ${nombre} (Natural) → Ambas temporadas`);
      } else if (winterFabrics.some((winter) => nombre.includes(winter))) {
        // Winter fabrics → winter only
        assignedSeasons = [inviernoId];
        inviernoCount++;
        console.log(`   ❄️  ${nombre} (Invierno) → Invierno`);
      } else if (summerFabrics.some((summer) => nombre.includes(summer))) {
        // Summer fabrics → summer only
        assignedSeasons = [veranoId];
        veranoCount++;
        console.log(`   ☀️  ${nombre} (Verano) → Verano`);
      } else {
        // Default: assign to both (safe fallback)
        assignedSeasons = [veranoId, inviernoId];
        ambosCount++;
        console.log(`   🔄 ${nombre} (Default) → Ambas temporadas`);
      }

      // Insert records for assigned seasons
      for (const temporadaId of assignedSeasons) {
        await executeQuery(
          client,
          `
          INSERT INTO telas_temporadas (tela_id, temporada_id, año_id, activo)
          VALUES ($1, $2, $3, $4)
        `,
          [tela.id, temporadaId, año2025Id, true]
        );
      }
    }

    await client.query('COMMIT');

    const totalRegistros = veranoCount + inviernoCount + ambosCount * 2;

    logSuccess(
      '05_inicializar_telas_temporadas.js',
      'Telas temporadas inicializadas exitosamente',
      {
        'Telas procesadas': telas.length,
        'Solo Verano': veranoCount,
        'Solo Invierno': inviernoCount,
        'Ambas temporadas': ambosCount,
        'Total registros creados': totalRegistros,
      }
    );

    console.log('\n📋 Resumen de asignación:');
    console.log('   • Telas naturales: Disponibles todo el año');
    console.log('   • Telas de invierno: Solo temporada Invierno 2025');
    console.log('   • Telas de verano: Solo temporada Verano 2025');
    console.log('   • Todas marcadas como activo=true\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('05_inicializar_telas_temporadas.js', 'Inicialización de Telas Temporadas', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
inicializarTelasTemporadas()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
