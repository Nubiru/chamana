-- =====================================================
-- Migración UP - Fase 0: Comienzo
-- Proyecto: Sistema de Gestión de Productos
-- Fecha: 15 de Octubre, 2025
-- Versión: 0.1.0
-- Descripción: Crear esquema inicial de la base de datos
-- =====================================================

-- Verificar si la base de datos existe
SELECT 'Creando esquema inicial de la base de datos...' as status;

-- =====================================================
-- CREAR TABLAS
-- =====================================================

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria_id INTEGER REFERENCES categorias(id),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREAR ÍNDICES
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(nombre);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);

-- =====================================================
-- CREAR VISTAS
-- =====================================================

-- Vista: Productos con información de categoría
CREATE OR REPLACE VIEW vista_productos_categoria AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock,
    p.fecha_creacion,
    c.nombre as categoria_nombre,
    c.descripcion as categoria_descripcion
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id;

-- Vista: Resumen de inventario por categoría
CREATE OR REPLACE VIEW vista_inventario_categoria AS
SELECT 
    c.id as categoria_id,
    c.nombre as categoria,
    COUNT(p.id) as total_productos,
    SUM(p.stock) as total_stock,
    AVG(p.precio) as precio_promedio,
    MIN(p.precio) as precio_minimo,
    MAX(p.precio) as precio_maximo
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre;

-- =====================================================
-- CREAR FUNCIONES
-- =====================================================

-- Función: Obtener productos por categoría
CREATE OR REPLACE FUNCTION obtener_productos_por_categoria(categoria_nombre VARCHAR)
RETURNS TABLE (
    producto_id INTEGER,
    producto_nombre VARCHAR,
    precio DECIMAL,
    stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.stock
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE c.nombre ILIKE '%' || categoria_nombre || '%'
    ORDER BY p.nombre;
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular valor total del inventario
CREATE OR REPLACE FUNCTION calcular_valor_inventario()
RETURNS DECIMAL AS $$
DECLARE
    valor_total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(precio * stock), 0)
    INTO valor_total
    FROM productos;
    
    RETURN valor_total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREAR TRIGGERS
-- =====================================================

-- Función de trigger: Actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_creacion = OLD.fecha_creacion; -- Mantener fecha original
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar fecha de modificación en productos
DROP TRIGGER IF EXISTS trigger_actualizar_producto ON productos;
CREATE TRIGGER trigger_actualizar_producto
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================
-- CONFIGURACIÓN FINAL
-- =====================================================

-- Configurar timezone
SET timezone = 'America/Mexico_City';

-- Agregar comentarios a las tablas
COMMENT ON TABLE usuarios IS 'Tabla para almacenar información básica de usuarios del sistema';
COMMENT ON TABLE categorias IS 'Tabla para clasificar productos en diferentes categorías';
COMMENT ON TABLE productos IS 'Tabla para almacenar información de productos del catálogo';

-- Agregar comentarios a las columnas
COMMENT ON COLUMN usuarios.id IS 'Identificador único autoincremental del usuario';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.email IS 'Correo electrónico único del usuario';
COMMENT ON COLUMN usuarios.fecha_registro IS 'Fecha y hora de registro del usuario';

COMMENT ON COLUMN categorias.id IS 'Identificador único autoincremental de la categoría';
COMMENT ON COLUMN categorias.nombre IS 'Nombre de la categoría';
COMMENT ON COLUMN categorias.descripcion IS 'Descripción detallada de la categoría';

COMMENT ON COLUMN productos.id IS 'Identificador único autoincremental del producto';
COMMENT ON COLUMN productos.nombre IS 'Nombre del producto';
COMMENT ON COLUMN productos.descripcion IS 'Descripción detallada del producto';
COMMENT ON COLUMN productos.precio IS 'Precio del producto (máximo 99,999,999.99)';
COMMENT ON COLUMN productos.categoria_id IS 'Referencia a la categoría del producto';
COMMENT ON COLUMN productos.stock IS 'Cantidad disponible en inventario';
COMMENT ON COLUMN productos.fecha_creacion IS 'Fecha y hora de creación del producto';

-- =====================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================

-- Mostrar tablas creadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Mostrar vistas creadas
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- Mostrar funciones creadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Mostrar índices creados
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DE MIGRACIÓN UP
-- =====================================================

SELECT 'Migración UP completada exitosamente' as status;
