// =====================================================
// Script 02: Crear Tablas
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Propósito: Crear tablas clientes, categorias, prendas
// Nota: Estructura simplificada para Fase 0 (pre-normalización)
// =====================================================

const { pool } = require('./00_db');

async function crearTablas() {
  console.log('=====================================================');
  console.log('📋 CHAMANA - Creación de Tablas (Fase 0)');
  console.log('=====================================================\n');

  try {
    // ===== TABLA: clientes (SIMPLIFICADA - 7 columnas) =====
    console.log('📌 Creando tabla "clientes" (simplificada)...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      );
    `);

    // Comentarios para la tabla clientes
    await pool.query(`
      COMMENT ON TABLE clientes IS 'Información básica de clientes CHAMANA (Fase 0 - simplificada)';
      COMMENT ON COLUMN clientes.id IS 'Identificador único del cliente';
      COMMENT ON COLUMN clientes.nombre IS 'Nombre del cliente';
      COMMENT ON COLUMN clientes.apellido IS 'Apellido del cliente';
      COMMENT ON COLUMN clientes.email IS 'Correo electrónico único del cliente';
      COMMENT ON COLUMN clientes.telefono IS 'Número de teléfono de contacto';
      COMMENT ON COLUMN clientes.fecha_registro IS 'Fecha de registro en el sistema';
      COMMENT ON COLUMN clientes.activo IS 'Estado del cliente (activo/inactivo)';
    `);
    console.log('✅ Tabla "clientes" creada (7 columnas - solo comunicación)\n');

    // ===== TABLA: categorias =====
    console.log('📌 Creando tabla "categorias"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        activa BOOLEAN DEFAULT TRUE
      );
    `);

    await pool.query(`
      COMMENT ON TABLE categorias IS 'Categorías de prendas CHAMANA (tipos de ropa)';
      COMMENT ON COLUMN categorias.id IS 'Identificador único de categoría';
      COMMENT ON COLUMN categorias.nombre IS 'Nombre de la categoría (Buzo, Remera, etc.)';
      COMMENT ON COLUMN categorias.descripcion IS 'Descripción de la categoría';
      COMMENT ON COLUMN categorias.activa IS 'Indica si la categoría está activa';
    `);
    console.log('✅ Tabla "categorias" creada\n');

    // ===== TABLA: prendas (Fase 0 - pre-normalizada) =====
    console.log('📌 Creando tabla "prendas" (pre-normalizada)...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prendas (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(200) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        tela_nombre VARCHAR(100),
        precio_chamana DECIMAL(10,2) NOT NULL CHECK (precio_chamana >= 0),
        precio_arro DECIMAL(10,2) CHECK (precio_arro >= 0),
        stock INTEGER DEFAULT 0 CHECK (stock >= 0),
        categoria_id INTEGER REFERENCES categorias(id),
        activa BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      COMMENT ON TABLE prendas IS 'Catálogo de prendas CHAMANA (Fase 0 - pre-normalizada)';
      COMMENT ON COLUMN prendas.id IS 'Identificador único de prenda';
      COMMENT ON COLUMN prendas.nombre_completo IS 'Nombre completo: Diseño + Tela (ej: "Gaia - Jersey Bordó")';
      COMMENT ON COLUMN prendas.tipo IS 'Tipo de prenda (Buzo, Remera, Vestido, etc.)';
      COMMENT ON COLUMN prendas.tela_nombre IS 'Nombre de la tela utilizada';
      COMMENT ON COLUMN prendas.precio_chamana IS 'Precio de venta CHAMANA';
      COMMENT ON COLUMN prendas.precio_arro IS 'Precio de referencia Arro';
      COMMENT ON COLUMN prendas.stock IS 'Cantidad disponible en inventario';
      COMMENT ON COLUMN prendas.categoria_id IS 'Referencia a categoría';
      COMMENT ON COLUMN prendas.activa IS 'Indica si la prenda está activa en catálogo';
      COMMENT ON COLUMN prendas.fecha_creacion IS 'Fecha de creación del registro';
    `);
    console.log('✅ Tabla "prendas" creada (estructura pre-normalizada)\n');

    // ===== Crear índices para mejorar rendimiento =====
    console.log('📌 Creando índices...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
      CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
      CREATE INDEX IF NOT EXISTS idx_prendas_categoria ON prendas(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_prendas_tipo ON prendas(tipo);
      CREATE INDEX IF NOT EXISTS idx_prendas_activa ON prendas(activa);
    `);
    console.log('✅ Índices creados\n');

    console.log('=====================================================');
    console.log('✨ Tablas creadas exitosamente!');
    console.log('   - clientes (7 columnas - simplificada)');
    console.log('   - categorias (4 columnas)');
    console.log('   - prendas (10 columnas - pre-normalizada)');
    console.log('=====================================================');
    console.log('✨ Siguiente paso: Ejecutar "node 03_insertar_categorias.js"');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que la base de datos "chamana_db_fase0 " exista');
    console.error('   - Ejecuta "node 01_crear_database.js" primero');
  } finally {
    await pool.end();
  }
}

// Ejecutar función
crearTablas();
