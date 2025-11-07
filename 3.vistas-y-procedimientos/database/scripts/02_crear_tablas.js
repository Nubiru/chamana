/**
 * Script 02: Crear Tablas - Phase 3 (3NF)
 *
 * Creates all tables for Phase 3 database:
 * - 12 tables from Phase 2 (base structure)
 * - 7 new tables for 3NF normalization
 * Total: 19 tables
 *
 * Key Changes for 3NF:
 * - Eliminates transitive dependencies
 * - New tables: direcciones, tipos_prenda, estados_pedido, historial_estados_pedido,
 *   proveedores, telas_proveedores, metodos_pago
 *
 * If this script fails:
 * 1. Verify database exists: psql -U postgres -l | grep chamana_db_fase3
 * 2. Check for existing tables: psql -U postgres -d chamana_db_fase3 -c "\dt"
 * 3. Manual rollback: DROP DATABASE chamana_db_fase3; then re-run 01_crear_database.js
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function crearTablas() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Iniciando creación de tablas Fase 3 (3NF)...\n');

    // ===================================================================
    // PHASE 2 BASE TABLES (copied from Phase 2 structure)
    // ===================================================================

    console.log('📦 Creando tablas base de Fase 2...');

    // Table 1: clientes
    await executeQuery(
      client,
      `
      CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        ciudad VARCHAR(100),
        codigo_postal VARCHAR(10),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      )
    `
    );
    console.log('   ✅ clientes');

    // Table 2: categorias
    await executeQuery(
      client,
      `
      CREATE TABLE categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT
      )
    `
    );
    console.log('   ✅ categorias');

    // Table 3: años (no dependencies)
    await executeQuery(
      client,
      `
      CREATE TABLE años (
        id SERIAL PRIMARY KEY,
        año INTEGER NOT NULL UNIQUE CHECK (año >= 2000 AND año <= 2100)
      )
    `
    );
    console.log('   ✅ años');

    // Table 4: temporadas (no dependencies)
    await executeQuery(
      client,
      `
      CREATE TABLE temporadas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
      )
    `
    );
    console.log('   ✅ temporadas');

    // Table 5: colecciones (depends on años, temporadas)
    await executeQuery(
      client,
      `
      CREATE TABLE colecciones (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        año_id INTEGER NOT NULL REFERENCES años(id),
        temporada_id INTEGER NOT NULL REFERENCES temporadas(id),
        descripcion TEXT,
        fecha_inicio DATE,
        fecha_fin DATE,
        activa BOOLEAN DEFAULT TRUE,
        UNIQUE(año_id, temporada_id)
      )
    `
    );
    console.log('   ✅ colecciones');

    // Table 6: telas (no dependencies)
    await executeQuery(
      client,
      `
      CREATE TABLE telas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT,
        costo_por_metro DECIMAL(10,2)
      )
    `
    );
    console.log('   ✅ telas');

    // Table 7: disenos (depends on colecciones)
    await executeQuery(
      client,
      `
      CREATE TABLE disenos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        tipo VARCHAR(100),
        detalle VARCHAR(200),
        descripcion TEXT,
        coleccion_id INTEGER REFERENCES colecciones(id),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    );
    console.log('   ✅ disenos');

    // Table 8: prendas (with stock management)
    await executeQuery(
      client,
      `
      CREATE TABLE prendas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        tipo VARCHAR(100),
        precio_chamana DECIMAL(10,2) NOT NULL,
        categoria_id INTEGER REFERENCES categorias(id),
        diseno_id INTEGER REFERENCES disenos(id),
        tela_id INTEGER REFERENCES telas(id),
        coleccion_id INTEGER REFERENCES colecciones(id),
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activa BOOLEAN DEFAULT TRUE,
        stock_inicial INTEGER DEFAULT 0 CHECK (stock_inicial >= 0),
        stock_vendido INTEGER DEFAULT 0 CHECK (stock_vendido >= 0),
        fecha_ultima_venta TIMESTAMP,
        stock_disponible INTEGER GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED
      )
    `
    );
    console.log('   ✅ prendas');

    // Table 9: pedidos
    await executeQuery(
      client,
      `
      CREATE TABLE pedidos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
        subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
        descuento DECIMAL(10,2) DEFAULT 0 CHECK (descuento >= 0),
        total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
        notas TEXT,
        fecha_completado TIMESTAMP,
        fecha_cancelado TIMESTAMP
      )
    `
    );
    console.log('   ✅ pedidos');

    // Table 10: pedidos_prendas
    await executeQuery(
      client,
      `
      CREATE TABLE pedidos_prendas (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        prenda_id INTEGER NOT NULL REFERENCES prendas(id),
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
        subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
        UNIQUE(pedido_id, prenda_id)
      )
    `
    );
    console.log('   ✅ pedidos_prendas');

    // Table 11: telas_temporadas
    await executeQuery(
      client,
      `
      CREATE TABLE telas_temporadas (
        id SERIAL PRIMARY KEY,
        tela_id INTEGER NOT NULL REFERENCES telas(id),
        temporada_id INTEGER NOT NULL REFERENCES temporadas(id),
        año_id INTEGER NOT NULL REFERENCES años(id),
        activo BOOLEAN DEFAULT TRUE,
        stock_metros DECIMAL(10,2),
        costo_por_metro DECIMAL(10,2),
        fecha_inicio DATE,
        fecha_fin DATE,
        UNIQUE(tela_id, temporada_id, año_id)
      )
    `
    );
    console.log('   ✅ telas_temporadas');

    // Table 12: movimientos_inventario
    await executeQuery(
      client,
      `
      CREATE TABLE movimientos_inventario (
        id SERIAL PRIMARY KEY,
        prenda_id INTEGER NOT NULL REFERENCES prendas(id),
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'venta')),
        cantidad INTEGER NOT NULL,
        stock_anterior INTEGER NOT NULL CHECK (stock_anterior >= 0),
        stock_nuevo INTEGER NOT NULL CHECK (stock_nuevo >= 0),
        pedido_id INTEGER REFERENCES pedidos(id),
        motivo TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario VARCHAR(100)
      )
    `
    );
    console.log('   ✅ movimientos_inventario');

    // ===================================================================
    // NEW TABLES FOR 3NF (Eliminating Transitive Dependencies)
    // ===================================================================

    console.log('\n📦 Creando nuevas tablas de Fase 3 (3NF)...');

    // Table 13: direcciones (Eliminates transitive dependency from clientes)
    await executeQuery(
      client,
      `
      CREATE TABLE direcciones (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
        tipo VARCHAR(20) CHECK (tipo IN ('envio', 'facturacion', 'principal')),
        direccion TEXT NOT NULL,
        ciudad VARCHAR(100) NOT NULL,
        estado VARCHAR(100),
        codigo_postal VARCHAR(10),
        pais VARCHAR(50) DEFAULT 'México',
        predeterminada BOOLEAN DEFAULT FALSE,
        activa BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_direccion_predeterminada UNIQUE(cliente_id, tipo, predeterminada)
      )
    `
    );
    console.log('   ✅ direcciones (3NF)');

    // Table 14: tipos_prenda (Eliminates transitive dependency from prendas)
    await executeQuery(
      client,
      `
      CREATE TABLE tipos_prenda (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        subcategoria VARCHAR(50),
        cuidados_lavado TEXT,
        temperatura_lavado VARCHAR(20),
        puede_planchar BOOLEAN DEFAULT TRUE,
        puede_secar_maquina BOOLEAN DEFAULT TRUE,
        temporada_recomendada VARCHAR(20),
        ocasion_uso VARCHAR(100),
        descripcion TEXT
      )
    `
    );
    console.log('   ✅ tipos_prenda (3NF)');

    // Table 15: estados_pedido (Normalized state machine)
    await executeQuery(
      client,
      `
      CREATE TABLE estados_pedido (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        nombre VARCHAR(50) NOT NULL,
        descripcion TEXT,
        es_inicial BOOLEAN DEFAULT FALSE,
        es_final BOOLEAN DEFAULT FALSE,
        permite_edicion BOOLEAN DEFAULT TRUE,
        permite_cancelacion BOOLEAN DEFAULT TRUE,
        color_hex VARCHAR(7) DEFAULT '#666666',
        orden_workflow INTEGER
      )
    `
    );
    console.log('   ✅ estados_pedido (3NF)');

    // Table 16: historial_estados_pedido (Audit trail)
    await executeQuery(
      client,
      `
      CREATE TABLE historial_estados_pedido (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        estado_anterior_id INTEGER REFERENCES estados_pedido(id),
        estado_nuevo_id INTEGER NOT NULL REFERENCES estados_pedido(id),
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_cambio VARCHAR(100),
        notas TEXT,
        automatico BOOLEAN DEFAULT FALSE
      )
    `
    );
    console.log('   ✅ historial_estados_pedido (3NF)');

    // Table 17: proveedores
    await executeQuery(
      client,
      `
      CREATE TABLE proveedores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        rfc VARCHAR(13) UNIQUE,
        telefono VARCHAR(20),
        email VARCHAR(100),
        direccion TEXT,
        ciudad VARCHAR(100),
        pais VARCHAR(50) DEFAULT 'México',
        dias_entrega_promedio INTEGER,
        calificacion DECIMAL(3,2) CHECK (calificacion BETWEEN 0 AND 5),
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notas TEXT
      )
    `
    );
    console.log('   ✅ proveedores (3NF)');

    // Table 18: telas_proveedores (M:M relationship)
    await executeQuery(
      client,
      `
      CREATE TABLE telas_proveedores (
        id SERIAL PRIMARY KEY,
        tela_id INTEGER NOT NULL REFERENCES telas(id) ON DELETE CASCADE,
        proveedor_id INTEGER NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
        precio_metro DECIMAL(10,2) NOT NULL,
        tiempo_entrega_dias INTEGER,
        cantidad_minima DECIMAL(10,2) DEFAULT 10,
        moneda VARCHAR(3) DEFAULT 'MXN',
        fecha_ultimo_precio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        UNIQUE(tela_id, proveedor_id)
      )
    `
    );
    console.log('   ✅ telas_proveedores (3NF)');

    // Table 19: metodos_pago
    await executeQuery(
      client,
      `
      CREATE TABLE metodos_pago (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        tipo VARCHAR(30) CHECK (tipo IN ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'paypal', 'otro')),
        requiere_referencia BOOLEAN DEFAULT FALSE,
        comision_porcentaje DECIMAL(5,2) DEFAULT 0,
        dias_procesamiento INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
        descripcion TEXT
      )
    `
    );
    console.log('   ✅ metodos_pago (3NF)');

    // ===================================================================
    // CREATE INDEXES
    // ===================================================================

    console.log('\n📊 Creando índices...');

    await executeQuery(client, 'CREATE INDEX idx_direcciones_cliente ON direcciones(cliente_id)');
    await executeQuery(
      client,
      'CREATE INDEX idx_direcciones_tipo ON direcciones(tipo) WHERE activa = TRUE'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_historial_pedido ON historial_estados_pedido(pedido_id, fecha_cambio DESC)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_historial_estado ON historial_estados_pedido(estado_nuevo_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_telas_proveedores_tela ON telas_proveedores(tela_id)'
    );
    await executeQuery(
      client,
      'CREATE INDEX idx_telas_proveedores_proveedor ON telas_proveedores(proveedor_id)'
    );

    console.log('   ✅ Índices creados');

    await client.query('COMMIT');

    logSuccess('02_crear_tablas.js', 'Todas las tablas creadas exitosamente', {
      'Tablas base (Fase 2)': 12,
      'Tablas nuevas (3NF)': 7,
      'Total de tablas': 19,
    });

    console.log('\n📋 Resumen de estructura 3NF:');
    console.log('   • Eliminación de dependencias transitivas');
    console.log('   • Normalización completa a Tercera Forma Normal');
    console.log('   • Máquina de estados para pedidos');
    console.log('   • Auditoría completa de cambios');
    console.log('   • Gestión de proveedores y métodos de pago\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('02_crear_tablas.js', 'Creación de Tablas', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
crearTablas()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
