/**
 * Script 02: Crear Tablas - Phase 2 (2NF)
 *
 * Creates all 11 tables for Phase 2 database:
 * - 7 base tables from Phase 1 (clientes, categorias, disenos, telas, años, temporadas, colecciones)
 * - 1 enhanced table (prendas with new stock columns)
 * - 4 new tables (pedidos, pedidos_prendas, telas_temporadas, movimientos_inventario)
 *
 * Key Changes for 2NF:
 * - Junction tables to eliminate partial dependencies
 * - Generated column for stock_disponible (automatic calculation)
 * - Enhanced foreign key relationships
 *
 * If this script fails:
 * 1. Verify database exists: psql -U postgres -l | grep chamana_db_fase2
 * 2. Check for existing tables: psql -U postgres -d chamana_db_fase2 -c "\dt"
 * 3. Manual rollback: DROP DATABASE chamana_db_fase2; then re-run 01_crear_database.js
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function crearTablas() {
  const pool = createPool('fase2');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Iniciando creación de tablas Fase 2...\n');

    // ===================================================================
    // PHASE 1 BASE TABLES (unchanged structure)
    // ===================================================================

    console.log('📦 Creando tablas base de Fase 1...');

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

    // Table 3: disenos
    await executeQuery(
      client,
      `
      CREATE TABLE disenos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    );
    console.log('   ✅ disenos');

    // Table 4: telas
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

    // Table 5: años
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

    // Table 6: temporadas
    await executeQuery(
      client,
      `
      CREATE TABLE temporadas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
        -- CHECK constraint removed to allow flexible season names from Phase 1
        -- Can be re-added after migration if needed
      )
    `
    );
    console.log('   ✅ temporadas');

    // Table 7: colecciones
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

    // ===================================================================
    // ENHANCED TABLE: prendas (with new stock management columns)
    // ===================================================================

    console.log('\n📦 Creando tabla mejorada: prendas...');

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
        
        -- NEW: Stock management columns (Phase 2)
        stock_inicial INTEGER DEFAULT 0 CHECK (stock_inicial >= 0),
        stock_vendido INTEGER DEFAULT 0 CHECK (stock_vendido >= 0),
        fecha_ultima_venta TIMESTAMP,
        
        -- GENERATED COLUMN: Automatic calculation (2NF best practice)
        -- This guarantees data integrity at database level
        stock_disponible INTEGER GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED
      )
    `
    );
    console.log('   ✅ prendas (con columnas de stock generadas)');

    // ===================================================================
    // NEW TABLES FOR 2NF
    // ===================================================================

    console.log('\n📦 Creando nuevas tablas de Fase 2 (2NF)...');

    // Table 8: pedidos (Orders)
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

    // Table 9: pedidos_prendas (Order Line Items - Junction Table)
    // Eliminates partial dependency: line item data depends on BOTH pedido_id AND prenda_id
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
    console.log('   ✅ pedidos_prendas (junction table)');

    // Table 10: telas_temporadas (Seasonal Fabrics - Junction Table)
    // Eliminates partial dependency: seasonal data depends on tela_id, temporada_id, AND año_id
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
    console.log('   ✅ telas_temporadas (junction table)');

    // Table 11: movimientos_inventario (Inventory Movements - Audit Trail)
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

    await client.query('COMMIT');

    logSuccess('02_crear_tablas.js', 'Todas las tablas creadas exitosamente', {
      'Tablas base (Fase 1)': 7,
      'Tabla mejorada': 1,
      'Tablas nuevas (Fase 2)': 4,
      'Total de tablas': 11,
    });

    console.log('\n📋 Resumen de estructura 2NF:');
    console.log('   • Junction tables para eliminar dependencias parciales');
    console.log('   • stock_disponible como columna generada (integridad automática)');
    console.log('   • Constraints CHECK para validación de datos');
    console.log('   • Foreign keys para integridad referencial\n');
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
