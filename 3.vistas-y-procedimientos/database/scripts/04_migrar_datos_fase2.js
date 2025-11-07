/**
 * Script 04: Migrar Datos desde Fase 2
 *
 * Migrates all data from chamana_db_fase2 to chamana_db_fase3:
 * - All base tables (clientes, categorias, disenos, telas, años, temporadas, colecciones)
 * - prendas (with stock data)
 * - pedidos, pedidos_prendas, telas_temporadas, movimientos_inventario
 * - Then migrates to new 3NF tables (direcciones, historial_estados_pedido)
 *
 * Critical: Uses transaction to ensure atomicity (all or nothing)
 */

const { Pool } = require('pg');
const { logError, logSuccess, DB_CONFIGS, executeQuery } = require('./00_db');

async function migrarDatos() {
  // Create separate pools for source and target databases
  const poolFase2 = new Pool(DB_CONFIGS.fase2);
  const poolFase3 = new Pool(DB_CONFIGS.fase3);

  const clientFase2 = await poolFase2.connect();
  const clientFase3 = await poolFase3.connect();

  try {
    // Start transaction in target database
    await clientFase3.query('BEGIN');
    console.log('🚀 Iniciando migración de datos desde Fase 2...\n');

    const stats = {};

    // ===================================================================
    // MIGRATE BASE TABLES (same structure)
    // ===================================================================

    // clientes
    console.log('📦 Migrando clientes...');
    const clientes = await clientFase2.query('SELECT * FROM clientes ORDER BY id');
    for (const cliente of clientes.rows) {
      await executeQuery(
        clientFase3,
        `
        INSERT INTO clientes (id, nombre, apellido, email, telefono, direccion, ciudad, codigo_postal, fecha_registro, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          cliente.id,
          cliente.nombre,
          cliente.apellido,
          cliente.email,
          cliente.telefono,
          cliente.direccion,
          cliente.ciudad,
          cliente.codigo_postal,
          cliente.fecha_registro,
          cliente.activo,
        ]
      );
    }
    stats.clientes = clientes.rows.length;
    console.log(`   ✅ ${clientes.rows.length} registros migrados`);

    // categorias
    console.log('\n📦 Migrando categorias...');
    const categorias = await clientFase2.query('SELECT * FROM categorias ORDER BY id');
    for (const categoria of categorias.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO categorias (id, nombre, descripcion) VALUES ($1, $2, $3)',
        [categoria.id, categoria.nombre, categoria.descripcion]
      );
    }
    stats.categorias = categorias.rows.length;
    console.log(`   ✅ ${categorias.rows.length} registros migrados`);

    // disenos
    console.log('\n📦 Migrando disenos...');
    const disenos = await clientFase2.query('SELECT * FROM disenos ORDER BY id');
    for (const diseno of disenos.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO disenos (id, nombre, tipo, detalle, descripcion, coleccion_id, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          diseno.id,
          diseno.nombre,
          null, // tipo - no existe en Fase 2, se deja NULL
          null, // detalle - no existe en Fase 2, se deja NULL
          diseno.descripcion,
          null, // coleccion_id - no existe en Fase 2, se deja NULL
          diseno.fecha_creacion,
        ]
      );
    }
    stats.disenos = disenos.rows.length;
    console.log(`   ✅ ${disenos.rows.length} registros migrados`);

    // telas
    console.log('\n📦 Migrando telas...');
    const telas = await clientFase2.query('SELECT * FROM telas ORDER BY id');
    for (const tela of telas.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO telas (id, nombre, tipo, descripcion, costo_por_metro) VALUES ($1, $2, $3, $4, $5)',
        [tela.id, tela.nombre, tela.tipo, tela.descripcion, tela.costo_por_metro]
      );
    }
    stats.telas = telas.rows.length;
    console.log(`   ✅ ${telas.rows.length} registros migrados`);

    // años
    console.log('\n📦 Migrando años...');
    const años = await clientFase2.query('SELECT * FROM años ORDER BY id');
    for (const año of años.rows) {
      await executeQuery(clientFase3, 'INSERT INTO años (id, año) VALUES ($1, $2)', [
        año.id,
        año.año,
      ]);
    }
    stats.años = años.rows.length;
    console.log(`   ✅ ${años.rows.length} registros migrados`);

    // temporadas
    console.log('\n📦 Migrando temporadas...');
    const temporadas = await clientFase2.query('SELECT * FROM temporadas ORDER BY id');
    for (const temporada of temporadas.rows) {
      await executeQuery(clientFase3, 'INSERT INTO temporadas (id, nombre) VALUES ($1, $2)', [
        temporada.id,
        temporada.nombre,
      ]);
    }
    stats.temporadas = temporadas.rows.length;
    console.log(`   ✅ ${temporadas.rows.length} registros migrados`);

    // colecciones
    console.log('\n📦 Migrando colecciones...');
    const colecciones = await clientFase2.query('SELECT * FROM colecciones ORDER BY id');
    for (const coleccion of colecciones.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO colecciones (id, nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          coleccion.id,
          coleccion.nombre,
          coleccion.año_id,
          coleccion.temporada_id,
          coleccion.descripcion,
          coleccion.fecha_inicio,
          coleccion.fecha_fin,
          coleccion.activa,
        ]
      );
    }
    stats.colecciones = colecciones.rows.length;
    console.log(`   ✅ ${colecciones.rows.length} registros migrados`);

    // prendas
    console.log('\n📦 Migrando prendas...');
    const prendas = await clientFase2.query('SELECT * FROM prendas ORDER BY id');
    for (const prenda of prendas.rows) {
      await executeQuery(
        clientFase3,
        `INSERT INTO prendas (id, nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, fecha_creacion, activa, stock_inicial, stock_vendido, fecha_ultima_venta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          prenda.id,
          prenda.nombre,
          prenda.tipo,
          prenda.precio_chamana,
          prenda.categoria_id,
          prenda.diseno_id,
          prenda.tela_id,
          prenda.coleccion_id,
          prenda.descripcion,
          prenda.fecha_creacion,
          prenda.activa,
          prenda.stock_inicial || 0,
          prenda.stock_vendido || 0,
          prenda.fecha_ultima_venta,
        ]
      );
    }
    stats.prendas = prendas.rows.length;
    console.log(`   ✅ ${prendas.rows.length} registros migrados`);

    // pedidos
    console.log('\n📦 Migrando pedidos...');
    const pedidos = await clientFase2.query('SELECT * FROM pedidos ORDER BY id');
    for (const pedido of pedidos.rows) {
      await executeQuery(
        clientFase3,
        `INSERT INTO pedidos (id, cliente_id, fecha_pedido, estado, subtotal, descuento, total, notas, fecha_completado, fecha_cancelado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          pedido.id,
          pedido.cliente_id,
          pedido.fecha_pedido,
          pedido.estado,
          pedido.subtotal,
          pedido.descuento,
          pedido.total,
          pedido.notas,
          pedido.fecha_completado,
          pedido.fecha_cancelado,
        ]
      );
    }
    stats.pedidos = pedidos.rows.length;
    console.log(`   ✅ ${pedidos.rows.length} registros migrados`);

    // pedidos_prendas
    console.log('\n📦 Migrando pedidos_prendas...');
    const pedidosPrendas = await clientFase2.query('SELECT * FROM pedidos_prendas ORDER BY id');
    for (const item of pedidosPrendas.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO pedidos_prendas (id, pedido_id, prenda_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          item.id,
          item.pedido_id,
          item.prenda_id,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
        ]
      );
    }
    stats.pedidos_prendas = pedidosPrendas.rows.length;
    console.log(`   ✅ ${pedidosPrendas.rows.length} registros migrados`);

    // telas_temporadas
    console.log('\n📦 Migrando telas_temporadas...');
    const telasTemporadas = await clientFase2.query('SELECT * FROM telas_temporadas ORDER BY id');
    for (const tt of telasTemporadas.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO telas_temporadas (id, tela_id, temporada_id, año_id, activo, stock_metros, costo_por_metro, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          tt.id,
          tt.tela_id,
          tt.temporada_id,
          tt.año_id,
          tt.activo,
          tt.stock_metros,
          tt.costo_por_metro,
          tt.fecha_inicio,
          tt.fecha_fin,
        ]
      );
    }
    stats.telas_temporadas = telasTemporadas.rows.length;
    console.log(`   ✅ ${telasTemporadas.rows.length} registros migrados`);

    // movimientos_inventario
    console.log('\n📦 Migrando movimientos_inventario...');
    const movimientos = await clientFase2.query('SELECT * FROM movimientos_inventario ORDER BY id');
    for (const mov of movimientos.rows) {
      await executeQuery(
        clientFase3,
        'INSERT INTO movimientos_inventario (id, prenda_id, tipo, cantidad, stock_anterior, stock_nuevo, pedido_id, motivo, fecha, usuario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
          mov.id,
          mov.prenda_id,
          mov.tipo,
          mov.cantidad,
          mov.stock_anterior,
          mov.stock_nuevo,
          mov.pedido_id,
          mov.motivo,
          mov.fecha,
          mov.usuario,
        ]
      );
    }
    stats.movimientos_inventario = movimientos.rows.length;
    console.log(`   ✅ ${movimientos.rows.length} registros migrados`);

    // ===================================================================
    // MIGRATE TO NEW 3NF TABLES
    // ===================================================================

    console.log('\n📦 Migrando a tablas 3NF...');

    // direcciones (from clientes)
    console.log('   Migrando direcciones desde clientes...');
    const direccionesMigradas = await executeQuery(
      clientFase3,
      `
      INSERT INTO direcciones (cliente_id, tipo, direccion, ciudad, codigo_postal, predeterminada, activa, fecha_creacion)
      SELECT
        id,
        'principal',
        direccion,
        COALESCE(ciudad, 'Ciudad no especificada'),
        codigo_postal,
        TRUE,
        activo,
        fecha_registro
      FROM clientes
      WHERE direccion IS NOT NULL
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    );
    stats.direcciones = direccionesMigradas.rows.length;
    console.log(`   ✅ ${direccionesMigradas.rows.length} direcciones migradas`);

    // historial_estados_pedido (initial state for existing pedidos)
    console.log('   Migrando historial inicial de estados de pedidos...');
    const historialMigrado = await executeQuery(
      clientFase3,
      `
      INSERT INTO historial_estados_pedido (pedido_id, estado_nuevo_id, fecha_cambio, automatico)
      SELECT
        p.id,
        ep.id,
        p.fecha_pedido,
        TRUE
      FROM pedidos p
      CROSS JOIN estados_pedido ep
      WHERE ep.codigo = p.estado
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    );
    stats.historial_estados_pedido = historialMigrado.rows.length;
    console.log(`   ✅ ${historialMigrado.rows.length} registros de historial migrados`);

    // Update sequences
    console.log('\n📊 Actualizando secuencias...');
    const tables = [
      'clientes',
      'categorias',
      'disenos',
      'telas',
      'años',
      'temporadas',
      'colecciones',
      'prendas',
      'pedidos',
      'pedidos_prendas',
      'telas_temporadas',
      'movimientos_inventario',
      'direcciones',
      'historial_estados_pedido',
    ];

    for (const table of tables) {
      await executeQuery(
        clientFase3,
        `SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`
      );
    }
    console.log('   ✅ Secuencias actualizadas');

    await clientFase3.query('COMMIT');

    logSuccess('04_migrar_datos_fase2.js', 'Migración completada exitosamente', stats);

    console.log('\n📋 Resumen de migración:');
    console.log(
      `   • ${Object.values(stats).reduce((a, b) => a + b, 0)} registros migrados en total`
    );
    console.log('   • Datos base de Fase 2 preservados');
    console.log('   • Nuevas tablas 3NF pobladas\n');
  } catch (error) {
    await clientFase3.query('ROLLBACK');
    logError('04_migrar_datos_fase2.js', 'Migración de Datos', error);
    throw error;
  } finally {
    clientFase2.release();
    clientFase3.release();
    await poolFase2.end();
    await poolFase3.end();
  }
}

// Execute script
migrarDatos()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
