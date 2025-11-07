// =====================================================
// Script: Crear Tablas - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Crea 7 tablas normalizadas en 1NF
// =====================================================

const { pool } = require('./00_db');

async function crearTablas() {
  try {
    console.log('🔨 Creando tablas en chamana_db_fase1...\n');

    // 1. Tabla Clientes (sin cambios desde Fase 0)
    console.log('📋 Creando tabla: clientes');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true
      )
    `);

    // 2. Tabla Categorías (sin cambios desde Fase 0)
    console.log('📋 Creando tabla: categorias');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT true
      )
    `);

    // 3. Tabla Diseños (NUEVA - 1NF)
    console.log('📋 Creando tabla: disenos');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disenos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT true
      )
    `);

    // 4. Tabla Telas (NUEVA - 1NF)
    console.log('📋 Creando tabla: telas');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        tipo VARCHAR(50),
        activo BOOLEAN DEFAULT true
      )
    `);

    // 5. Tabla Años (NUEVA - 1NF)
    console.log('📋 Creando tabla: años');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS años (
        id SERIAL PRIMARY KEY,
        año INTEGER UNIQUE NOT NULL
      )
    `);

    // 6. Tabla Temporadas (NUEVA - 1NF)
    console.log('📋 Creando tabla: temporadas');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temporadas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(20) UNIQUE NOT NULL
      )
    `);

    // 7. Tabla Colecciones (NUEVA - 1NF)
    console.log('📋 Creando tabla: colecciones');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        año_id INTEGER NOT NULL REFERENCES años(id),
        temporada_id INTEGER NOT NULL REFERENCES temporadas(id),
        nombre VARCHAR(100) UNIQUE NOT NULL,
        activo BOOLEAN DEFAULT true,
        UNIQUE(año_id, temporada_id)
      )
    `);

    // 8. Tabla Prendas (MODIFICADA - 1NF con FKs)
    console.log('📋 Creando tabla: prendas');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prendas (
        id SERIAL PRIMARY KEY,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id),
        diseno_id INTEGER NOT NULL REFERENCES disenos(id),
        tela_id INTEGER NOT NULL REFERENCES telas(id),
        coleccion_id INTEGER REFERENCES colecciones(id),
        nombre_completo VARCHAR(255) NOT NULL,
        tipo_prenda VARCHAR(100) NOT NULL,
        precio_chamana DECIMAL(10,2) NOT NULL,
        precio_arro DECIMAL(10,2),
        stock_disponible INTEGER DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true
      )
    `);

    console.log('\n✅ Todas las tablas creadas exitosamente!');
    console.log(
      '📊 Total: 7 tablas (clientes, categorias, disenos, telas, años, temporadas, colecciones, prendas)\n'
    );
    console.log('📍 Siguiente paso: Ejecuta 03_insertar_estaticos.js\n');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar
crearTablas();
