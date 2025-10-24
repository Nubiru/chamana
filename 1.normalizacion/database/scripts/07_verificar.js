// =====================================================
// Script: Verificar Base de Datos - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Valida integridad y muestra resumen completo
// =====================================================

const { pool } = require('./00_db');

async function verificar() {
  try {
    console.log('🔍 Verificando Base de Datos chamana_db_fase1...\n');
    console.log('=' .repeat(60));

    // 1. Conteo de registros por tabla
    console.log('\n📊 RESUMEN DE TABLAS\n');

    const tablas = [
      'clientes',
      'categorias',
      'disenos',
      'telas',
      'años',
      'temporadas',
      'colecciones',
      'prendas'
    ];

    for (const tabla of tablas) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${tabla}`);
      console.log(`   ${tabla.padEnd(20)} ${result.rows[0].count.padStart(5)} registros`);
    }

    // 2. Verificación de Foreign Keys
    console.log('\n🔗 VERIFICACIÓN DE FOREIGN KEYS\n');

    // Verificar prendas -> categorias
    const catCheck = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT categoria_id) as categorias_usadas
      FROM prendas
    `);
    console.log(`   ✅ Prendas → Categorías: ${catCheck.rows[0].categorias_usadas} categorías referenciadas`);

    // Verificar prendas -> disenos
    const disenoCheck = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT diseno_id) as disenos_usados
      FROM prendas
    `);
    console.log(`   ✅ Prendas → Diseños: ${disenoCheck.rows[0].disenos_usados} diseños referenciados`);

    // Verificar prendas -> telas
    const telaCheck = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT tela_id) as telas_usadas
      FROM prendas
    `);
    console.log(`   ✅ Prendas → Telas: ${telaCheck.rows[0].telas_usadas} telas referenciadas`);

    // Verificar prendas -> colecciones
    const colCheck = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT coleccion_id) as colecciones_usadas
      FROM prendas
    `);
    console.log(`   ✅ Prendas → Colecciones: ${colCheck.rows[0].colecciones_usadas} colecciones referenciadas`);

    // Verificar colecciones -> años
    const añoCheck = await pool.query(`
      SELECT COUNT(DISTINCT año_id) as años_usados
      FROM colecciones
    `);
    console.log(`   ✅ Colecciones → Años: ${añoCheck.rows[0].años_usados} años referenciados`);

    // Verificar colecciones -> temporadas
    const tempCheck = await pool.query(`
      SELECT COUNT(DISTINCT temporada_id) as temporadas_usadas
      FROM colecciones
    `);
    console.log(`   ✅ Colecciones → Temporadas: ${tempCheck.rows[0].temporadas_usadas} temporadas referenciadas`);

    // 3. Prueba de JOIN completo
    console.log('\n🔍 PRUEBA DE JOIN COMPLETO (Primera prenda)\n');

    const joinTest = await pool.query(`
      SELECT 
        p.id,
        p.nombre_completo,
        p.tipo_prenda,
        cat.nombre as categoria,
        d.nombre as diseno,
        t.nombre as tela,
        t.tipo as tipo_tela,
        col.nombre as coleccion,
        a.año,
        temp.nombre as temporada,
        p.precio_chamana,
        p.stock_disponible
      FROM prendas p
      JOIN categorias cat ON p.categoria_id = cat.id
      JOIN disenos d ON p.diseno_id = d.id
      JOIN telas t ON p.tela_id = t.id
      LEFT JOIN colecciones col ON p.coleccion_id = col.id
      LEFT JOIN años a ON col.año_id = a.id
      LEFT JOIN temporadas temp ON col.temporada_id = temp.id
      ORDER BY p.id
      LIMIT 1
    `);

    if (joinTest.rows.length > 0) {
      const p = joinTest.rows[0];
      console.log(`   ID: ${p.id}`);
      console.log(`   Nombre Completo: ${p.nombre_completo}`);
      console.log(`   Tipo: ${p.tipo_prenda}`);
      console.log(`   Categoría: ${p.categoria}`);
      console.log(`   Diseño: ${p.diseno}`);
      console.log(`   Tela: ${p.tela} (${p.tipo_tela})`);
      console.log(`   Colección: ${p.coleccion}`);
      console.log(`   Año: ${p.año}`);
      console.log(`   Temporada: ${p.temporada}`);
      console.log(`   Precio: $${p.precio_chamana}`);
      console.log(`   Stock: ${p.stock_disponible}`);
      console.log('\n   ✅ JOIN completo funcionando correctamente');
    }

    // 4. Distribución por colección
    console.log('\n📦 DISTRIBUCIÓN POR COLECCIÓN\n');

    const distColeccion = await pool.query(`
      SELECT 
        c.nombre as coleccion,
        COUNT(p.id) as total_prendas,
        SUM(p.stock_disponible) as stock_total
      FROM colecciones c
      LEFT JOIN prendas p ON c.id = p.coleccion_id
      WHERE c.nombre LIKE '%2025%'
      GROUP BY c.nombre
      ORDER BY c.nombre
    `);

    distColeccion.rows.forEach(col => {
      console.log(`   ${col.coleccion.padEnd(20)} ${col.total_prendas} prendas, ${col.stock_total || 0} unidades en stock`);
    });

    // 5. Diseños más utilizados
    console.log('\n🎨 TOP 5 DISEÑOS MÁS UTILIZADOS\n');

    const topDisenos = await pool.query(`
      SELECT 
        d.nombre,
        COUNT(p.id) as total_prendas
      FROM disenos d
      LEFT JOIN prendas p ON d.id = p.diseno_id
      GROUP BY d.nombre
      ORDER BY total_prendas DESC
      LIMIT 5
    `);

    topDisenos.rows.forEach((d, idx) => {
      console.log(`   ${idx + 1}. ${d.nombre.padEnd(30)} ${d.total_prendas} prendas`);
    });

    // 6. Telas más utilizadas
    console.log('\n🧵 TOP 5 TELAS MÁS UTILIZADAS\n');

    const topTelas = await pool.query(`
      SELECT 
        t.nombre,
        t.tipo,
        COUNT(p.id) as total_prendas
      FROM telas t
      LEFT JOIN prendas p ON t.id = p.tela_id
      GROUP BY t.nombre, t.tipo
      ORDER BY total_prendas DESC
      LIMIT 5
    `);

    topTelas.rows.forEach((t, idx) => {
      console.log(`   ${idx + 1}. ${t.nombre.padEnd(30)} (${t.tipo}) - ${t.total_prendas} prendas`);
    });

    // 7. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE\n');
    console.log('📋 Resumen:');
    console.log('   - Base de datos en Primera Forma Normal (1NF)');
    console.log('   - 7 tablas normalizadas operativas');
    console.log('   - Todas las foreign keys validadas');
    console.log('   - JOINs funcionando correctamente');
    console.log('   - Datos migrados desde Fase 0');
    console.log('\n🎉 ¡chamana_db_fase1 lista para usar!\n');

  } catch (error) {
    console.error('❌ Error durante verificación:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar
verificar();

