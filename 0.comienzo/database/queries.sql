-- =====================================================
-- Consultas Comunes - Fase 0: Comienzo
-- Proyecto: CHAMANA - E-commerce de Ropa Femenina
-- Fecha: 15 de Octubre, 2025
-- Versión: 0.1.0
-- =====================================================

-- =====================================================
-- CONSULTAS BÁSICAS DE PRENDAS
-- =====================================================

-- 1. Listar todas las prendas con su categoría
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.talla,
    p.color,
    p.stock,
    c.nombre as categoria,
    p.fecha_creacion
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.nombre;

-- 2. Buscar prendas por nombre (búsqueda parcial)
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.talla,
    p.color,
    p.stock,
    c.nombre as categoria
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.nombre ILIKE '%vestido%'
ORDER BY p.precio;

-- 3. Prendas por rango de precio
SELECT 
    p.nombre,
    p.precio,
    p.talla,
    p.color,
    p.stock,
    c.nombre as categoria
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.precio BETWEEN 300.00 AND 800.00
ORDER BY p.precio;

-- 4. Prendas con stock bajo (menos de 10 unidades)
SELECT 
    p.nombre,
    p.talla,
    p.color,
    p.stock,
    c.nombre as categoria,
    p.precio
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.stock < 10
ORDER BY p.stock;

-- 5. Las 10 prendas más caras
SELECT 
    p.nombre,
    p.precio,
    p.talla,
    p.color,
    c.nombre as categoria,
    p.stock
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.precio DESC
LIMIT 10;

-- =====================================================
-- CONSULTAS DE CATEGORÍAS
-- =====================================================

-- 6. Contar prendas por categoría
SELECT 
    c.nombre as categoria,
    COUNT(p.id) as total_prendas,
    COALESCE(SUM(p.stock), 0) as total_stock,
    COALESCE(ROUND(AVG(p.precio), 2), 0) as precio_promedio
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
ORDER BY total_prendas DESC;

-- 7. Categorías sin prendas
SELECT 
    c.nombre as categoria,
    c.descripcion
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id
WHERE p.id IS NULL;

-- 8. Categorías con más de 5 prendas
SELECT 
    c.nombre as categoria,
    COUNT(p.id) as total_prendas
FROM categorias c
JOIN prendas p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
HAVING COUNT(p.id) > 5
ORDER BY total_prendas DESC;

-- =====================================================
-- CONSULTAS DE CLIENTES
-- =====================================================

-- 9. Listar todos los clientes ordenados por fecha de registro
SELECT 
    id,
    nombre,
    apellido,
    email,
    ciudad,
    fecha_registro
FROM clientes
ORDER BY fecha_registro DESC;

-- 10. Buscar clientes por nombre o email
SELECT 
    id,
    nombre,
    apellido,
    email,
    ciudad,
    fecha_registro
FROM clientes
WHERE nombre ILIKE '%maría%' OR email ILIKE '%gmail%'
ORDER BY nombre;

-- 11. Clientes registradas en los últimos 30 días
SELECT 
    nombre,
    apellido,
    email,
    ciudad,
    fecha_registro
FROM clientes
WHERE fecha_registro >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY fecha_registro DESC;

-- =====================================================
-- CONSULTAS ESTADÍSTICAS
-- =====================================================

-- 12. Estadísticas generales del inventario
SELECT 
    COUNT(*) as total_prendas,
    SUM(stock) as total_stock,
    ROUND(AVG(precio), 2) as precio_promedio,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo,
    SUM(precio * stock) as valor_total_inventario
FROM prendas;

-- 13. Prendas más vendidas (asumiendo que stock bajo = más vendidas)
SELECT 
    p.nombre,
    p.talla,
    p.color,
    p.stock,
    c.nombre as categoria,
    p.precio
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.stock < 15
ORDER BY p.stock, p.precio DESC;

-- 14. Distribución de precios por rangos
SELECT 
    CASE 
        WHEN precio < 20 THEN '0-20'
        WHEN precio < 50 THEN '20-50'
        WHEN precio < 100 THEN '50-100'
        WHEN precio < 200 THEN '100-200'
        ELSE '200+'
    END as rango_precio,
    COUNT(*) as cantidad_productos,
    ROUND(AVG(precio), 2) as precio_promedio
FROM prendas
GROUP BY 
    CASE 
        WHEN precio < 20 THEN '0-20'
        WHEN precio < 50 THEN '20-50'
        WHEN precio < 100 THEN '50-100'
        WHEN precio < 200 THEN '100-200'
        ELSE '200+'
    END
ORDER BY MIN(precio);

-- =====================================================
-- CONSULTAS CON FUNCIONES
-- =====================================================

-- 15. Usar función para obtener productos por categoría
SELECT * FROM obtener_productos_por_categoria('electrónicos');

-- 16. Calcular valor total del inventario usando función
SELECT calcular_valor_inventario() as valor_total_inventario;

-- =====================================================
-- CONSULTAS CON VISTAS
-- =====================================================

-- 17. Usar vista de productos con categoría
SELECT 
    producto_nombre,
    precio,
    stock,
    categoria_nombre
FROM vista_productos_categoria
WHERE precio > 100
ORDER BY precio DESC;

-- 18. Usar vista de inventario por categoría
SELECT 
    categoria,
    total_productos,
    total_stock,
    precio_promedio
FROM vista_inventario_categoria
WHERE total_productos > 0
ORDER BY total_stock DESC;

-- =====================================================
-- CONSULTAS DE ANÁLISIS
-- =====================================================

-- 19. Análisis de rentabilidad por categoría
SELECT 
    c.nombre as categoria,
    COUNT(p.id) as total_productos,
    ROUND(AVG(p.precio), 2) as precio_promedio,
    SUM(p.stock) as total_stock,
    ROUND(SUM(p.precio * p.stock), 2) as valor_inventario,
    ROUND(SUM(p.precio * p.stock) / COUNT(p.id), 2) as valor_por_producto
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
HAVING COUNT(p.id) > 0
ORDER BY valor_inventario DESC;

-- 20. Productos que necesitan reabastecimiento
SELECT 
    p.nombre,
    p.stock,
    c.nombre as categoria,
    p.precio,
    CASE 
        WHEN p.stock = 0 THEN 'SIN STOCK'
        WHEN p.stock < 5 THEN 'CRÍTICO'
        WHEN p.stock < 10 THEN 'BAJO'
        ELSE 'NORMAL'
    END as estado_stock
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.stock < 10
ORDER BY p.stock;

-- =====================================================
-- CONSULTAS DE MANTENIMIENTO
-- =====================================================

-- 21. Verificar integridad referencial
SELECT 
    p.id,
    p.nombre,
    p.categoria_id,
    c.nombre as categoria_valida
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.categoria_id IS NOT NULL AND c.id IS NULL;

-- 22. Productos sin categoría
SELECT 
    id,
    nombre,
    precio,
    stock
FROM prendas
WHERE categoria_id IS NULL;

-- 23. Verificar duplicados en emails de usuarios
SELECT 
    email,
    COUNT(*) as cantidad
FROM clientes
GROUP BY email
HAVING COUNT(*) > 1;

-- =====================================================
-- CONSULTAS DE REPORTES
-- =====================================================

-- 24. Reporte de inventario por categoría
SELECT 
    c.nombre as categoria,
    COUNT(p.id) as productos,
    SUM(p.stock) as unidades,
    ROUND(AVG(p.precio), 2) as precio_promedio,
    ROUND(SUM(p.precio * p.stock), 2) as valor_total
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
ORDER BY valor_total DESC;

-- 25. Reporte de usuarios por mes de registro
SELECT 
    EXTRACT(YEAR FROM fecha_registro) as año,
    EXTRACT(MONTH FROM fecha_registro) as mes,
    COUNT(*) as usuarios_registrados
FROM clientes
GROUP BY EXTRACT(YEAR FROM fecha_registro), EXTRACT(MONTH FROM fecha_registro)
ORDER BY año DESC, mes DESC;

-- =====================================================
-- CONSULTAS DE PRUEBA
-- =====================================================

-- 26. Probar rendimiento de consultas con EXPLAIN
EXPLAIN ANALYZE
SELECT 
    p.nombre,
    p.precio,
    c.nombre as categoria
FROM prendas p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.precio > 100
ORDER BY p.precio DESC;

-- 27. Verificar uso de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DE CONSULTAS COMUNES
-- =====================================================
