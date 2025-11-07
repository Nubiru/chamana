/**
 * Script 09: Verificar Implementación - Phase 3
 *
 * Verifies that Phase 3 implementation is complete:
 * - All 19 tables exist
 * - 5 views created
 * - 3 stored procedures exist
 * - 3 triggers active
 * - Data migration successful
 * - Sample queries work
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function verificar() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando implementación de Fase 3...\n');

    const resultados = {
      tablas: { esperadas: 19, encontradas: 0, detalles: [] },
      vistas: { esperadas: 5, encontradas: 0, detalles: [] },
      procedimientos: { esperadas: 3, encontradas: 0, detalles: [] },
      triggers: { esperadas: 3, encontradas: 0, detalles: [] },
      datos: { migrados: false, detalles: {} },
    };

    // ===================================================================
    // Verificar Tablas
    // ===================================================================

    console.log('📊 Verificando tablas...');
    const tablas = await executeQuery(
      client,
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    );

    resultados.tablas.encontradas = tablas.rows.length;
    resultados.tablas.detalles = tablas.rows.map((r) => r.table_name);

    console.log(
      `   ✅ ${resultados.tablas.encontradas}/${resultados.tablas.esperadas} tablas encontradas`
    );

    // Verificar tablas específicas 3NF
    const tablas3NF = [
      'direcciones',
      'tipos_prenda',
      'estados_pedido',
      'historial_estados_pedido',
      'proveedores',
      'telas_proveedores',
      'metodos_pago',
    ];
    const tablasEncontradas = tablas.rows.map((r) => r.table_name);
    const faltantes = tablas3NF.filter((t) => !tablasEncontradas.includes(t));

    if (faltantes.length > 0) {
      console.log(`   ⚠️  Tablas 3NF faltantes: ${faltantes.join(', ')}`);
    } else {
      console.log('   ✅ Todas las tablas 3NF presentes');
    }

    // ===================================================================
    // Verificar Vistas
    // ===================================================================

    console.log('\n📊 Verificando vistas...');
    const vistas = await executeQuery(
      client,
      `
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
        AND table_name LIKE 'vista_%'
      ORDER BY table_name
    `
    );

    resultados.vistas.encontradas = vistas.rows.length;
    resultados.vistas.detalles = vistas.rows.map((r) => r.table_name);

    console.log(
      `   ✅ ${resultados.vistas.encontradas}/${resultados.vistas.esperadas} vistas encontradas`
    );
    for (const v of vistas.rows) {
      console.log(`      - ${v.table_name}`);
    }

    // ===================================================================
    // Verificar Procedimientos
    // ===================================================================

    console.log('\n📊 Verificando procedimientos almacenados...');
    const procedimientos = await executeQuery(
      client,
      `
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        AND routine_name IN ('procesar_pedido', 'reabastecer_inventario', 'calcular_comision_vendedor')
      ORDER BY routine_name
    `
    );

    resultados.procedimientos.encontradas = procedimientos.rows.length;
    resultados.procedimientos.detalles = procedimientos.rows.map((r) => r.routine_name);

    console.log(
      `   ✅ ${resultados.procedimientos.encontradas}/${resultados.procedimientos.esperadas} procedimientos encontrados`
    );
    for (const p of procedimientos.rows) {
      console.log(`      - ${p.routine_name}`);
    }

    // ===================================================================
    // Verificar Triggers
    // ===================================================================

    console.log('\n📊 Verificando triggers...');
    const triggers = await executeQuery(
      client,
      `
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND trigger_name LIKE 'trigger_%'
      ORDER BY trigger_name
    `
    );

    resultados.triggers.encontradas = triggers.rows.length;
    resultados.triggers.detalles = triggers.rows.map(
      (r) => `${r.trigger_name} (${r.event_object_table})`
    );

    console.log(
      `   ✅ ${resultados.triggers.encontradas}/${resultados.triggers.esperadas} triggers encontrados`
    );
    for (const t of triggers.rows) {
      console.log(`      - ${t.trigger_name} en ${t.event_object_table}`);
    }

    // ===================================================================
    // Verificar Datos
    // ===================================================================

    console.log('\n📊 Verificando datos migrados...');

    const conteos = await executeQuery(
      client,
      `
      SELECT 
        (SELECT COUNT(*) FROM clientes) as clientes,
        (SELECT COUNT(*) FROM prendas) as prendas,
        (SELECT COUNT(*) FROM pedidos) as pedidos,
        (SELECT COUNT(*) FROM direcciones) as direcciones,
        (SELECT COUNT(*) FROM estados_pedido) as estados_pedido,
        (SELECT COUNT(*) FROM tipos_prenda) as tipos_prenda,
        (SELECT COUNT(*) FROM proveedores) as proveedores,
        (SELECT COUNT(*) FROM metodos_pago) as metodos_pago
    `
    );

    resultados.datos.detalles = conteos.rows[0];
    resultados.datos.migrados = conteos.rows[0].clientes > 0 && conteos.rows[0].prendas > 0;

    console.log('   📋 Conteos de registros:');
    Object.entries(conteos.rows[0]).forEach(([key, value]) => {
      console.log(`      - ${key}: ${value}`);
    });

    // ===================================================================
    // Probar Vistas
    // ===================================================================

    console.log('\n📊 Probando vistas...');

    try {
      const testVista = await executeQuery(
        client,
        'SELECT COUNT(*) as total FROM vista_ventas_mensuales'
      );
      console.log(`   ✅ vista_ventas_mensuales funciona (${testVista.rows[0].total} registros)`);
    } catch (error) {
      console.log(`   ❌ Error en vista_ventas_mensuales: ${error.message}`);
    }

    try {
      const testInventario = await executeQuery(
        client,
        'SELECT COUNT(*) as total FROM vista_inventario_critico'
      );
      console.log(
        `   ✅ vista_inventario_critico funciona (${testInventario.rows[0].total} registros)`
      );
    } catch (error) {
      console.log(`   ❌ Error en vista_inventario_critico: ${error.message}`);
    }

    // ===================================================================
    // Resumen Final
    // ===================================================================

    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60));

    const todoCorrecto =
      resultados.tablas.encontradas === resultados.tablas.esperadas &&
      resultados.vistas.encontradas === resultados.vistas.esperadas &&
      resultados.procedimientos.encontradas === resultados.procedimientos.esperadas &&
      resultados.triggers.encontradas === resultados.triggers.esperadas &&
      resultados.datos.migrados;

    if (todoCorrecto) {
      logSuccess('09_verificar.js', '✅ Verificación completada - Todo correcto', {
        Tablas: `${resultados.tablas.encontradas}/${resultados.tablas.esperadas}`,
        Vistas: `${resultados.vistas.encontradas}/${resultados.vistas.esperadas}`,
        Procedimientos: `${resultados.procedimientos.encontradas}/${resultados.procedimientos.esperadas}`,
        Triggers: `${resultados.triggers.encontradas}/${resultados.triggers.esperadas}`,
        'Datos migrados': resultados.datos.migrados ? 'Sí' : 'No',
      });

      console.log('\n🎉 Fase 3 implementada correctamente!');
      console.log('   • 3NF normalization completa');
      console.log('   • Vistas de BI funcionando');
      console.log('   • Procedimientos almacenados listos');
      console.log('   • Triggers activos');
      console.log('   • Datos migrados exitosamente\n');
    } else {
      console.log('\n⚠️  Verificación completada con advertencias:');
      if (resultados.tablas.encontradas !== resultados.tablas.esperadas) {
        console.log(`   • Tablas: ${resultados.tablas.encontradas}/${resultados.tablas.esperadas}`);
      }
      if (resultados.vistas.encontradas !== resultados.vistas.esperadas) {
        console.log(`   • Vistas: ${resultados.vistas.encontradas}/${resultados.vistas.esperadas}`);
      }
      if (resultados.procedimientos.encontradas !== resultados.procedimientos.esperadas) {
        console.log(
          `   • Procedimientos: ${resultados.procedimientos.encontradas}/${resultados.procedimientos.esperadas}`
        );
      }
      if (resultados.triggers.encontradas !== resultados.triggers.esperadas) {
        console.log(
          `   • Triggers: ${resultados.triggers.encontradas}/${resultados.triggers.esperadas}`
        );
      }
      if (!resultados.datos.migrados) {
        console.log('   • Datos no migrados completamente');
      }
      console.log('');
    }
  } catch (error) {
    logError('09_verificar.js', 'Verificación', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
verificar()
  .then(() => {
    console.log('🎉 Verificación completada\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Verificación falló\n');
    process.exit(1);
  });
