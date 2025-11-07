-- ============================================================================
-- Script 08: Demostración de 6 Tipos de JOIN
-- Phase 3 - CHAMANA Database
-- ============================================================================
--
-- Este archivo contiene ejemplos de los 6 tipos principales de JOIN en SQL:
-- 1. INNER JOIN
-- 2. LEFT JOIN (LEFT OUTER JOIN)
-- 3. RIGHT JOIN (RIGHT OUTER JOIN)
-- 4. FULL OUTER JOIN
-- 5. CROSS JOIN
-- 6. SELF JOIN
--
-- Ejecutar con: psql -U postgres -d chamana_db_fase3 -f 08_demo_joins.sql
-- ============================================================================

\echo '============================================================================'
\echo 'DEMOSTRACIÓN DE 6 TIPOS DE JOIN - CHAMANA Fase 3'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. INNER JOIN: Productos Vendidos Último Mes
-- ============================================================================
-- Muestra solo productos que SÍ se vendieron (intersección)
\echo '1. INNER JOIN: Productos Vendidos Último Mes'
\echo '   (Solo productos que SÍ se vendieron)'
\echo ''

SELECT DISTINCT
    p.id,
    p.nombre as producto,
    p.precio_chamana,
    c.nombre as categoria,
    SUM(pp.cantidad) as unidades_vendidas,
    COUNT(DISTINCT ped.id) as numero_pedidos,
    SUM(pp.subtotal) as ingresos_totales
FROM prendas p
INNER JOIN pedidos_prendas pp ON p.id = pp.prenda_id
INNER JOIN pedidos ped ON pp.pedido_id = ped.id
INNER JOIN categorias c ON p.categoria_id = c.id
WHERE ped.fecha_pedido >= CURRENT_DATE - INTERVAL '30 days'
    AND ped.estado = 'completado'
GROUP BY p.id, p.nombre, p.precio_chamana, c.nombre
ORDER BY ingresos_totales DESC
LIMIT 10;

\echo ''
\echo '---'
\echo ''

-- ============================================================================
-- 2. LEFT JOIN: Todos los Clientes (con o sin pedidos)
-- ============================================================================
-- Muestra TODOS los clientes, incluso los que no han comprado nada
\echo '2. LEFT JOIN: Todos los Clientes (con o sin pedidos)'
\echo '   (Incluye clientes sin compras)'
\echo ''

SELECT
    c.id,
    c.nombre || ' ' || c.apellido as cliente,
    c.email,
    COUNT(p.id) as total_pedidos,
    COALESCE(SUM(p.total), 0) as total_gastado,
    COALESCE(MAX(p.fecha_pedido), c.fecha_registro) as ultima_actividad,
    CASE
        WHEN COUNT(p.id) = 0 THEN 'Cliente Nuevo (sin compras)'
        WHEN MAX(p.fecha_pedido) < CURRENT_DATE - INTERVAL '90 days' THEN 'Cliente Inactivo'
        WHEN COUNT(p.id) >= 5 THEN 'Cliente VIP'
        ELSE 'Cliente Activo'
    END as estado_cliente
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id AND p.estado = 'completado'
WHERE c.activo = TRUE
GROUP BY c.id, c.nombre, c.apellido, c.email, c.fecha_registro
ORDER BY total_gastado DESC
LIMIT 10;

\echo ''
\echo '---'
\echo ''

-- ============================================================================
-- 3. RIGHT JOIN: Todas las Categorías (con o sin productos)
-- ============================================================================
-- Muestra TODAS las categorías, incluso las vacías
\echo '3. RIGHT JOIN: Todas las Categorías (con o sin productos)'
\echo '   (Incluye categorías sin productos)'
\echo ''

SELECT
    c.id,
    c.nombre as categoria,
    c.descripcion,
    COUNT(p.id) as total_productos,
    COALESCE(SUM(p.stock_disponible), 0) as stock_total,
    COALESCE(SUM(p.stock_vendido), 0) as unidades_vendidas,
    CASE
        WHEN COUNT(p.id) = 0 THEN 'Sin productos'
        WHEN COUNT(p.id) < 5 THEN 'Categoría pequeña'
        ELSE 'Categoría activa'
    END as estado_categoria
FROM prendas p
RIGHT JOIN categorias c ON p.categoria_id = c.id AND p.activa = TRUE
GROUP BY c.id, c.nombre, c.descripcion
ORDER BY total_productos DESC;

\echo ''
\echo '---'
\echo ''

-- ============================================================================
-- 4. FULL OUTER JOIN: Matriz Completa Telas-Temporadas
-- ============================================================================
-- Muestra TODAS las combinaciones posibles, incluso las que no existen
\echo '4. FULL OUTER JOIN: Matriz Completa Telas-Temporadas'
\echo '   (Todas las combinaciones posibles)'
\echo ''

SELECT
    COALESCE(t.nombre, '(Sin Tela)') as tela,
    COALESCE(t.tipo, '-') as tipo_tela,
    COALESCE(temp.nombre, '(Sin Temporada)') as temporada,
    CASE
        WHEN tt.id IS NOT NULL THEN '✓ Disponible'
        ELSE '✗ No Disponible'
    END as disponibilidad,
    COUNT(p.id) as productos_usando_combinacion
FROM telas t
FULL OUTER JOIN telas_temporadas tt ON t.id = tt.tela_id
FULL OUTER JOIN temporadas temp ON tt.temporada_id = temp.id
LEFT JOIN prendas p ON p.tela_id = t.id
GROUP BY t.nombre, t.tipo, temp.nombre, tt.id
ORDER BY tela, temporada
LIMIT 15;

\echo ''
\echo '---'
\echo ''

-- ============================================================================
-- 5. CROSS JOIN: Planificación de Productos (Combinaciones Posibles)
-- ============================================================================
-- Genera TODAS las combinaciones posibles para planificación
\echo '5. CROSS JOIN: Planificación de Productos (Combinaciones Posibles)'
\echo '   (Todas las combinaciones categoría-diseño-tela)'
\echo ''

SELECT
    c.nombre as categoria,
    d.nombre as diseno,
    t.nombre as tela,
    COUNT(p.id) as ya_existe
FROM categorias c
CROSS JOIN disenos d
CROSS JOIN telas t
LEFT JOIN prendas p ON p.categoria_id = c.id 
    AND p.diseno_id = d.id 
    AND p.tela_id = t.id
GROUP BY c.nombre, d.nombre, t.nombre
HAVING COUNT(p.id) = 0  -- Solo combinaciones que NO existen
ORDER BY categoria, diseno, tela
LIMIT 10;

\echo ''
\echo '---'
\echo ''

-- ============================================================================
-- 6. SELF JOIN: Productos Relacionados (Misma Categoría)
-- ============================================================================
-- Compara productos entre sí dentro de la misma categoría
\echo '6. SELF JOIN: Productos Relacionados (Misma Categoría)'
\echo '   (Compara productos de la misma categoría)'
\echo ''

SELECT
    p1.id as producto1_id,
    p1.nombre as producto1,
    p1.precio_chamana as precio1,
    p1.stock_disponible as stock1,
    p2.id as producto2_id,
    p2.nombre as producto2,
    p2.precio_chamana as precio2,
    p2.stock_disponible as stock2,
    c.nombre as categoria_comun,
    CASE
        WHEN p1.precio_chamana > p2.precio_chamana THEN 'Producto 1 más caro'
        WHEN p1.precio_chamana < p2.precio_chamana THEN 'Producto 2 más caro'
        ELSE 'Mismo precio'
    END as comparacion_precio
FROM prendas p1
INNER JOIN prendas p2 ON p1.categoria_id = p2.categoria_id
INNER JOIN categorias c ON p1.categoria_id = c.id
WHERE p1.id < p2.id  -- Evita duplicados y auto-joins
    AND p1.activa = TRUE
    AND p2.activa = TRUE
ORDER BY categoria_comun, p1.nombre
LIMIT 10;

\echo ''
\echo '============================================================================'
\echo 'DEMOSTRACIÓN COMPLETA - 6 TIPOS DE JOIN EJECUTADOS'
\echo '============================================================================'

