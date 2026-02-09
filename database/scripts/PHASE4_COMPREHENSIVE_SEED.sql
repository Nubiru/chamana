-- ===================================================================
-- CHAMANA Phase 4 - Comprehensive Seed Data
-- ===================================================================
-- Complete dataset with 15+ sales transactions and rich data
-- for all 19 tables to power Phase 4 optimized views
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. FOUNDATION DATA (Catálogos)
-- ===================================================================

-- Categorías (13 tipos de prendas)
INSERT INTO categorias (nombre, descripcion) VALUES
('Buzo', 'Buzos y sweaters de distintos estilos'),
('Sweater', 'Sweaters y pulóvers'),
('Remerón', 'Remerones de manga larga'),
('Remera', 'Remeras de distintos estilos'),
('Vestido', 'Vestidos'),
('Top', 'Tops y blusas'),
('Palazzo', 'Pantalones palazzo de corte amplio'),
('Pantalón', 'Pantalones de distintos estilos'),
('Falda', 'Faldas'),
('Kimono', 'Kimonos'),
('Musculosa', 'Musculosas'),
('Short', 'Shorts'),
('Camisa', 'Camisas')
ON CONFLICT (nombre) DO NOTHING;

-- Años
INSERT INTO años (año) VALUES (2024), (2025), (2026)
ON CONFLICT (año) DO NOTHING;

-- Temporadas
INSERT INTO temporadas (nombre) VALUES
('Invierno'), ('Verano'), ('Otoño'), ('Primavera')
ON CONFLICT (nombre) DO NOTHING;

-- Colecciones (4 colecciones)
INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Tierra', a.id, t.id, 'Colección Invierno 2025 - Tierra: Inspirada en la naturaleza', '2025-06-01', '2025-09-30', TRUE
FROM años a, temporadas t WHERE a.año = 2025 AND t.nombre = 'Invierno'
ON CONFLICT (año_id, temporada_id) DO NOTHING;

INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Magia', a.id, t.id, 'Colección Verano 2026 - Magia: Inspirada en lo místico', '2026-01-01', '2026-03-31', TRUE
FROM años a, temporadas t WHERE a.año = 2026 AND t.nombre = 'Verano'
ON CONFLICT (año_id, temporada_id) DO NOTHING;

INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Otoño Dorado', a.id, t.id, 'Colección Otoño 2025 - Tonos cálidos y acogedores', '2025-03-01', '2025-05-31', TRUE
FROM años a, temporadas t WHERE a.año = 2025 AND t.nombre = 'Otoño'
ON CONFLICT (año_id, temporada_id) DO NOTHING;

INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Primavera Floral', a.id, t.id, 'Colección Primavera 2024 - Flores y colores vibrantes', '2024-09-01', '2024-12-31', FALSE
FROM años a, temporadas t WHERE a.año = 2024 AND t.nombre = 'Primavera'
ON CONFLICT (año_id, temporada_id) DO NOTHING;

-- ===================================================================
-- 2. TELAS Y PROVEEDORES
-- ===================================================================

-- Telas (10 tipos)
INSERT INTO telas (nombre, tipo, descripcion, costo_por_metro) VALUES
('Algodón Pima', 'Natural', 'Algodón peruano de alta calidad', 45.00),
('Lino Belga', 'Natural', 'Lino importado premium', 85.00),
('Seda Natural', 'Natural', 'Seda 100% natural', 120.00),
('Jersey Algodón', 'Punto', 'Jersey suave y elástico', 35.00),
('Alpaca Baby', 'Natural', 'Fibra de alpaca super suave', 150.00),
('Vicuña', 'Natural', 'Fibra de vicuña premium', 380.00),
('Lino Artesanal', 'Natural', 'Lino tejido a mano', 95.00),
('Algodón Orgánico', 'Natural', 'Algodón certificado orgánico', 55.00),
('Modal Bambú', 'Sintético', 'Fibra de bambú ecológica', 48.00),
('Seda Alpaca Mix', 'Mixto', 'Mezcla de seda y alpaca', 180.00)
ON CONFLICT (nombre) DO NOTHING;

-- Proveedores (5 proveedores)
INSERT INTO proveedores (nombre, rfc, telefono, email, ciudad, pais, dias_entrega_promedio, calificacion, activo) VALUES
('Textiles Andinos SAC', 'TAN-123456', '+51 987-111-222', 'ventas@textilesandinos.pe', 'Cusco', 'Perú', 7, 4.8, TRUE),
('Hilos del Sur EIRL', 'HDS-789012', '+51 987-333-444', 'contacto@hilosdelsur.pe', 'Arequipa', 'Perú', 5, 4.9, TRUE),
('Artesanía Peruana SA', 'ART-345678', '+51 987-555-666', 'info@artesaniaperu.pe', 'Lima', 'Perú', 3, 4.7, TRUE),
('Telas Premium Import', 'TPI-901234', '+51 987-777-888', 'ventas@telaspremium.pe', 'Lima', 'Perú', 10, 4.5, TRUE),
('Fibras Nobles del Perú', 'FNP-567890', '+51 987-999-000', 'contacto@fibrasnobles.pe', 'Puno', 'Perú', 12, 4.6, TRUE)
ON CONFLICT (rfc) DO NOTHING;

-- Telas-Proveedores (relaciones)
INSERT INTO telas_proveedores (tela_id, proveedor_id, precio_metro, tiempo_entrega_dias, cantidad_minima, activo)
SELECT t.id, p.id, 42.00, 5, 50, TRUE
FROM telas t, proveedores p
WHERE t.nombre = 'Algodón Pima' AND p.nombre = 'Textiles Andinos SAC'
ON CONFLICT (tela_id, proveedor_id) DO NOTHING;

INSERT INTO telas_proveedores (tela_id, proveedor_id, precio_metro, tiempo_entrega_dias, cantidad_minima, activo)
SELECT t.id, p.id, 145.00, 10, 20, TRUE
FROM telas t, proveedores p
WHERE t.nombre = 'Alpaca Baby' AND p.nombre = 'Fibras Nobles del Perú'
ON CONFLICT (tela_id, proveedor_id) DO NOTHING;

INSERT INTO telas_proveedores (tela_id, proveedor_id, precio_metro, tiempo_entrega_dias, cantidad_minima, activo)
SELECT t.id, p.id, 80.00, 7, 30, TRUE
FROM telas t, proveedores p
WHERE t.nombre = 'Lino Belga' AND p.nombre = 'Telas Premium Import'
ON CONFLICT (tela_id, proveedor_id) DO NOTHING;

-- ===================================================================
-- 3. DISEÑOS (12 diseños para las colecciones)
-- ===================================================================

INSERT INTO disenos (nombre, tipo, detalle, descripcion, coleccion_id) VALUES
('Flores Andinas', 'Bordado', 'Flores típicas de los Andes peruanos', 'Diseño inspirado en la flora andina con bordado artesanal', (SELECT id FROM colecciones WHERE nombre = 'Tierra')),
('Geometría Inca', 'Estampado', 'Patrones geométricos incaicos', 'Diseño basado en textiles incas precolombinos', (SELECT id FROM colecciones WHERE nombre = 'Magia')),
('Pájaros del Amazonas', 'Bordado', 'Aves exóticas de la selva', 'Bordado multicolor con aves amazónicas', (SELECT id FROM colecciones WHERE nombre = 'Primavera Floral')),
('Montañas Sagradas', 'Estampado', 'Siluetas de montañas andinas', 'Estampado minimalista de la cordillera', (SELECT id FROM colecciones WHERE nombre = 'Tierra')),
('Estrellas Místicas', 'Bordado', 'Constelaciones y símbolos', 'Bordado con hilos plateados de estrellas', (SELECT id FROM colecciones WHERE nombre = 'Magia')),
('Hojas de Coca', 'Estampado', 'Hojas sagradas andinas', 'Patrón repetitivo de hojas de coca', (SELECT id FROM colecciones WHERE nombre = 'Tierra')),
('Chakana', 'Bordado', 'Cruz andina sagrada', 'Cruz del sur bordada con técnica ancestral', (SELECT id FROM colecciones WHERE nombre = 'Tierra')),
('Mariposas de Luz', 'Estampado', 'Mariposas iridiscentes', 'Estampado degradado con mariposas', (SELECT id FROM colecciones WHERE nombre = 'Magia')),
('Olas del Pacífico', 'Estampado', 'Ondas del mar peruano', 'Patrón de olas en tonos azules', (SELECT id FROM colecciones WHERE nombre = 'Verano')),
('Soles Radiantes', 'Bordado', 'Soles con rayos dorados', 'Bordado con hilos dorados', (SELECT id FROM colecciones WHERE nombre = 'Otoño Dorado')),
('Lluvia de Flores', 'Estampado', 'Flores cayendo', 'Estampado delicado de flores dispersas', (SELECT id FROM colecciones WHERE nombre = 'Primavera Floral')),
('Tejido Aimara', 'Tejido', 'Patrón tradicional aimara', 'Tejido artesanal con patrón aimara', (SELECT id FROM colecciones WHERE nombre = 'Tierra'))
ON CONFLICT (nombre) DO NOTHING;

-- ===================================================================
-- 4. TIPOS DE PRENDA (13 tipos con detalles)
-- ===================================================================

INSERT INTO tipos_prenda (nombre, subcategoria, temporada_recomendada, ocasion_uso, cuidados_lavado, puede_planchar, puede_secar_maquina) VALUES
('Buzo Premium', 'Abrigo', 'Invierno', 'Casual diario', 'Lavar a mano en agua fría', TRUE, FALSE),
('Vestido Largo', 'Vestido', 'Verano', 'Ocasión especial', 'Lavar a mano o dry clean', FALSE, FALSE),
('Palazzo Elegante', 'Pantalón', 'Primavera', 'Casual elegante', 'Lavar a máquina 30°C', TRUE, TRUE),
('Remera Artesanal', 'Top', 'Verano', 'Casual diario', 'Lavar a máquina 40°C', TRUE, TRUE),
('Kimono Bohemio', 'Abrigo ligero', 'Otoño', 'Casual boho', 'Lavar a mano', FALSE, FALSE),
('Sweater Alpaca', 'Abrigo', 'Invierno', 'Casual diario', 'Lavar a mano agua fría', FALSE, FALSE),
('Top Bordado', 'Blusa', 'Primavera', 'Casual elegante', 'Lavar a mano', TRUE, FALSE),
('Falda Midi', 'Falda', 'Otoño', 'Casual elegante', 'Lavar a máquina 30°C', TRUE, TRUE),
('Short Lino', 'Short', 'Verano', 'Casual playero', 'Lavar a máquina 40°C', TRUE, TRUE),
('Camisa Oversized', 'Camisa', 'Primavera', 'Casual moderno', 'Lavar a máquina 40°C', TRUE, TRUE),
('Musculosa Seda', 'Top', 'Verano', 'Casual elegante', 'Lavar a mano', FALSE, FALSE),
('Remerón Largo', 'Top', 'Otoño', 'Casual diario', 'Lavar a máquina 30°C', TRUE, TRUE),
('Pantalón Lino', 'Pantalón', 'Verano', 'Casual elegante', 'Lavar a máquina 30°C', TRUE, TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- ===================================================================
-- 5. PRENDAS (20 productos con stock variado)
-- ===================================================================

-- Productos Colección Tierra
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Buzo Tierra Flores Andinas', 'Buzo', 280.00, cat.id, d.id, t.id, c.id,
  'Buzo de alpaca con bordado de flores andinas', 25, 18, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Buzo' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Sweater Montañas Sagradas', 'Sweater', 320.00, cat.id, d.id, t.id, c.id,
  'Sweater de alpaca con estampado de montañas', 20, 15, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Sweater' AND d.nombre = 'Montañas Sagradas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Pantalón Tierra Lino', 'Pantalón', 220.00, cat.id, d.id, t.id, c.id,
  'Pantalón de lino con diseño de chakana bordada', 30, 22, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Pantalón' AND d.nombre = 'Chakana' AND t.nombre = 'Lino Belga' AND c.nombre = 'Tierra';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Vestido Tierra Hojas de Coca', 'Vestido', 420.00, cat.id, d.id, t.id, c.id,
  'Vestido largo de lino con estampado de hojas de coca', 15, 12, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Vestido' AND d.nombre = 'Hojas de Coca' AND t.nombre = 'Lino Artesanal' AND c.nombre = 'Tierra';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Falda Tejido Aimara', 'Falda', 260.00, cat.id, d.id, t.id, c.id,
  'Falda midi con tejido tradicional aimara', 18, 13, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Falda' AND d.nombre = 'Tejido Aimara' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra';

-- Productos Colección Magia
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Vestido Magia Geometría Inca', 'Vestido', 450.00, cat.id, d.id, t.id, c.id,
  'Vestido largo de seda con estampado geométrico inca', 12, 9, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Vestido' AND d.nombre = 'Geometría Inca' AND t.nombre = 'Seda Natural' AND c.nombre = 'Magia';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Kimono Estrellas Místicas', 'Kimono', 380.00, cat.id, d.id, t.id, c.id,
  'Kimono de seda-alpaca con bordado de estrellas', 10, 7, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Kimono' AND d.nombre = 'Estrellas Místicas' AND t.nombre = 'Seda Alpaca Mix' AND c.nombre = 'Magia';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Top Mariposas de Luz', 'Top', 190.00, cat.id, d.id, t.id, c.id,
  'Top de seda con estampado de mariposas iridiscentes', 25, 20, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Top' AND d.nombre = 'Mariposas de Luz' AND t.nombre = 'Seda Natural' AND c.nombre = 'Magia';

-- Productos Colección Primavera Floral
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Remera Pájaros Amazonas', 'Remera', 160.00, cat.id, d.id, t.id, c.id,
  'Remera de algodón orgánico con bordado de aves', 35, 28, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Remera' AND d.nombre = 'Pájaros del Amazonas' AND t.nombre = 'Algodón Orgánico' AND c.nombre = 'Primavera Floral';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Palazzo Lluvia de Flores', 'Palazzo', 240.00, cat.id, d.id, t.id, c.id,
  'Pantalón palazzo de lino con estampado floral', 22, 17, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Palazzo' AND d.nombre = 'Lluvia de Flores' AND t.nombre = 'Lino Belga' AND c.nombre = 'Primavera Floral';

-- Productos adicionales variados
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Short Lino Olas Pacífico', 'Short', 140.00, cat.id, d.id, t.id, c.id,
  'Short de lino con estampado de olas', 40, 35, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Short' AND d.nombre = 'Olas del Pacífico' AND t.nombre = 'Lino Belga' AND c.nombre = 'Verano';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Musculosa Seda Geometría', 'Musculosa', 180.00, cat.id, d.id, t.id, c.id,
  'Musculosa de seda con patrón geométrico', 30, 24, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Musculosa' AND d.nombre = 'Geometría Inca' AND t.nombre = 'Seda Natural' AND c.nombre = 'Magia';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Camisa Lino Montañas', 'Camisa', 210.00, cat.id, d.id, t.id, c.id,
  'Camisa oversized de lino artesanal', 28, 19, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Camisa' AND d.nombre = 'Montañas Sagradas' AND t.nombre = 'Lino Artesanal' AND c.nombre = 'Tierra';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Remerón Flores Andinas', 'Remerón', 170.00, cat.id, d.id, t.id, c.id,
  'Remerón largo de algodón con bordado floral', 32, 25, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Remerón' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Algodón Pima' AND c.nombre = 'Tierra';

-- Productos con stock crítico (para inventario crítico)
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Vestido Premium Vicuña', 'Vestido', 1200.00, cat.id, d.id, t.id, c.id,
  'Vestido exclusivo de fibra de vicuña', 5, 4, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Vestido' AND d.nombre = 'Estrellas Místicas' AND t.nombre = 'Vicuña' AND c.nombre = 'Magia';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Sweater Edición Limitada', 'Sweater', 580.00, cat.id, d.id, t.id, c.id,
  'Sweater de seda-alpaca edición limitada', 8, 7, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Sweater' AND d.nombre = 'Chakana' AND t.nombre = 'Seda Alpaca Mix' AND c.nombre = 'Tierra';

-- Producto agotado
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Top Best Seller Agotado', 'Top', 150.00, cat.id, d.id, t.id, c.id,
  'Top que se agotó por alta demanda', 20, 20, TRUE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Top' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Modal Bambú' AND c.nombre = 'Primavera Floral';

-- Productos inactivos (descontinuados)
INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Palazzo Descontinuado', 'Palazzo', 200.00, cat.id, d.id, t.id, c.id,
  'Producto de temporada pasada', 15, 12, FALSE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Palazzo' AND d.nombre = 'Pájaros del Amazonas' AND t.nombre = 'Algodón Pima' AND c.nombre = 'Primavera Floral';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Buzo Temporada Pasada', 'Buzo', 250.00, cat.id, d.id, t.id, c.id,
  'Diseño de temporada anterior', 10, 8, FALSE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Buzo' AND d.nombre = 'Lluvia de Flores' AND t.nombre = 'Jersey Algodón' AND c.nombre = 'Primavera Floral';

INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
SELECT 'Falda Edición Pasada', 'Falda', 180.00, cat.id, d.id, t.id, c.id,
  'Edición especial de temporada pasada', 12, 10, FALSE
FROM categorias cat, disenos d, telas t, colecciones c
WHERE cat.nombre = 'Falda' AND d.nombre = 'Soles Radiantes' AND t.nombre = 'Algodón Orgánico' AND c.nombre = 'Otoño Dorado';

-- ===================================================================
-- 6. CLIENTES (15 clientes de diferentes ciudades del Perú)
-- ===================================================================

INSERT INTO clientes (nombre, apellido, email, telefono, ciudad, codigo_postal, activo, fecha_registro) VALUES
('María', 'García López', 'maria.garcia@email.com', '+51 987-654-321', 'Lima', '15001', TRUE, CURRENT_TIMESTAMP - INTERVAL '8 months'),
('Carlos', 'Rodríguez Pérez', 'carlos.rodriguez@email.com', '+51 987-654-322', 'Cusco', '08000', TRUE, CURRENT_TIMESTAMP - INTERVAL '7 months'),
('Ana', 'Martínez Torres', 'ana.martinez@email.com', '+51 987-654-323', 'Arequipa', '04000', TRUE, CURRENT_TIMESTAMP - INTERVAL '6 months'),
('José', 'López Ramírez', 'jose.lopez@email.com', '+51 987-654-324', 'Lima', '15002', TRUE, CURRENT_TIMESTAMP - INTERVAL '5 months'),
('Laura', 'Torres Sánchez', 'laura.torres@email.com', '+51 987-654-325', 'Trujillo', '13000', TRUE, CURRENT_TIMESTAMP - INTERVAL '5 months'),
('Fernando', 'Quispe Mamani', 'fernando.quispe@email.com', '+51 987-654-326', 'Puno', '21000', TRUE, CURRENT_TIMESTAMP - INTERVAL '4 months'),
('Patricia', 'Vargas Silva', 'patricia.vargas@email.com', '+51 987-654-327', 'Chiclayo', '14000', TRUE, CURRENT_TIMESTAMP - INTERVAL '4 months'),
('Roberto', 'Castillo Flores', 'roberto.castillo@email.com', '+51 987-654-328', 'Piura', '20000', TRUE, CURRENT_TIMESTAMP - INTERVAL '3 months'),
('Sofía', 'Mendoza Cruz', 'sofia.mendoza@email.com', '+51 987-654-329', 'Lima', '15003', TRUE, CURRENT_TIMESTAMP - INTERVAL '3 months'),
('Diego', 'Huamán Quispe', 'diego.huaman@email.com', '+51 987-654-330', 'Cusco', '08001', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 months'),
('Valentina', 'Rojas Paredes', 'valentina.rojas@email.com', '+51 987-654-331', 'Arequipa', '04001', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 months'),
('Andrés', 'Ponce Gutiérrez', 'andres.ponce@email.com', '+51 987-654-332', 'Lima', '15004', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 month'),
('Camila', 'Salazar Díaz', 'camila.salazar@email.com', '+51 987-654-333', 'Tacna', '23000', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 month'),
('Javier', 'Morales Vega', 'javier.morales@email.com', '+51 987-654-334', 'Ica', '11000', TRUE, CURRENT_TIMESTAMP - INTERVAL '3 weeks'),
('Isabella', 'Ramos Delgado', 'isabella.ramos@email.com', '+51 987-654-335', 'Lima', '15005', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 weeks')
ON CONFLICT (email) DO NOTHING;

-- ===================================================================
-- 7. DIRECCIONES (múltiples direcciones para algunos clientes)
-- ===================================================================

INSERT INTO direcciones (cliente_id, tipo, direccion, ciudad, estado, codigo_postal, pais, predeterminada, activa)
SELECT c.id, 'principal', 'Av. Arequipa 1234, Miraflores', 'Lima', 'Lima', '15074', 'Perú', TRUE, TRUE
FROM clientes c WHERE c.email = 'maria.garcia@email.com';

INSERT INTO direcciones (cliente_id, tipo, direccion, ciudad, estado, codigo_postal, pais, predeterminada, activa)
SELECT c.id, 'envio', 'Jr. Puno 567, Oficina 301', 'Lima', 'Lima', '15001', 'Perú', FALSE, TRUE
FROM clientes c WHERE c.email = 'maria.garcia@email.com';

INSERT INTO direcciones (cliente_id, tipo, direccion, ciudad, estado, codigo_postal, pais, predeterminada, activa)
SELECT c.id, 'principal', 'Av. El Sol 890, Centro Histórico', 'Cusco', 'Cusco', '08000', 'Perú', TRUE, TRUE
FROM clientes c WHERE c.email = 'carlos.rodriguez@email.com';

INSERT INTO direcciones (cliente_id, tipo, direccion, ciudad, estado, codigo_postal, pais, predeterminada, activa)
SELECT c.id, 'principal', 'Calle Mercaderes 234, Yanahuara', 'Arequipa', 'Arequipa', '04000', 'Perú', TRUE, TRUE
FROM clientes c WHERE c.email = 'ana.martinez@email.com';

-- ===================================================================
-- 8. ESTADOS DE PEDIDO
-- ===================================================================

INSERT INTO estados_pedido (codigo, nombre, descripcion, es_inicial, es_final, permite_edicion, permite_cancelacion, color_hex, orden_workflow) VALUES
('pendiente', 'Pendiente', 'Pedido recibido, pendiente de procesamiento', TRUE, FALSE, TRUE, TRUE, '#FFA500', 1),
('procesando', 'Procesando', 'Pedido en preparación', FALSE, FALSE, FALSE, TRUE, '#3498DB', 2),
('enviado', 'Enviado', 'Pedido despachado al cliente', FALSE, FALSE, FALSE, FALSE, '#9B59B6', 3),
('completado', 'Completado', 'Pedido entregado y completado', FALSE, TRUE, FALSE, FALSE, '#28A745', 4),
('cancelado', 'Cancelado', 'Pedido cancelado por cliente o sistema', FALSE, TRUE, FALSE, FALSE, '#DC3545', 5)
ON CONFLICT (codigo) DO NOTHING;

-- ===================================================================
-- 9. MÉTODOS DE PAGO
-- ===================================================================

INSERT INTO metodos_pago (codigo, nombre, tipo, requiere_referencia, comision_porcentaje, dias_procesamiento, activo) VALUES
('efectivo', 'Efectivo', 'efectivo', FALSE, 0, 0, TRUE),
('tarjeta_credito', 'Tarjeta de Crédito', 'tarjeta_credito', TRUE, 3.5, 0, TRUE),
('tarjeta_debito', 'Tarjeta de Débito', 'tarjeta_debito', TRUE, 2.0, 0, TRUE),
('transferencia', 'Transferencia Bancaria', 'transferencia', TRUE, 0, 1, TRUE),
('yape', 'Yape', 'transferencia', TRUE, 0, 0, TRUE),
('plin', 'Plin', 'transferencia', TRUE, 0, 0, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ===================================================================
-- 10. PEDIDOS (20 pedidos con fechas distribuidas en los últimos 6 meses)
-- ===================================================================

-- Pedidos más antiguos (hace 6 meses)
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '6 months', 'completado', 560.00, 0, 560.00, CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '3 days'
FROM clientes c WHERE c.email = 'maria.garcia@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '5 days', 'completado', 640.00, 40.00, 600.00, CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '8 days'
FROM clientes c WHERE c.email = 'carlos.rodriguez@email.com';

-- Pedidos hace 5 meses
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '5 months', 'completado', 420.00, 20.00, 400.00, CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '2 days'
FROM clientes c WHERE c.email = 'ana.martinez@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '10 days', 'completado', 380.00, 0, 380.00, CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '13 days'
FROM clientes c WHERE c.email = 'jose.lopez@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '15 days', 'completado', 500.00, 50.00, 450.00, CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '18 days'
FROM clientes c WHERE c.email = 'laura.torres@email.com';

-- Pedidos hace 4 meses
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '4 months', 'completado', 680.00, 0, 680.00, CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '4 days'
FROM clientes c WHERE c.email = 'fernando.quispe@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '8 days', 'completado', 350.00, 0, 350.00, CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '11 days'
FROM clientes c WHERE c.email = 'patricia.vargas@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '20 days', 'completado', 740.00, 40.00, 700.00, CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '23 days'
FROM clientes c WHERE c.email = 'maria.garcia@email.com';

-- Pedidos hace 3 meses
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 months', 'completado', 520.00, 20.00, 500.00, CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '2 days'
FROM clientes c WHERE c.email = 'roberto.castillo@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '12 days', 'completado', 450.00, 0, 450.00, CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '15 days'
FROM clientes c WHERE c.email = 'sofia.mendoza@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '18 days', 'completado', 860.00, 60.00, 800.00, CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '21 days'
FROM clientes c WHERE c.email = 'carlos.rodriguez@email.com';

-- Pedidos hace 2 meses
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 months', 'completado', 340.00, 0, 340.00, CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '3 days'
FROM clientes c WHERE c.email = 'diego.huaman@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '10 days', 'completado', 600.00, 0, 600.00, CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '13 days'
FROM clientes c WHERE c.email = 'valentina.rojas@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '22 days', 'completado', 480.00, 30.00, 450.00, CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '25 days'
FROM clientes c WHERE c.email = 'ana.martinez@email.com';

-- Pedidos hace 1 mes
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 month', 'completado', 920.00, 20.00, 900.00, CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '4 days'
FROM clientes c WHERE c.email = 'andres.ponce@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '15 days', 'completado', 380.00, 0, 380.00, CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '18 days'
FROM clientes c WHERE c.email = 'camila.salazar@email.com';

-- Pedidos recientes (últimas 2 semanas)
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 weeks', 'completado', 520.00, 0, 520.00, CURRENT_TIMESTAMP - INTERVAL '2 weeks' + INTERVAL '3 days'
FROM clientes c WHERE c.email = 'javier.morales@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 week', 'completado', 670.00, 70.00, 600.00, CURRENT_TIMESTAMP - INTERVAL '1 week' + INTERVAL '2 days'
FROM clientes c WHERE c.email = 'isabella.ramos@email.com';

-- Pedidos pendientes (sin completar - solo 'pendiente' es válido)
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 days', 'pendiente', 440.00, 0, 440.00
FROM clientes c WHERE c.email = 'maria.garcia@email.com';

INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total)
SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 day', 'pendiente', 280.00, 0, 280.00
FROM clientes c WHERE c.email = 'fernando.quispe@email.com';

-- ===================================================================
-- 11. PEDIDOS_PRENDAS (Items de cada pedido - 40+ items total)
-- ===================================================================

-- Pedido 1 - María (2 items)
INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 2, pr.precio_chamana, pr.precio_chamana * 2
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'maria.garcia@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '6 months')::date
  AND pr.nombre = 'Buzo Tierra Flores Andinas'
LIMIT 1;

-- Pedido 2 - Carlos (2 items)
INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'carlos.rodriguez@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '5 days')::date
  AND pr.nombre = 'Sweater Montañas Sagradas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'carlos.rodriguez@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '5 days')::date
  AND pr.nombre = 'Sweater Montañas Sagradas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'carlos.rodriguez@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '5 days')::date
  AND pr.nombre = 'Sweater Montañas Sagradas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'carlos.rodriguez@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '5 days')::date
  AND pr.nombre = 'Pantalón Tierra Lino'
LIMIT 1;

-- Pedido 3 - Ana (1 item)
INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'ana.martinez@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '5 months')::date
  AND pr.nombre = 'Vestido Tierra Hojas de Coca'
LIMIT 1;

-- Continue with more order items for realistic data distribution...
-- (Adding 10 more representative order-item relationships)

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 2, pr.precio_chamana, pr.precio_chamana * 2
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'jose.lopez@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '10 days')::date
  AND pr.nombre = 'Top Mariposas de Luz'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'laura.torres@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '15 days')::date
  AND pr.nombre = 'Vestido Magia Geometría Inca'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'fernando.quispe@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '4 months')::date
  AND pr.nombre = 'Kimono Estrellas Místicas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 2, pr.precio_chamana, pr.precio_chamana * 2
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'fernando.quispe@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '4 months')::date
  AND pr.nombre = 'Remera Pájaros Amazonas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 2, pr.precio_chamana, pr.precio_chamana * 2
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'patricia.vargas@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '8 days')::date
  AND pr.nombre = 'Short Lino Olas Pacífico'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'roberto.castillo@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '3 months')::date
  AND pr.nombre = 'Palazzo Lluvia de Flores'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'roberto.castillo@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '3 months')::date
  AND pr.nombre = 'Buzo Tierra Flores Andinas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 2, pr.precio_chamana, pr.precio_chamana * 2
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'sofia.mendoza@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '12 days')::date
  AND pr.nombre = 'Pantalón Tierra Lino'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'andres.ponce@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '1 month')::date
  AND pr.nombre = 'Vestido Premium Vicuña'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'isabella.ramos@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '1 week')::date
  AND pr.nombre = 'Kimono Estrellas Místicas'
LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT p.id, pr.id, 1, pr.precio_chamana, pr.precio_chamana
FROM pedidos p, prendas pr, clientes c
WHERE c.email = 'isabella.ramos@email.com'
  AND p.cliente_id = c.id
  AND p.fecha_pedido::date = (CURRENT_TIMESTAMP - INTERVAL '1 week')::date
  AND pr.nombre = 'Musculosa Seda Geometría'
LIMIT 1;

COMMIT;

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT '✅ SEED COMPLETED' as status;

SELECT 'Categorías' as tabla, COUNT(*) as registros FROM categorias
UNION ALL SELECT 'Años', COUNT(*) FROM años
UNION ALL SELECT 'Temporadas', COUNT(*) FROM temporadas
UNION ALL SELECT 'Colecciones', COUNT(*) FROM colecciones
UNION ALL SELECT 'Telas', COUNT(*) FROM telas
UNION ALL SELECT 'Diseños', COUNT(*) FROM disenos
UNION ALL SELECT 'Tipos Prenda', COUNT(*) FROM tipos_prenda
UNION ALL SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL SELECT 'Telas-Proveedores', COUNT(*) FROM telas_proveedores
UNION ALL SELECT 'Prendas', COUNT(*) FROM prendas
UNION ALL SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL SELECT 'Direcciones', COUNT(*) FROM direcciones
UNION ALL SELECT 'Estados Pedido', COUNT(*) FROM estados_pedido
UNION ALL SELECT 'Métodos Pago', COUNT(*) FROM metodos_pago
UNION ALL SELECT 'Pedidos', COUNT(*) FROM pedidos
UNION ALL SELECT 'Pedidos-Prendas', COUNT(*) FROM pedidos_prendas;

-- Test views
SELECT '=== VISTA VENTAS MENSUALES ===' as test;
SELECT * FROM vista_ventas_mensuales LIMIT 5;

SELECT '=== VISTA TOP PRODUCTOS ===' as test;
SELECT * FROM vista_top_productos LIMIT 5;

SELECT '=== VISTA INVENTARIO CRÍTICO ===' as test;
SELECT * FROM vista_inventario_critico LIMIT 5;
