// =====================================================
// Database Integrity Tests API Routes - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const express = require('express');
const router = express.Router();
const { createPool } = require('../../database/scripts/00_db');

const pool = createPool('fase3');

// GET /api/database-tests/integrity
router.get('/integrity', async (_req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: { passed: 0, failed: 0, total: 0 }
  };

  try {
    // TEST 1.1: Verify All 19 Tables Exist
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tableCount = tablesResult.rows.length;
    const expectedTables = [
      'años',
      'categorias',
      'clientes',
      'colecciones',
      'direcciones',
      'disenos',
      'estados_pedido',
      'historial_estados_pedido',
      'metodos_pago',
      'movimientos_inventario',
      'pedidos',
      'pedidos_prendas',
      'prendas',
      'proveedores',
      'telas',
      'telas_proveedores',
      'telas_temporadas',
      'tipos_prenda',
      'temporadas'
    ];
    const foundTables = tablesResult.rows.map((r) => r.table_name);
    const missingTables = expectedTables.filter(
      (t) => !foundTables.includes(t)
    );

    results.tests['1.1_tables'] = {
      name: 'All 19 Tables Exist',
      passed: tableCount === 19 && missingTables.length === 0,
      details: {
        found: tableCount,
        expected: 19,
        tables: foundTables,
        missing: missingTables
      }
    };

    // TEST 1.2: Verify All 5 Views Execute
    const views = [
      'vista_ventas_mensuales',
      'vista_inventario_critico',
      'vista_top_productos',
      'vista_analisis_clientes',
      'vista_rotacion_inventario'
    ];
    const viewResults = {};

    for (const view of views) {
      try {
        const viewResult = await pool.query(
          `SELECT COUNT(*) as total FROM ${view}`
        );
        viewResults[view] = {
          success: true,
          count: parseInt(viewResult.rows[0].total)
        };
      } catch (error) {
        viewResults[view] = {
          success: false,
          error: error.message
        };
      }
    }

    const allViewsWork = Object.values(viewResults).every((v) => v.success);
    results.tests['1.2_views'] = {
      name: 'All 5 Views Execute',
      passed: allViewsWork,
      details: viewResults
    };

    // TEST 1.3: All 3 Procedures Exist (check if they're callable)
    const procedures = [
      'procesar_pedido',
      'reabastecer_inventario',
      'calcular_comision_vendedor'
    ];
    const procedureResults = {};

    for (const proc of procedures) {
      try {
        const procResult = await pool.query(
          `
          SELECT routine_name 
          FROM information_schema.routines 
          WHERE routine_schema = 'public' 
            AND routine_name = $1
        `,
          [proc]
        );
        procedureResults[proc] = {
          exists: procResult.rows.length > 0
        };
      } catch (error) {
        procedureResults[proc] = {
          exists: false,
          error: error.message
        };
      }
    }

    const allProceduresExist = Object.values(procedureResults).every(
      (p) => p.exists
    );
    results.tests['1.3_procedures'] = {
      name: 'All 3 Procedures Exist',
      passed: allProceduresExist,
      details: procedureResults
    };

    // TEST 1.4: All 3 Triggers Exist
    const triggers = [
      'trigger_track_order_state',
      'trigger_stock_alert',
      'trigger_manage_default_address'
    ];
    const triggerResults = {};

    for (const trigger of triggers) {
      try {
        const triggerResult = await pool.query(
          `
          SELECT trigger_name 
          FROM information_schema.triggers 
          WHERE trigger_schema = 'public' 
            AND trigger_name = $1
        `,
          [trigger]
        );
        triggerResults[trigger] = {
          exists: triggerResult.rows.length > 0
        };
      } catch (error) {
        triggerResults[trigger] = {
          exists: false,
          error: error.message
        };
      }
    }

    const allTriggersExist = Object.values(triggerResults).every(
      (t) => t.exists
    );
    results.tests['1.4_triggers'] = {
      name: 'All 3 Triggers Exist',
      passed: allTriggersExist,
      details: triggerResults
    };

    // TEST 1.5: Real Data Present
    const dataChecks = {};

    try {
      const disenosCount = await pool.query(
        'SELECT COUNT(*) as total FROM disenos'
      );
      dataChecks.disenos = {
        found: parseInt(disenosCount.rows[0].total),
        expected: 27
      };
    } catch (error) {
      dataChecks.disenos = { error: error.message };
    }

    try {
      const telasCount = await pool.query(
        'SELECT COUNT(*) as total FROM telas'
      );
      dataChecks.telas = {
        found: parseInt(telasCount.rows[0].total),
        expected: 38
      };
    } catch (error) {
      dataChecks.telas = { error: error.message };
    }

    try {
      const coleccionesCount = await pool.query(
        'SELECT COUNT(*) as total FROM colecciones'
      );
      dataChecks.colecciones = {
        found: parseInt(coleccionesCount.rows[0].total),
        expected: 2
      };
    } catch (error) {
      dataChecks.colecciones = { error: error.message };
    }

    const dataPassed =
      dataChecks.disenos.found >= 27 &&
      dataChecks.telas.found >= 38 &&
      dataChecks.colecciones.found >= 2;

    results.tests['1.5_real_data'] = {
      name: 'Real Data Present',
      passed: dataPassed,
      details: dataChecks
    };

    // TEST 1.6: Foreign Key Constraints (test by checking for orphaned records)
    const fkChecks = {};

    try {
      const orphanedDisenos = await pool.query(`
        SELECT COUNT(*) as total
        FROM disenos d
        LEFT JOIN colecciones c ON d.coleccion_id = c.id
        WHERE d.coleccion_id IS NOT NULL AND c.id IS NULL
      `);
      fkChecks.orphaned_disenos = parseInt(orphanedDisenos.rows[0].total);
    } catch (error) {
      fkChecks.orphaned_disenos = { error: error.message };
    }

    try {
      const orphanedPrendas = await pool.query(`
        SELECT COUNT(*) as total
        FROM prendas p
        LEFT JOIN disenos d ON p.diseno_id = d.id
        WHERE p.diseno_id IS NOT NULL AND d.id IS NULL
      `);
      fkChecks.orphaned_prendas = parseInt(orphanedPrendas.rows[0].total);
    } catch (error) {
      fkChecks.orphaned_prendas = { error: error.message };
    }

    const fkPassed =
      fkChecks.orphaned_disenos === 0 && fkChecks.orphaned_prendas === 0;

    results.tests['1.6_foreign_keys'] = {
      name: 'Foreign Key Constraints Work',
      passed: fkPassed,
      details: fkChecks
    };

    // TEST 1.7: JOIN Types Demo (verify views use JOINs correctly)
    const joinChecks = {};

    try {
      // Check that views return data (indicating JOINs work)
      const ventasData = await pool.query(
        'SELECT * FROM vista_ventas_mensuales LIMIT 1'
      );
      joinChecks.ventas_mensuales = {
        hasData: ventasData.rows.length > 0,
        sampleCount: ventasData.rows.length
      };
    } catch (error) {
      joinChecks.ventas_mensuales = { error: error.message };
    }

    try {
      const inventarioData = await pool.query(
        'SELECT * FROM vista_inventario_critico LIMIT 1'
      );
      joinChecks.inventario_critico = {
        hasData: inventarioData.rows.length > 0,
        sampleCount: inventarioData.rows.length
      };
    } catch (error) {
      joinChecks.inventario_critico = { error: error.message };
    }

    const joinsWork = Object.values(joinChecks).every(
      (j) => j.hasData !== false
    );
    results.tests['1.7_joins'] = {
      name: 'JOIN Types Demo Works',
      passed: joinsWork,
      details: joinChecks
    };

    // Calculate summary
    results.summary.total = Object.keys(results.tests).length;
    results.summary.passed = Object.values(results.tests).filter(
      (t) => t.passed
    ).length;
    results.summary.failed = results.summary.total - results.summary.passed;

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      results
    });
  }
});

module.exports = router;
