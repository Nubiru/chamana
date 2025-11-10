/**
 * Script 13: Create Materialized Views - Phase 4 (Optimization)
 *
 * Creates materialized views for heavy reports that don't need real-time data.
 * Materialized views store pre-computed results and can be refreshed periodically.
 *
 * Use Cases:
 * - Monthly sales reports (refresh daily)
 * - Customer segmentation (refresh weekly)
 * - Inventory analysis (refresh hourly)
 *
 * Refresh Strategy:
 * - Manual refresh: REFRESH MATERIALIZED VIEW view_name;
 * - Scheduled refresh: Use pg_cron extension or cron job
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function createMaterializedViews() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando vistas materializadas para reportes pesados...\n');

    // ===================================================================
    // MATERIALIZED VIEW 1: Monthly Sales Summary
    // Refresh: Daily (or on-demand)
    // ===================================================================

    console.log('📊 Creando mv_ventas_mensuales_resumen...');
    await executeQuery(
      client,
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ventas_mensuales_resumen AS
      SELECT
        DATE_TRUNC('month', p.fecha_pedido) as mes,
        COUNT(DISTINCT p.id) as total_pedidos,
        COUNT(DISTINCT p.cliente_id) as clientes_unicos,
        SUM(pp.cantidad) as prendas_vendidas,
        SUM(p.subtotal) as subtotal_mes,
        SUM(p.descuento) as descuentos_mes,
        SUM(p.total) as total_mes,
        ROUND(AVG(p.total), 2) as ticket_promedio,
        ROUND(SUM(p.total) / NULLIF(COUNT(DISTINCT p.id), 0), 2) as venta_promedio_pedido,
        MAX(p.fecha_pedido) as ultima_venta_mes,
        CURRENT_TIMESTAMP as fecha_actualizacion
      FROM pedidos p
      INNER JOIN pedidos_prendas pp ON p.id = pp.pedido_id
      WHERE p.estado = 'completado'
        AND p.fecha_pedido IS NOT NULL
      GROUP BY DATE_TRUNC('month', p.fecha_pedido)
      ORDER BY mes DESC
    `
    );

    // Create index on materialized view for fast lookups
    await executeQuery(
      client,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_ventas_mensuales_mes 
       ON mv_ventas_mensuales_resumen(mes)`
    );

    await executeQuery(
      client,
      "COMMENT ON MATERIALIZED VIEW mv_ventas_mensuales_resumen IS 'Resumen mensual de ventas - Refrescar diariamente'"
    );
    console.log('   ✅ mv_ventas_mensuales_resumen creada');

    // ===================================================================
    // MATERIALIZED VIEW 2: Top Products Summary
    // Refresh: Daily (or on-demand)
    // ===================================================================

    console.log('\n📊 Creando mv_top_productos_resumen...');
    await executeQuery(
      client,
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_productos_resumen AS
      SELECT
        p.id,
        p.nombre,
        p.precio_chamana,
        COUNT(pp.id) as veces_vendido,
        SUM(pp.cantidad) as unidades_vendidas,
        SUM(pp.subtotal) as ingresos_generados,
        ROUND(AVG(pp.precio_unitario), 2) as precio_promedio_venta,
        p.stock_disponible as stock_actual,
        ROUND((SUM(pp.subtotal) / NULLIF(SUM(pp.cantidad), 0)), 2) as precio_unitario_promedio,
        c.nombre as categoria,
        MAX(ped.fecha_pedido) as ultima_venta,
        CURRENT_TIMESTAMP as fecha_actualizacion
      FROM prendas p
      INNER JOIN pedidos_prendas pp ON p.id = pp.prenda_id
      INNER JOIN pedidos ped ON pp.pedido_id = ped.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE ped.estado = 'completado'
      GROUP BY p.id, p.nombre, p.precio_chamana, p.stock_disponible, c.nombre
      HAVING SUM(pp.subtotal) > 0
      ORDER BY ingresos_generados DESC
    `
    );

    // Create index on materialized view
    await executeQuery(
      client,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_productos_id 
       ON mv_top_productos_resumen(id)`
    );

    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_mv_top_productos_ingresos 
       ON mv_top_productos_resumen(ingresos_generados DESC)`
    );

    await executeQuery(
      client,
      "COMMENT ON MATERIALIZED VIEW mv_top_productos_resumen IS 'Resumen de productos más vendidos - Refrescar diariamente'"
    );
    console.log('   ✅ mv_top_productos_resumen creada');

    // ===================================================================
    // MATERIALIZED VIEW 3: Customer Segmentation Summary
    // Refresh: Weekly (or on-demand)
    // ===================================================================

    console.log('\n📊 Creando mv_segmentacion_clientes_resumen...');
    await executeQuery(
      client,
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_segmentacion_clientes_resumen AS
      SELECT
        c.id,
        c.nombre || ' ' || c.apellido as nombre_completo,
        c.email,
        c.telefono,
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(p.total), 0) as total_gastado,
        ROUND(COALESCE(AVG(p.total), 0), 2) as ticket_promedio,
        MAX(p.fecha_pedido) as ultima_compra,
        COALESCE(EXTRACT(days FROM NOW() - MAX(p.fecha_pedido))::INTEGER, 999) as dias_sin_comprar,
        STRING_AGG(DISTINCT cat.nombre, ', ' ORDER BY cat.nombre) as categorias_compradas,
        CASE
          WHEN COUNT(p.id) = 0 THEN 'Nuevo (sin compras)'
          WHEN MAX(p.fecha_pedido) < CURRENT_DATE - INTERVAL '90 days' THEN 'Inactivo'
          WHEN COUNT(p.id) >= 5 THEN 'VIP'
          ELSE 'Activo'
        END as segmento_cliente,
        CURRENT_TIMESTAMP as fecha_actualizacion
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id AND p.estado = 'completado'
      LEFT JOIN pedidos_prendas pp ON p.id = pp.pedido_id
      LEFT JOIN prendas pr ON pp.prenda_id = pr.id
      LEFT JOIN categorias cat ON pr.categoria_id = cat.id
      WHERE c.activo = TRUE
      GROUP BY c.id, c.nombre, c.apellido, c.email, c.telefono
      ORDER BY total_gastado DESC
    `
    );

    // Create indexes on materialized view
    await executeQuery(
      client,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_segmentacion_clientes_id 
       ON mv_segmentacion_clientes_resumen(id)`
    );

    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_mv_segmentacion_clientes_segmento 
       ON mv_segmentacion_clientes_resumen(segmento_cliente)`
    );

    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_mv_segmentacion_clientes_gastado 
       ON mv_segmentacion_clientes_resumen(total_gastado DESC)`
    );

    await executeQuery(
      client,
      "COMMENT ON MATERIALIZED VIEW mv_segmentacion_clientes_resumen IS 'Resumen de segmentación de clientes - Refrescar semanalmente'"
    );
    console.log('   ✅ mv_segmentacion_clientes_resumen creada');

    // ===================================================================
    // MATERIALIZED VIEW 4: Inventory Critical Summary
    // Refresh: Hourly (or on-demand)
    // ===================================================================

    console.log('\n📊 Creando mv_inventario_critico_resumen...');
    await executeQuery(
      client,
      `
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventario_critico_resumen AS
      SELECT
        p.id,
        p.nombre,
        p.stock_disponible,
        p.stock_vendido,
        p.stock_inicial,
        c.nombre as categoria,
        d.nombre as diseno,
        t.nombre as tela,
        CASE
          WHEN p.stock_disponible = 0 THEN 'AGOTADO'
          WHEN p.stock_disponible <= 3 THEN 'CRITICO'
          WHEN p.stock_disponible <= 10 THEN 'BAJO'
          ELSE 'NORMAL'
        END as estado_stock,
        ROUND((p.stock_disponible::DECIMAL / NULLIF(p.stock_inicial, 0)) * 100, 2) as porcentaje_disponible,
        p.fecha_ultima_venta,
        EXTRACT(days FROM NOW() - p.fecha_ultima_venta)::INTEGER as dias_sin_venta,
        CURRENT_TIMESTAMP as fecha_actualizacion
      FROM prendas p
      INNER JOIN categorias c ON p.categoria_id = c.id
      INNER JOIN disenos d ON p.diseno_id = d.id
      INNER JOIN telas t ON p.tela_id = t.id
      WHERE p.activa = TRUE
        AND (p.stock_disponible <= 10 OR p.stock_disponible = 0)
      ORDER BY p.stock_disponible, dias_sin_venta DESC
    `
    );

    // Create indexes on materialized view
    await executeQuery(
      client,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventario_critico_id 
       ON mv_inventario_critico_resumen(id)`
    );

    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_mv_inventario_critico_estado 
       ON mv_inventario_critico_resumen(estado_stock, stock_disponible)`
    );

    await executeQuery(
      client,
      "COMMENT ON MATERIALIZED VIEW mv_inventario_critico_resumen IS 'Resumen de inventario crítico - Refrescar cada hora'"
    );
    console.log('   ✅ mv_inventario_critico_resumen creada');

    // ===================================================================
    // INITIAL DATA POPULATION
    // ===================================================================

    console.log('\n🔄 Poblando vistas materializadas con datos iniciales...\n');

    console.log('   • Refrescando mv_ventas_mensuales_resumen...');
    await executeQuery(client, 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen');

    console.log('   • Refrescando mv_top_productos_resumen...');
    await executeQuery(client, 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_productos_resumen');

    console.log('   • Refrescando mv_segmentacion_clientes_resumen...');
    await executeQuery(client, 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_segmentacion_clientes_resumen');

    console.log('   • Refrescando mv_inventario_critico_resumen...');
    await executeQuery(client, 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen');

    await client.query('COMMIT');

    logSuccess('13_materialized_views.js', 'Vistas materializadas creadas exitosamente', {
      'Vistas materializadas': 4,
      'Índices creados': 7,
      'Datos iniciales': 'Poblados',
    });

    console.log('\n📋 Vistas materializadas disponibles:');
    console.log('   • mv_ventas_mensuales_resumen - Refrescar diariamente');
    console.log('   • mv_top_productos_resumen - Refrescar diariamente');
    console.log('   • mv_segmentacion_clientes_resumen - Refrescar semanalmente');
    console.log('   • mv_inventario_critico_resumen - Refrescar cada hora');
    console.log('\n💡 Comandos útiles:');
    console.log('   REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;');
    console.log('   SELECT * FROM mv_ventas_mensuales_resumen LIMIT 10;');
    console.log('\n💡 Para refrescar automáticamente, usar pg_cron o cron job\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('13_materialized_views.js', 'Creación de Vistas Materializadas', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
createMaterializedViews()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });

