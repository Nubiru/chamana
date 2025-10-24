-- =====================================================
-- Migración DOWN - Fase 0: Comienzo
-- Proyecto: Sistema de Gestión de Productos
-- Fecha: 15 de Octubre, 2025
-- Versión: 0.1.0
-- Descripción: Revertir esquema inicial de la base de datos
-- =====================================================

-- Verificar si la base de datos existe
SELECT 'Revirtiendo esquema inicial de la base de datos...' as status;

-- =====================================================
-- ELIMINAR TRIGGERS
-- =====================================================

-- Eliminar trigger de productos
DROP TRIGGER IF EXISTS trigger_actualizar_producto ON productos;

-- =====================================================
-- ELIMINAR FUNCIONES
-- =====================================================

-- Eliminar función de actualización de fecha
DROP FUNCTION IF EXISTS actualizar_fecha_modificacion();

-- Eliminar función de productos por categoría
DROP FUNCTION IF EXISTS obtener_productos_por_categoria(VARCHAR);

-- Eliminar función de cálculo de inventario
DROP FUNCTION IF EXISTS calcular_valor_inventario();

-- =====================================================
-- ELIMINAR VISTAS
-- =====================================================

-- Eliminar vista de inventario por categoría
DROP VIEW IF EXISTS vista_inventario_categoria;

-- Eliminar vista de productos con categoría
DROP VIEW IF EXISTS vista_productos_categoria;

-- =====================================================
-- ELIMINAR ÍNDICES
-- =====================================================

-- Eliminar índices de productos
DROP INDEX IF EXISTS idx_productos_stock;
DROP INDEX IF EXISTS idx_productos_categoria;
DROP INDEX IF EXISTS idx_productos_precio;
DROP INDEX IF EXISTS idx_productos_nombre;

-- Eliminar índices de categorias
DROP INDEX IF EXISTS idx_categorias_nombre;

-- Eliminar índices de usuarios
DROP INDEX IF EXISTS idx_usuarios_email;

-- =====================================================
-- ELIMINAR TABLAS
-- =====================================================

-- Eliminar tabla productos (primero por las foreign keys)
DROP TABLE IF EXISTS productos CASCADE;

-- Eliminar tabla categorias
DROP TABLE IF EXISTS categorias CASCADE;

-- Eliminar tabla usuarios
DROP TABLE IF EXISTS usuarios CASCADE;

-- =====================================================
-- VERIFICACIÓN DE ROLLBACK
-- =====================================================

-- Verificar que no queden tablas
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar que no queden vistas
SELECT 
    schemaname,
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- Verificar que no queden funciones
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar que no queden índices
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DE MIGRACIÓN DOWN
-- =====================================================

SELECT 'Migración DOWN completada exitosamente' as status;
