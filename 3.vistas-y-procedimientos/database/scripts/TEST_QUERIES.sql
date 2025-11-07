-- =====================================================
-- PLAN 7: Test Queries for Database Verification
-- =====================================================
-- Run these queries in pgAdmin to verify Phase 3 implementation
-- Copy and paste each section as needed

-- =====================================================
-- TEST 1.1: Verify All 19 Tables Exist
-- =====================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 19 tables
-- Phase 2 (12): clientes, categorias, disenos, telas, años, temporadas, 
--               colecciones, prendas, pedidos, pedidos_prendas, 
--               telas_temporadas, movimientos_inventario
-- Phase 3 (7): direcciones, tipos_prenda, estados_pedido, 
--              historial_estados_pedido, proveedores, telas_proveedores, 
--              metodos_pago

-- =====================================================
-- TEST 1.2: Verify All 5 Views Execute
-- =====================================================
-- Test each view
SELECT COUNT(*) as total FROM vista_ventas_mensuales;
SELECT COUNT(*) as total FROM vista_inventario_critico;
SELECT COUNT(*) as total FROM vista_top_productos;
SELECT COUNT(*) as total FROM vista_analisis_clientes;
SELECT COUNT(*) as total FROM vista_rotacion_inventario;

-- Expected: Each returns a count (0 or more), no errors

-- =====================================================
-- TEST 1.3: Test Stored Procedures
-- =====================================================
-- Note: Adjust parameters based on your actual data

-- Test procesar_pedido
-- SELECT procesar_pedido(
--     p_cliente_id := 1,
--     p_items := '[{"prenda_id": 1, "cantidad": 2}]'::JSONB,
--     p_descuento := 0
-- );

-- Test reabastecer_inventario
-- SELECT reabastecer_inventario(
--     p_prenda_id := 1,
--     p_cantidad := 10
-- );

-- Test calcular_comision_vendedor
-- SELECT calcular_comision_vendedor(
--     p_fecha_inicio := '2025-11-01'::DATE,
--     p_fecha_fin := '2025-11-30'::DATE,
--     p_porcentaje_comision := 5.0
-- );

-- Expected: Each procedure executes without error

-- =====================================================
-- TEST 1.4: Test Triggers
-- =====================================================
-- Test trigger_track_order_state
-- First, check current state
SELECT id, estado_id FROM pedidos WHERE id = 1;

-- Update order state (trigger should fire)
-- UPDATE pedidos SET estado_id = 2 WHERE id = 1;

-- Verify trigger created history record
SELECT * FROM historial_estados_pedido 
WHERE pedido_id = 1 
ORDER BY fecha_cambio DESC 
LIMIT 1;

-- Expected: New record in historial_estados_pedido with recent timestamp

-- =====================================================
-- TEST 1.5: Verify Real CHAMANA Data
-- =====================================================
-- Count designs (should be 27)
SELECT COUNT(*) as total_disenos FROM disenos;
-- Expected: 27

-- Count fabrics (should be 38)
SELECT COUNT(*) as total_telas FROM telas;
-- Expected: 38

-- Count collections (should be 2)
SELECT COUNT(*) as total_colecciones FROM colecciones;
-- Expected: 2

-- Verify design counts per collection
SELECT 
    c.nombre as coleccion,
    COUNT(d.id) as total_designs
FROM colecciones c
LEFT JOIN disenos d ON d.coleccion_id = c.id
GROUP BY c.nombre
ORDER BY c.nombre;
-- Expected: Tierra (16), Magia (11)

-- =====================================================
-- TEST 1.6: Test Foreign Key Constraints
-- =====================================================
-- This should FAIL (invalid foreign key)
-- INSERT INTO prendas (
--     nombre, 
--     diseno_id, 
--     tela_id, 
--     categoria_id, 
--     precio_chamana, 
--     stock_inicial
-- )
-- VALUES ('Test Garment', 99999, 1, 1, 10000, 10);

-- Expected: ERROR - foreign key constraint violation
-- If it succeeds, there's a problem with FK constraints

-- =====================================================
-- TEST 1.7: Verify Views Return Data
-- =====================================================
-- Sample data from each view
SELECT * FROM vista_ventas_mensuales LIMIT 5;
SELECT * FROM vista_inventario_critico LIMIT 5;
SELECT * FROM vista_top_productos LIMIT 5;
SELECT * FROM vista_analisis_clientes LIMIT 5;
SELECT * FROM vista_rotacion_inventario LIMIT 5;

-- Expected: Each view returns data (or empty table if no data, but no errors)

-- =====================================================
-- TEST: Verify 3NF Normalization
-- =====================================================
-- Check that direcciones table has data (migrated from clientes)
SELECT COUNT(*) as total_direcciones FROM direcciones;

-- Check that estados_pedido table has data
SELECT codigo, nombre FROM estados_pedido ORDER BY orden_workflow;

-- Check that tipos_prenda table has data
SELECT nombre, subcategoria FROM tipos_prenda ORDER BY nombre;

-- Check that proveedores table has data
SELECT nombre, ciudad FROM proveedores;

-- Check that metodos_pago table has data
SELECT codigo, nombre, tipo FROM metodos_pago;

-- =====================================================
-- TEST: Performance Check
-- =====================================================
-- Check query execution time for complex view
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales;

-- Expected: Execution time < 100ms, reasonable query plan

-- =====================================================
-- TEST: Data Integrity Check
-- =====================================================
-- Check for orphaned records (should return 0)
SELECT COUNT(*) as orphaned_disenos
FROM disenos d
LEFT JOIN colecciones c ON d.coleccion_id = c.id
WHERE d.coleccion_id IS NOT NULL AND c.id IS NULL;

SELECT COUNT(*) as orphaned_prendas
FROM prendas p
LEFT JOIN disenos d ON p.diseno_id = d.id
WHERE p.diseno_id IS NOT NULL AND d.id IS NULL;

-- Expected: 0 orphaned records (all foreign keys valid)

-- =====================================================
-- END OF TEST QUERIES
-- =====================================================

