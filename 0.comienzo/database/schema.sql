-- =====================================================
-- Esquema de Base de Datos - Fase 0: Comienzo
-- Proyecto: CHAMANA - E-commerce de Ropa Femenina
-- Fecha: 15 de Octubre, 2025
-- Versión: 0.1.0
-- =====================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE chamana_db_fase0;

-- Conectar a la base de datos
-- \c chamana_db_fase0;

-- =====================================================
-- TABLA: clientes
-- Propósito: Almacenar información de clientes de CHAMANA
-- =====================================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(10) CHECK (genero IN ('F', 'M', 'O')),
    direccion TEXT,
    ciudad VARCHAR(50),
    codigo_postal VARCHAR(10),
    pais VARCHAR(50) DEFAULT 'México',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Comentarios de la tabla clientes
COMMENT ON TABLE clientes IS 'Tabla para almacenar información de clientes de CHAMANA';
COMMENT ON COLUMN clientes.id IS 'Identificador único autoincremental del cliente';
COMMENT ON COLUMN clientes.nombre IS 'Nombre del cliente';
COMMENT ON COLUMN clientes.apellido IS 'Apellido del cliente';
COMMENT ON COLUMN clientes.email IS 'Correo electrónico único del cliente';
COMMENT ON COLUMN clientes.telefono IS 'Número de teléfono del cliente';
COMMENT ON COLUMN clientes.fecha_nacimiento IS 'Fecha de nacimiento del cliente';
COMMENT ON COLUMN clientes.genero IS 'Género del cliente (F=Femenino, M=Masculino, O=Otro)';
COMMENT ON COLUMN clientes.direccion IS 'Dirección completa del cliente';
COMMENT ON COLUMN clientes.ciudad IS 'Ciudad de residencia del cliente';
COMMENT ON COLUMN clientes.codigo_postal IS 'Código postal del cliente';
COMMENT ON COLUMN clientes.pais IS 'País de residencia del cliente';
COMMENT ON COLUMN clientes.fecha_registro IS 'Fecha y hora de registro del cliente';
COMMENT ON COLUMN clientes.activo IS 'Indica si el cliente está activo en el sistema';

-- =====================================================
-- TABLA: categorias
-- Propósito: Clasificar prendas de ropa femenina CHAMANA
-- =====================================================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    orden_display INTEGER DEFAULT 0
);

-- Comentarios de la tabla categorias
COMMENT ON TABLE categorias IS 'Tabla para clasificar prendas de ropa femenina CHAMANA';
COMMENT ON COLUMN categorias.id IS 'Identificador único autoincremental de la categoría';
COMMENT ON COLUMN categorias.nombre IS 'Nombre de la categoría de ropa';
COMMENT ON COLUMN categorias.descripcion IS 'Descripción detallada de la categoría';
COMMENT ON COLUMN categorias.imagen_url IS 'URL de la imagen representativa de la categoría';
COMMENT ON COLUMN categorias.activa IS 'Indica si la categoría está activa en el catálogo';
COMMENT ON COLUMN categorias.orden_display IS 'Orden de visualización en el catálogo';

-- =====================================================
-- TABLA: prendas
-- Propósito: Almacenar información de prendas de ropa femenina CHAMANA
-- =====================================================
CREATE TABLE prendas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    precio_original DECIMAL(10,2),
    categoria_id INTEGER REFERENCES categorias(id),
    talla VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    material VARCHAR(100),
    marca VARCHAR(50) DEFAULT 'CHAMANA',
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER DEFAULT 5,
    imagen_principal VARCHAR(255),
    imagenes_adicionales TEXT[], -- Array de URLs de imágenes
    etiquetas TEXT[], -- Array de etiquetas como 'nuevo', 'oferta', 'tendencia'
    activa BOOLEAN DEFAULT TRUE,
    destacada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de la tabla prendas
COMMENT ON TABLE prendas IS 'Tabla para almacenar información de prendas de ropa femenina CHAMANA';
COMMENT ON COLUMN prendas.id IS 'Identificador único autoincremental de la prenda';
COMMENT ON COLUMN prendas.nombre IS 'Nombre de la prenda';
COMMENT ON COLUMN prendas.descripcion IS 'Descripción detallada de la prenda';
COMMENT ON COLUMN prendas.precio IS 'Precio actual de la prenda';
COMMENT ON COLUMN prendas.precio_original IS 'Precio original antes de descuentos';
COMMENT ON COLUMN prendas.categoria_id IS 'Referencia a la categoría de la prenda';
COMMENT ON COLUMN prendas.talla IS 'Talla de la prenda (XS, S, M, L, XL, etc.)';
COMMENT ON COLUMN prendas.color IS 'Color principal de la prenda';
COMMENT ON COLUMN prendas.material IS 'Material de la prenda';
COMMENT ON COLUMN prendas.marca IS 'Marca de la prenda (por defecto CHAMANA)';
COMMENT ON COLUMN prendas.stock IS 'Cantidad disponible en inventario';
COMMENT ON COLUMN prendas.stock_minimo IS 'Stock mínimo antes de alerta';
COMMENT ON COLUMN prendas.imagen_principal IS 'URL de la imagen principal de la prenda';
COMMENT ON COLUMN prendas.imagenes_adicionales IS 'Array de URLs de imágenes adicionales';
COMMENT ON COLUMN prendas.etiquetas IS 'Array de etiquetas de la prenda';
COMMENT ON COLUMN prendas.activa IS 'Indica si la prenda está activa en el catálogo';
COMMENT ON COLUMN prendas.destacada IS 'Indica si la prenda es destacada';
COMMENT ON COLUMN prendas.fecha_creacion IS 'Fecha y hora de creación de la prenda';
COMMENT ON COLUMN prendas.fecha_actualizacion IS 'Fecha y hora de última actualización';

-- =====================================================
-- ÍNDICES
-- Propósito: Mejorar el rendimiento de consultas
-- =====================================================

-- Índice en email de clientes para búsquedas rápidas
CREATE INDEX idx_clientes_email ON clientes(email);

-- Índice en nombre de categorías para búsquedas
CREATE INDEX idx_categorias_nombre ON categorias(nombre);

-- Índice en categorías activas
CREATE INDEX idx_categorias_activa ON categorias(activa);

-- Índice en nombre de prendas para búsquedas
CREATE INDEX idx_prendas_nombre ON prendas(nombre);

-- Índice en precio de prendas para consultas por rango
CREATE INDEX idx_prendas_precio ON prendas(precio);

-- Índice en categoría de prendas para joins
CREATE INDEX idx_prendas_categoria ON prendas(categoria_id);

-- Índice en stock de prendas para consultas de inventario
CREATE INDEX idx_prendas_stock ON prendas(stock);

-- Índice en prendas activas
CREATE INDEX idx_prendas_activa ON prendas(activa);

-- Índice en prendas destacadas
CREATE INDEX idx_prendas_destacada ON prendas(destacada);

-- Índice en talla de prendas
CREATE INDEX idx_prendas_talla ON prendas(talla);

-- Índice en color de prendas
CREATE INDEX idx_prendas_color ON prendas(color);

-- =====================================================
-- VISTAS BÁSICAS
-- Propósito: Simplificar consultas comunes
-- =====================================================

-- Vista: Prendas con información de categoría
CREATE VIEW vista_prendas_categoria AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.precio_original,
    p.talla,
    p.color,
    p.material,
    p.marca,
    p.stock,
    p.stock_minimo,
    p.imagen_principal,
    p.etiquetas,
    p.activa,
    p.destacada,
    p.fecha_creacion,
    p.fecha_actualizacion,
    c.nombre as categoria_nombre,
    c.descripcion as categoria_descripcion,
    c.imagen_url as categoria_imagen
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id;

-- Comentario de la vista
COMMENT ON VIEW vista_prendas_categoria IS 'Vista que combina información de prendas con sus categorías';

-- Vista: Resumen de inventario por categoría
CREATE VIEW vista_inventario_categoria AS
SELECT 
    c.id as categoria_id,
    c.nombre as categoria,
    COUNT(p.id) as total_prendas,
    SUM(p.stock) as total_stock,
    AVG(p.precio) as precio_promedio,
    MIN(p.precio) as precio_minimo,
    MAX(p.precio) as precio_maximo,
    COUNT(CASE WHEN p.destacada = TRUE THEN 1 END) as prendas_destacadas
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id AND p.activa = TRUE
GROUP BY c.id, c.nombre;

-- Comentario de la vista
COMMENT ON VIEW vista_inventario_categoria IS 'Vista con resumen estadístico del inventario de prendas por categoría';

-- =====================================================
-- FUNCIONES BÁSICAS
-- Propósito: Funciones útiles para el sistema
-- =====================================================

-- Función: Obtener prendas por categoría
CREATE OR REPLACE FUNCTION obtener_prendas_por_categoria(categoria_nombre VARCHAR)
RETURNS TABLE (
    prenda_id INTEGER,
    prenda_nombre VARCHAR,
    precio DECIMAL,
    talla VARCHAR,
    color VARCHAR,
    stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.talla,
        p.color,
        p.stock
    FROM prendas p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE c.nombre ILIKE '%' || categoria_nombre || '%'
    AND p.activa = TRUE
    ORDER BY p.nombre;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION obtener_prendas_por_categoria(VARCHAR) IS 'Función para obtener prendas filtradas por nombre de categoría';

-- Función: Calcular valor total del inventario
CREATE OR REPLACE FUNCTION calcular_valor_inventario()
RETURNS DECIMAL AS $$
DECLARE
    valor_total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(precio * stock), 0)
    INTO valor_total
    FROM prendas
    WHERE activa = TRUE;
    
    RETURN valor_total;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION calcular_valor_inventario() IS 'Función para calcular el valor total del inventario de prendas (precio * stock)';

-- =====================================================
-- TRIGGERS BÁSICOS
-- Propósito: Automatizar tareas comunes
-- =====================================================

-- Función de trigger: Actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_creacion = OLD.fecha_creacion; -- Mantener fecha original
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar fecha de modificación en prendas
CREATE TRIGGER trigger_actualizar_prenda
    BEFORE UPDATE ON prendas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================
-- CONFIGURACIÓN FINAL
-- =====================================================

-- Configurar timezone
SET timezone = 'America/Mexico_City';

-- Mostrar información de las tablas creadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Mostrar información de las vistas creadas
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
