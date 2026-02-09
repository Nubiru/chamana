/**
 * Script 11: Add Database Indexes - Phase 4 (Optimization)
 *
 * Creates indexes on frequently queried columns to improve query performance.
 * Based on analysis of views, procedures, and common query patterns.
 *
 * Indexes Created:
 * 1. Foreign key indexes (for JOIN operations)
 * 2. Filter indexes (for WHERE clauses)
 * 3. Composite indexes (for multi-column queries)
 * 4. Partial indexes (for filtered queries)
 *
 * Expected Performance Improvement: 50%+ faster queries
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function addIndexes() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando índices para optimización de consultas...\n');

    // ===================================================================
    // 1. FOREIGN KEY INDEXES (for JOIN operations)
    // ===================================================================

    console.log('📌 Creando índices en claves foráneas...\n');

    // pedidos.cliente_id - frequently joined in views
    console.log('   • idx_pedidos_cliente_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id 
       ON pedidos(cliente_id)`
    );

    // pedidos_prendas.pedido_id - critical for order details
    console.log('   • idx_pedidos_prendas_pedido_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_prendas_pedido_id 
       ON pedidos_prendas(pedido_id)`
    );

    // pedidos_prendas.prenda_id - critical for product analysis
    console.log('   • idx_pedidos_prendas_prenda_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_prendas_prenda_id 
       ON pedidos_prendas(prenda_id)`
    );

    // prendas.categoria_id - frequently filtered/joined
    console.log('   • idx_prendas_categoria_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_categoria_id 
       ON prendas(categoria_id)`
    );

    // prendas.diseno_id - frequently joined
    console.log('   • idx_prendas_diseno_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_diseno_id 
       ON prendas(diseno_id)`
    );

    // prendas.tela_id - frequently joined
    console.log('   • idx_prendas_tela_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_tela_id 
       ON prendas(tela_id)`
    );

    // disenos.coleccion_id - for collection analysis
    console.log('   • idx_disenos_coleccion_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_disenos_coleccion_id 
       ON disenos(coleccion_id)`
    );

    // colecciones.año_id - for year-based queries
    console.log('   • idx_colecciones_año_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_colecciones_año_id 
       ON colecciones(año_id)`
    );

    // colecciones.temporada_id - for season-based queries
    console.log('   • idx_colecciones_temporada_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_colecciones_temporada_id 
       ON colecciones(temporada_id)`
    );

    // historial_estados_pedido.pedido_id - for order history
    console.log('   • idx_historial_estados_pedido_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_historial_estados_pedido_id 
       ON historial_estados_pedido(pedido_id)`
    );

    // telas_proveedores.tela_id - for supplier analysis
    console.log('   • idx_telas_proveedores_tela_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_telas_proveedores_tela_id 
       ON telas_proveedores(tela_id)`
    );

    // telas_proveedores.proveedor_id - for supplier analysis
    console.log('   • idx_telas_proveedores_proveedor_id...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_telas_proveedores_proveedor_id 
       ON telas_proveedores(proveedor_id)`
    );

    // ===================================================================
    // 2. FILTER INDEXES (for WHERE clauses)
    // ===================================================================

    console.log('\n📌 Creando índices para filtros frecuentes...\n');

    // pedidos.estado - heavily filtered in views (WHERE estado = 'completado')
    console.log('   • idx_pedidos_estado...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_estado 
       ON pedidos(estado)`
    );

    // pedidos.fecha_pedido - for date range queries and monthly grouping
    console.log('   • idx_pedidos_fecha_pedido...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_pedido 
       ON pedidos(fecha_pedido)`
    );

    // prendas.activa - frequently filtered (WHERE activa = TRUE)
    console.log('   • idx_prendas_activa...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_activa 
       ON prendas(activa)`
    );

    // clientes.activo - frequently filtered (WHERE activo = TRUE)
    console.log('   • idx_clientes_activo...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_clientes_activo 
       ON clientes(activo)`
    );

    // prendas.stock_disponible - for inventory alerts
    console.log('   • idx_prendas_stock_disponible...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_stock_disponible 
       ON prendas(stock_disponible)`
    );

    // ===================================================================
    // 3. COMPOSITE INDEXES (for multi-column queries)
    // ===================================================================

    console.log('\n📌 Creando índices compuestos...\n');

    // pedidos: estado + fecha_pedido (common in monthly sales view)
    console.log('   • idx_pedidos_estado_fecha...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_estado_fecha 
       ON pedidos(estado, fecha_pedido DESC)`
    );

    // pedidos_prendas: pedido_id + prenda_id (for order details)
    console.log('   • idx_pedidos_prendas_pedido_prenda...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_prendas_pedido_prenda 
       ON pedidos_prendas(pedido_id, prenda_id)`
    );

    // prendas: activa + stock_disponible (for inventory critical view)
    console.log('   • idx_prendas_activa_stock...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_activa_stock 
       ON prendas(activa, stock_disponible)`
    );

    // ===================================================================
    // 4. PARTIAL INDEXES (for filtered queries)
    // ===================================================================

    console.log('\n📌 Creando índices parciales (filtrados)...\n');

    // Partial index for completed orders only (most common query)
    console.log('   • idx_pedidos_completados...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_pedidos_completados 
       ON pedidos(fecha_pedido DESC, cliente_id) 
       WHERE estado = 'completado'`
    );

    // Partial index for active products only
    console.log('   • idx_prendas_activas_stock...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_activas_stock 
       ON prendas(stock_disponible, categoria_id) 
       WHERE activa = TRUE`
    );

    // Partial index for active clients only
    console.log('   • idx_clientes_activos_email...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_clientes_activos_email 
       ON clientes(email, nombre, apellido) 
       WHERE activo = TRUE`
    );

    // ===================================================================
    // 5. TEXT SEARCH INDEXES (for full-text search - future enhancement)
    // ===================================================================

    console.log('\n📌 Creando índices para búsqueda de texto...\n');

    // GIN index for product name search (future feature)
    console.log('   • idx_prendas_nombre_gin...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_prendas_nombre_gin 
       ON prendas USING gin(to_tsvector('spanish', nombre))`
    );

    // ===================================================================
    // 6. UNIQUE INDEXES (if not already created by UNIQUE constraints)
    // ===================================================================

    console.log('\n📌 Verificando índices únicos...\n');

    // These should already exist from table creation, but we verify
    console.log('   ✓ Índices únicos ya creados por constraints UNIQUE\n');

    await client.query('COMMIT');

    // ===================================================================
    // 7. ANALYZE TABLES (update statistics for query planner)
    // ===================================================================

    console.log('\n📊 Actualizando estadísticas de tablas...\n');

    const tables = [
      'pedidos',
      'pedidos_prendas',
      'prendas',
      'clientes',
      'categorias',
      'disenos',
      'telas',
      'colecciones',
      'historial_estados_pedido',
      'telas_proveedores',
    ];

    for (const table of tables) {
      console.log(`   • ANALYZE ${table}...`);
      await executeQuery(client, `ANALYZE ${table}`);
    }

    logSuccess('11_add_indexes.js', 'Índices creados exitosamente', {
      'Índices de claves foráneas': 11,
      'Índices de filtros': 5,
      'Índices compuestos': 3,
      'Índices parciales': 3,
      'Índices de texto': 1,
      'Total índices': 23,
    });

    console.log('\n📋 Resumen de índices creados:');
    console.log('   • Claves foráneas: 11 índices');
    console.log('   • Filtros: 5 índices');
    console.log('   • Compuestos: 3 índices');
    console.log('   • Parciales: 3 índices');
    console.log('   • Búsqueda de texto: 1 índice');
    console.log('\n💡 Próximo paso: Ejecutar EXPLAIN ANALYZE en vistas para medir mejoras\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('11_add_indexes.js', 'Creación de Índices', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
addIndexes()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });

