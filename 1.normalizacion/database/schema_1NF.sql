-- =====================================================
-- Schema de Base de Datos - Fase 1 (1NF)
-- Proyecto: CHAMANA - E-commerce de Ropa Femenina
-- Descripción: Esquema completo de 7 tablas en Primera Forma Normal
-- =====================================================
-- NOTA: Este archivo es solo de referencia.
-- Usa los scripts JavaScript (02_crear_tablas.js) para crear las tablas.
-- =====================================================

-- Base de datos
-- CREATE DATABASE chamana_db_fase1;

-- =====================================================
-- TABLAS PRINCIPALES (sin cambios desde Fase 0)
-- =====================================================

-- Tabla: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT true
);

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true
);

-- =====================================================
-- TABLAS NORMALIZADAS (NUEVAS en 1NF)
-- =====================================================

-- Tabla: disenos
-- Extrae los patrones de diseño de las prendas
CREATE TABLE IF NOT EXISTS disenos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true
);

-- Tabla: telas
-- Extrae los tipos de tela a una tabla separada
CREATE TABLE IF NOT EXISTS telas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  tipo VARCHAR(50), -- 'Natural', 'Sintético', etc.
  activo BOOLEAN DEFAULT true
);

-- Tabla: años
-- Tabla estática de años (2022-2032)
CREATE TABLE IF NOT EXISTS años (
  id SERIAL PRIMARY KEY,
  año INTEGER UNIQUE NOT NULL
);

-- Tabla: temporadas
-- Tabla estática de temporadas
CREATE TABLE IF NOT EXISTS temporadas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(20) UNIQUE NOT NULL -- 'verano', 'invierno'
);

-- Tabla: colecciones
-- Combinación de año + temporada
CREATE TABLE IF NOT EXISTS colecciones (
  id SERIAL PRIMARY KEY,
  año_id INTEGER NOT NULL REFERENCES años(id),
  temporada_id INTEGER NOT NULL REFERENCES temporadas(id),
  nombre VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'Verano 2025'
  activo BOOLEAN DEFAULT true,
  UNIQUE(año_id, temporada_id)
);

-- =====================================================
-- TABLA PRINCIPAL CON FOREIGN KEYS
-- =====================================================

-- Tabla: prendas (MODIFICADA para 1NF)
-- Ahora incluye foreign keys a disenos, telas y colecciones
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
);

-- =====================================================
-- ÍNDICES (Opcional, para optimización)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_prendas_categoria ON prendas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_prendas_diseno ON prendas(diseno_id);
CREATE INDEX IF NOT EXISTS idx_prendas_tela ON prendas(tela_id);
CREATE INDEX IF NOT EXISTS idx_prendas_coleccion ON prendas(coleccion_id);
CREATE INDEX IF NOT EXISTS idx_colecciones_año ON colecciones(año_id);
CREATE INDEX IF NOT EXISTS idx_colecciones_temporada ON colecciones(temporada_id);

-- =====================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- =====================================================

COMMENT ON TABLE clientes IS 'Tabla de clientes de CHAMANA (sin cambios desde Fase 0)';
COMMENT ON TABLE categorias IS 'Categorías de productos (sin cambios desde Fase 0)';
COMMENT ON TABLE disenos IS 'Diseños únicos extraídos de las prendas (1NF)';
COMMENT ON TABLE telas IS 'Tipos de tela normalizados (1NF)';
COMMENT ON TABLE años IS 'Años disponibles para colecciones (2022-2032)';
COMMENT ON TABLE temporadas IS 'Temporadas del año (verano, invierno)';
COMMENT ON TABLE colecciones IS 'Colecciones estacionales (año + temporada)';
COMMENT ON TABLE prendas IS 'Prendas con foreign keys a diseños, telas y colecciones (1NF)';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

