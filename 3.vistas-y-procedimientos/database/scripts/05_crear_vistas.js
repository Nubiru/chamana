/**
 * Script 05: Crear Vistas de Business Intelligence - Phase 3
 *
 * Creates 5 views for business intelligence and reporting:
 * 1. vista_ventas_mensuales - Monthly sales analysis
 * 2. vista_inventario_critico - Critical inventory alerts
 * 3. vista_top_productos - Top selling products
 * 4. vista_analisis_clientes - Customer segmentation
 * 5. vista_rotacion_inventario - Inventory turnover analysis
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function crearVistas() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando vistas de Business Intelligence...\n');

    // ===================================================================
    // Vista 1: Ventas Mensuales
    // ===================================================================

    console.log('📊 Creando vista_ventas_mensuales...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_ventas_mensuales AS
      SELECT
        DATE_TRUNC('month', p.fecha_pedido) as mes,
        COUNT(DISTINCT p.id) as total_pedidos,
        COUNT(DISTINCT p.cliente_id) as clientes_unicos,
        SUM(pp.cantidad) as prendas_vendidas,
        SUM(p.subtotal) as subtotal_mes,
        SUM(p.descuento) as descuentos_mes,
        SUM(p.total) as total_mes,
        ROUND(AVG(p.total), 2) as ticket_promedio,
        ROUND(SUM(p.total) / NULLIF(COUNT(DISTINCT p.id), 0), 2) as venta_promedio_pedido
      FROM pedidos p
      JOIN pedidos_prendas pp ON p.id = pp.pedido_id
      WHERE p.estado = 'completado'
      GROUP BY DATE_TRUNC('month', p.fecha_pedido)
      ORDER BY mes DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_ventas_mensuales IS 'Análisis de ventas agrupadas por mes'"
    );
    console.log('   ✅ vista_ventas_mensuales creada');

    // ===================================================================
    // Vista 2: Inventario Crítico
    // ===================================================================

    console.log('\n📊 Creando vista_inventario_critico...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_inventario_critico AS
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
        EXTRACT(days FROM NOW() - p.fecha_ultima_venta)::INTEGER as dias_sin_venta
      FROM prendas p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN disenos d ON p.diseno_id = d.id
      JOIN telas t ON p.tela_id = t.id
      WHERE p.activa = TRUE
      ORDER BY p.stock_disponible, dias_sin_venta DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_inventario_critico IS 'Alertas de inventario con niveles de stock categorizados'"
    );
    console.log('   ✅ vista_inventario_critico creada');

    // ===================================================================
    // Vista 3: Top Productos
    // ===================================================================

    console.log('\n📊 Creando vista_top_productos...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_top_productos AS
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
        c.nombre as categoria
      FROM prendas p
      JOIN pedidos_prendas pp ON p.id = pp.prenda_id
      JOIN pedidos ped ON pp.pedido_id = ped.id
      JOIN categorias c ON p.categoria_id = c.id
      WHERE ped.estado = 'completado'
      GROUP BY p.id, p.nombre, p.precio_chamana, p.stock_disponible, c.nombre
      ORDER BY ingresos_generados DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_top_productos IS 'Productos más vendidos ordenados por ingresos'"
    );
    console.log('   ✅ vista_top_productos creada');

    // ===================================================================
    // Vista 4: Análisis de Clientes
    // ===================================================================

    console.log('\n📊 Creando vista_analisis_clientes...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_analisis_clientes AS
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
        STRING_AGG(DISTINCT cat.nombre, ', ') as categorias_compradas,
        CASE
          WHEN COUNT(p.id) = 0 THEN 'Nuevo (sin compras)'
          WHEN MAX(p.fecha_pedido) < CURRENT_DATE - INTERVAL '90 days' THEN 'Inactivo'
          WHEN COUNT(p.id) >= 5 THEN 'VIP'
          ELSE 'Activo'
        END as segmento_cliente
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
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_analisis_clientes IS 'Segmentación de clientes con métricas de comportamiento'"
    );
    console.log('   ✅ vista_analisis_clientes creada');

    // ===================================================================
    // Vista 5: Rotación de Inventario
    // ===================================================================

    console.log('\n📊 Creando vista_rotacion_inventario...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_rotacion_inventario AS
      SELECT
        p.id,
        p.nombre,
        p.stock_inicial,
        p.stock_vendido,
        p.stock_disponible,
        CASE
          WHEN p.stock_inicial > 0 THEN
            ROUND((p.stock_vendido::DECIMAL / p.stock_inicial) * 100, 2)
          ELSE 0
        END as porcentaje_vendido,
        p.fecha_creacion,
        p.fecha_ultima_venta,
        COALESCE(EXTRACT(days FROM p.fecha_ultima_venta - p.fecha_creacion)::INTEGER, 0) as dias_para_primera_venta,
        COALESCE(EXTRACT(days FROM NOW() - p.fecha_creacion)::INTEGER, 0) as dias_en_catalogo,
        CASE
          WHEN p.stock_vendido = 0 THEN 'Sin Ventas'
          WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) >= 0.8 THEN 'Alta Rotación'
          WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) >= 0.5 THEN 'Rotación Media'
          ELSE 'Baja Rotación'
        END as clasificacion_rotacion
      FROM prendas p
      WHERE p.activa = TRUE
      ORDER BY porcentaje_vendido DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_rotacion_inventario IS 'Análisis de rotación de inventario por producto'"
    );
    console.log('   ✅ vista_rotacion_inventario creada');

    await client.query('COMMIT');

    logSuccess('05_crear_vistas.js', 'Todas las vistas creadas exitosamente', {
      'Vistas creadas': 5,
    });

    console.log('\n📋 Vistas disponibles:');
    console.log('   • vista_ventas_mensuales - Análisis mensual de ventas');
    console.log('   • vista_inventario_critico - Alertas de stock');
    console.log('   • vista_top_productos - Productos más vendidos');
    console.log('   • vista_analisis_clientes - Segmentación CRM');
    console.log('   • vista_rotacion_inventario - Métricas de rotación\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('05_crear_vistas.js', 'Creación de Vistas', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
crearVistas()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
