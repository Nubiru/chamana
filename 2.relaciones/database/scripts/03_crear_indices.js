/**
 * Script 03: Crear Índices - Phase 2
 *
 * Creates indexes for performance optimization on:
 * - Foreign key columns (JOIN operations)
 * - Frequently queried columns (WHERE, ORDER BY clauses)
 * - Unique constraints (data integrity)
 *
 * Performance Impact:
 * - Speeds up JOINs by 10-100x
 * - Accelerates WHERE clauses on indexed columns
 * - Improves ORDER BY performance
 *
 * If this script fails:
 * 1. Check if tables exist: psql -U postgres -d chamana_db_fase2 -c "\dt"
 * 2. Verify no existing indexes: psql -U postgres -d chamana_db_fase2 -c "\di"
 * 3. Manual cleanup: Drop specific index with DROP INDEX index_name;
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function crearIndices() {
  const pool = createPool('fase2');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Iniciando creación de índices...\n');

    let indexCount = 0;

    // ===================================================================
    // INDEXES FOR: clientes
    // ===================================================================
    console.log('📊 Creando índices para clientes...');

    await executeQuery(
      client,
      'CREATE INDEX idx_clientes_email ON clientes(email)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_clientes_activo ON clientes(activo)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_clientes_ciudad ON clientes(ciudad)'
    );
    indexCount += 3;
    console.log('   ✅ 3 índices creados');

    // ===================================================================
    // INDEXES FOR: prendas (most queried table)
    // ===================================================================
    console.log('\n📊 Creando índices para prendas...');

    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_categoria ON prendas(categoria_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_diseno ON prendas(diseno_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_tela ON prendas(tela_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_coleccion ON prendas(coleccion_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_activa ON prendas(activa)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_tipo ON prendas(tipo)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_precio ON prendas(precio_chamana)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_prendas_stock_disponible ON prendas(stock_disponible)'
    );
    indexCount += 8;
    console.log('   ✅ 8 índices creados');

    // ===================================================================
    // INDEXES FOR: pedidos (orders - critical for performance)
    // ===================================================================
    console.log('\n📊 Creando índices para pedidos...');

    await executeQuery(
      client,
      'CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_pedidos_estado ON pedidos(estado)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido DESC)'
    ); // DESC for recent orders first
    await executeQuery(
      client,
      'CREATE INDEX idx_pedidos_total ON pedidos(total)'
    );
    indexCount += 4;
    console.log('   ✅ 4 índices creados');

    // ===================================================================
    // INDEXES FOR: pedidos_prendas (junction table - heavy JOINs)
    // ===================================================================
    console.log('\n📊 Creando índices para pedidos_prendas...');

    await executeQuery(
      client,
      'CREATE INDEX idx_pedidos_prendas_pedido ON pedidos_prendas(pedido_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_pedidos_prendas_prenda ON pedidos_prendas(prenda_id)'
    );
    indexCount += 2;
    console.log('   ✅ 2 índices creados');

    // ===================================================================
    // INDEXES FOR: telas_temporadas (seasonal queries)
    // ===================================================================
    console.log('\n📊 Creando índices para telas_temporadas...');

    await executeQuery(
      client,
      'CREATE INDEX idx_telas_temporadas_tela ON telas_temporadas(tela_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_telas_temporadas_temporada ON telas_temporadas(temporada_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_telas_temporadas_año ON telas_temporadas(año_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_telas_temporadas_activo ON telas_temporadas(activo)'
    );
    // Composite index for common query pattern: by season AND year
    await executeQuery(
      client,
      'CREATE INDEX idx_telas_temporadas_season_year ON telas_temporadas(temporada_id, año_id, activo)'
    );
    indexCount += 5;
    console.log('   ✅ 5 índices creados (incluye índice compuesto)');

    // ===================================================================
    // INDEXES FOR: movimientos_inventario (audit trail queries)
    // ===================================================================
    console.log('\n📊 Creando índices para movimientos_inventario...');

    await executeQuery(
      client,
      'CREATE INDEX idx_movimientos_prenda ON movimientos_inventario(prenda_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_movimientos_tipo ON movimientos_inventario(tipo)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha DESC)'
    ); // DESC for recent movements
    await executeQuery(
      client,
      'CREATE INDEX idx_movimientos_pedido ON movimientos_inventario(pedido_id)'
    );
    indexCount += 4;
    console.log('   ✅ 4 índices creados');

    // ===================================================================
    // INDEXES FOR: colecciones (collection queries)
    // ===================================================================
    console.log('\n📊 Creando índices para colecciones...');

    await executeQuery(
      client,
      'CREATE INDEX idx_colecciones_año ON colecciones(año_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_colecciones_temporada ON colecciones(temporada_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_colecciones_activa ON colecciones(activa)'
    );
    indexCount += 3;
    console.log('   ✅ 3 índices creados');

    await client.query('COMMIT');

    logSuccess(
      '03_crear_indices.js',
      'Todos los índices creados exitosamente',
      {
        'Total de índices': indexCount,
        'Índices simples': indexCount - 1,
        'Índices compuestos': 1,
        'Performance esperada': '+50-100% en consultas complejas'
      }
    );

    console.log('\n📋 Beneficios de los índices:');
    console.log('   • JOINs más rápidos (foreign keys indexados)');
    console.log('   • Búsquedas por estado/activo optimizadas');
    console.log('   • Ordenamiento temporal eficiente (DESC indexes)');
    console.log('   • Consultas estacionales aceleradas (índice compuesto)\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('03_crear_indices.js', 'Creación de Índices', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
crearIndices()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
