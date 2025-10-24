// =====================================================
// Script: Migrar Prendas - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Migra prendas con FKs a diseños, telas y colecciones
// =====================================================

const { pool, fase0Pool } = require('./00_db');

async function migrarPrendas() {
  try {
    console.log('🚚 Migrando prendas desde chamana_db_fase0...\n');

    // Obtener todas las prendas de Fase 0
    const prendasResult = await fase0Pool.query(
      'SELECT * FROM prendas ORDER BY id'
    );

    // Obtener colecciones de 2025
    const veranoResult = await pool.query(
      "SELECT id FROM colecciones WHERE nombre = 'Verano 2025'"
    );
    const inviernoResult = await pool.query(
      "SELECT id FROM colecciones WHERE nombre = 'Invierno 2025'"
    );

    const veranoId = veranoResult.rows[0]?.id;
    const inviernoId = inviernoResult.rows[0]?.id;

    if (!veranoId || !inviernoId) {
      throw new Error(
        'No se encontraron las colecciones de 2025. Ejecuta primero 03_insertar_estaticos.js'
      );
    }

    console.log('👗 Procesando prendas...');
    let prendasMigradas = 0;

    for (const prenda of prendasResult.rows) {
      // 1. Extraer nombre del diseño
      let nombreCompleto = prenda.nombre_completo;
      let tipoPrenda = prenda.tipo;
      let tipoTela = prenda.tela_nombre;

      // Remover tipo_prenda del inicio
      if (nombreCompleto.startsWith(tipoPrenda)) {
        nombreCompleto = nombreCompleto.slice(tipoPrenda.length).trim();
      }

      // Remover tipo_tela del final
      if (tipoTela && nombreCompleto.endsWith(tipoTela)) {
        nombreCompleto = nombreCompleto.slice(0, -tipoTela.length).trim();
      }

      const nombreDiseno = nombreCompleto;

      // 2. Buscar ID del diseño
      const disenoResult = await pool.query(
        'SELECT id FROM disenos WHERE nombre = $1',
        [nombreDiseno]
      );

      if (disenoResult.rows.length === 0) {
        console.log(`   ⚠️  No se encontró diseño para: ${nombreDiseno}`);
        continue;
      }

      const disenoId = disenoResult.rows[0].id;

      // 3. Buscar ID de la tela
      const telaResult = await pool.query(
        'SELECT id FROM telas WHERE nombre = $1',
        [tipoTela]
      );

      if (telaResult.rows.length === 0) {
        console.log(`   ⚠️  No se encontró tela para: ${tipoTela}`);
        continue;
      }

      const telaId = telaResult.rows[0].id;

      // 4. Asignar colección (alternando entre verano e invierno basado en ID)
      const coleccionId = prenda.id % 2 === 0 ? inviernoId : veranoId;

      // 5. Insertar prenda con FKs
      await pool.query(
        `INSERT INTO prendas 
         (id, categoria_id, diseno_id, tela_id, coleccion_id, nombre_completo, tipo_prenda, precio_chamana, precio_arro, stock_disponible, fecha_creacion, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          prenda.id,
          prenda.categoria_id,
          disenoId,
          telaId,
          coleccionId,
          prenda.nombre_completo,
          prenda.tipo,
          prenda.precio_chamana,
          prenda.precio_arro,
          prenda.stock,
          prenda.fecha_creacion,
          prenda.activa
        ]
      );

      prendasMigradas++;
    }

    console.log(`   ✅ ${prendasMigradas} prendas migradas exitosamente`);

    // Verificación con JOIN
    console.log('\n📊 Verificando migración con JOINs:');

    const verificationQuery = `
      SELECT 
        p.id,
        p.nombre_completo,
        p.tipo_prenda,
        d.nombre as diseno,
        t.nombre as tela,
        c.nombre as coleccion,
        p.precio_chamana
      FROM prendas p
      JOIN disenos d ON p.diseno_id = d.id
      JOIN telas t ON p.tela_id = t.id
      JOIN colecciones c ON p.coleccion_id = c.id
      ORDER BY p.id
      LIMIT 5
    `;

    const verificacion = await pool.query(verificationQuery);

    console.log('\n📋 Primeras 5 prendas migradas:');
    verificacion.rows.forEach((p) => {
      console.log(`   ${p.id}. ${p.nombre_completo}`);
      console.log(
        `      Diseño: ${p.diseno} | Tela: ${p.tela} | Colección: ${p.coleccion}`
      );
      console.log(`      Precio: $${p.precio_chamana}\n`);
    });

    // Conteo por colección
    const coleccionStats = await pool.query(`
      SELECT c.nombre, COUNT(p.id) as total_prendas
      FROM colecciones c
      LEFT JOIN prendas p ON c.id = p.coleccion_id
      WHERE c.nombre LIKE '%2025%'
      GROUP BY c.nombre
      ORDER BY c.nombre
    `);

    console.log('📊 Distribución por colección 2025:');
    coleccionStats.rows.forEach((stat) => {
      console.log(`   - ${stat.nombre}: ${stat.total_prendas} prendas`);
    });

    console.log('\n✅ Prendas migradas exitosamente!\n');
    console.log('📍 Siguiente paso: Ejecuta 07_verificar.js\n');
  } catch (error) {
    console.error('❌ Error al migrar prendas:', error.message);
    console.error(error);
    throw error;
  } finally {
    await pool.end();
    await fase0Pool.end();
  }
}

// Ejecutar
migrarPrendas();
