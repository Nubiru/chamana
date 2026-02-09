/**
 * Script 15: Additional Business Intelligence Views - Phase 4
 *
 * Creates 5 new Business Intelligence views for advanced reporting:
 * 1. vista_ventas_por_categoria - Sales by category
 * 2. vista_ventas_por_temporada - Sales by season
 * 3. vista_tendencias_productos - Product trends over time
 * 4. vista_analisis_proveedores - Supplier analysis
 * 5. vista_rendimiento_vendedores - Sales performance by employee (future)
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function createAdditionalViews() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando vistas adicionales de Business Intelligence...\n');

    // ===================================================================
    // Vista 1: Ventas por Categoría
    // ===================================================================

    console.log('📊 Creando vista_ventas_por_categoria...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_ventas_por_categoria AS
      SELECT
        c.id as categoria_id,
        c.nombre as categoria,
        COUNT(DISTINCT ped.id) as total_pedidos,
        COUNT(DISTINCT pp.prenda_id) as productos_vendidos,
        SUM(pp.cantidad) as unidades_vendidas,
        SUM(pp.subtotal) as ingresos_totales,
        ROUND(AVG(pp.precio_unitario), 2) as precio_promedio,
        ROUND(SUM(pp.subtotal) / NULLIF(SUM(pp.cantidad), 0), 2) as ticket_promedio_unidad,
        MIN(ped.fecha_pedido) as primera_venta,
        MAX(ped.fecha_pedido) as ultima_venta,
        COUNT(DISTINCT ped.cliente_id) as clientes_unicos
      FROM categorias c
      INNER JOIN prendas pr ON c.id = pr.categoria_id
      INNER JOIN pedidos_prendas pp ON pr.id = pp.prenda_id
      INNER JOIN pedidos ped ON pp.pedido_id = ped.id
      WHERE ped.estado = 'completado'
      GROUP BY c.id, c.nombre
      ORDER BY ingresos_totales DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_ventas_por_categoria IS 'Análisis de ventas agrupadas por categoría de producto'"
    );
    console.log('   ✅ vista_ventas_por_categoria creada');

    // ===================================================================
    // Vista 2: Ventas por Temporada
    // ===================================================================

    console.log('\n📊 Creando vista_ventas_por_temporada...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_ventas_por_temporada AS
      SELECT
        t.id as temporada_id,
        t.nombre as temporada,
        COUNT(DISTINCT ped.id) as total_pedidos,
        COUNT(DISTINCT pp.prenda_id) as productos_vendidos,
        SUM(pp.cantidad) as unidades_vendidas,
        SUM(pp.subtotal) as ingresos_totales,
        ROUND(AVG(pp.precio_unitario), 2) as precio_promedio,
        COUNT(DISTINCT ped.cliente_id) as clientes_unicos,
        MIN(ped.fecha_pedido) as primera_venta,
        MAX(ped.fecha_pedido) as ultima_venta
      FROM temporadas t
      INNER JOIN colecciones col ON t.id = col.temporada_id
      INNER JOIN disenos d ON col.id = d.coleccion_id
      INNER JOIN prendas pr ON d.id = pr.diseno_id
      INNER JOIN pedidos_prendas pp ON pr.id = pp.prenda_id
      INNER JOIN pedidos ped ON pp.pedido_id = ped.id
      WHERE ped.estado = 'completado'
      GROUP BY t.id, t.nombre
      ORDER BY ingresos_totales DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_ventas_por_temporada IS 'Análisis de ventas agrupadas por temporada'"
    );
    console.log('   ✅ vista_ventas_por_temporada creada');

    // ===================================================================
    // Vista 3: Tendencias de Productos
    // ===================================================================

    console.log('\n📊 Creando vista_tendencias_productos...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_tendencias_productos AS
      SELECT
        pr.id as prenda_id,
        pr.nombre as producto,
        DATE_TRUNC('month', ped.fecha_pedido) as mes,
        COUNT(DISTINCT ped.id) as pedidos_mes,
        SUM(pp.cantidad) as unidades_vendidas_mes,
        SUM(pp.subtotal) as ingresos_mes,
        ROUND(AVG(pp.precio_unitario), 2) as precio_promedio_mes,
        c.nombre as categoria,
        pr.stock_disponible as stock_actual
      FROM prendas pr
      INNER JOIN categorias c ON pr.categoria_id = c.id
      INNER JOIN pedidos_prendas pp ON pr.id = pp.prenda_id
      INNER JOIN pedidos ped ON pp.pedido_id = ped.id
      WHERE ped.estado = 'completado'
        AND ped.fecha_pedido >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY pr.id, pr.nombre, DATE_TRUNC('month', ped.fecha_pedido), c.nombre, pr.stock_disponible
      ORDER BY mes DESC, ingresos_mes DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_tendencias_productos IS 'Tendencias de ventas de productos por mes (últimos 12 meses)'"
    );
    console.log('   ✅ vista_tendencias_productos creada');

    // ===================================================================
    // Vista 4: Análisis de Proveedores
    // ===================================================================

    console.log('\n📊 Creando vista_analisis_proveedores...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_analisis_proveedores AS
      SELECT
        prov.id as proveedor_id,
        prov.nombre as proveedor,
        prov.ciudad,
        prov.pais,
        COUNT(DISTINCT tp.tela_id) as telas_suministradas,
        COUNT(DISTINCT pr.id) as productos_activos,
        SUM(CASE WHEN pr.stock_disponible > 0 THEN 1 ELSE 0 END) as productos_con_stock,
        SUM(pr.stock_disponible) as stock_total,
        SUM(pr.stock_vendido) as unidades_vendidas_total,
        ROUND(AVG(pr.precio_chamana), 2) as precio_promedio_productos,
        MIN(pr.fecha_creacion) as primera_compra,
        MAX(pr.fecha_ultima_venta) as ultima_venta
      FROM proveedores prov
      INNER JOIN telas_proveedores tp ON prov.id = tp.proveedor_id
      INNER JOIN telas t ON tp.tela_id = t.id
      INNER JOIN prendas pr ON t.id = pr.tela_id
      WHERE pr.activa = TRUE
      GROUP BY prov.id, prov.nombre, prov.ciudad, prov.pais
      ORDER BY productos_activos DESC, stock_total DESC
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_analisis_proveedores IS 'Análisis de proveedores y su contribución al inventario'"
    );
    console.log('   ✅ vista_analisis_proveedores creada');

    // ===================================================================
    // Vista 5: Análisis de Métodos de Pago
    // ===================================================================
    // NOTA: Comentado porque pedidos.metodo_pago_id no existe en schema Phase 3
    // Para habilitarlo, agregar columna: ALTER TABLE pedidos ADD COLUMN metodo_pago_id INTEGER REFERENCES metodos_pago(id);

    console.log('\n⚠️  vista_analisis_metodos_pago omitida (pedidos.metodo_pago_id no existe)');

    /* DESCOMENTAR CUANDO AGREGUES metodo_pago_id A TABLA pedidos:
    console.log('\n📊 Creando vista_analisis_metodos_pago...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE VIEW vista_analisis_metodos_pago AS
      SELECT
        mp.id as metodo_pago_id,
        mp.codigo,
        mp.nombre as metodo_pago,
        mp.tipo,
        COUNT(DISTINCT p.id) as total_transacciones,
        SUM(p.total) as monto_total,
        ROUND(AVG(p.total), 2) as ticket_promedio,
        MIN(p.fecha_pedido) as primera_uso,
        MAX(p.fecha_pedido) as ultima_uso,
        COUNT(DISTINCT p.cliente_id) as clientes_unicos,
        ROUND(
          (COUNT(DISTINCT p.id)::DECIMAL /
           NULLIF((SELECT COUNT(*) FROM pedidos WHERE estado = 'completado'), 0)) * 100,
          2
        ) as porcentaje_uso
      FROM metodos_pago mp
      LEFT JOIN pedidos p ON mp.id = p.metodo_pago_id AND p.estado = 'completado'
      GROUP BY mp.id, mp.codigo, mp.nombre, mp.tipo
      ORDER BY monto_total DESC NULLS LAST
    `
    );
    await executeQuery(
      client,
      "COMMENT ON VIEW vista_analisis_metodos_pago IS 'Análisis de uso de métodos de pago'"
    );
    console.log('   ✅ vista_analisis_metodos_pago creada');
    */

    await client.query('COMMIT');

    logSuccess(
      '15_additional_views.js',
      'Vistas adicionales creadas exitosamente',
      {
        'Vistas creadas': 4,
        'Vistas omitidas': '1 (metodos_pago)'
      }
    );

    console.log('\n📋 Vistas adicionales disponibles:');
    console.log('   • vista_ventas_por_categoria - Ventas por categoría');
    console.log('   • vista_ventas_por_temporada - Ventas por temporada');
    console.log('   • vista_tendencias_productos - Tendencias mensuales');
    console.log('   • vista_analisis_proveedores - Análisis de proveedores');
    console.log('   ⚠️  vista_analisis_metodos_pago - OMITIDA (falta columna)\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('15_additional_views.js', 'Creación de Vistas Adicionales', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
createAdditionalViews()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
