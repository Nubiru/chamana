-- ===================================================================
-- SUPABASE COMPREHENSIVE SEED DATA
-- Simplified schema - matches Supabase structure
-- ===================================================================

-- Step 1: Clean existing data (in correct order)
DELETE FROM pedidos_prendas;
DELETE FROM pedidos;
DELETE FROM historial_estados_pedido;
DELETE FROM movimientos_inventario;
DELETE FROM prendas;
DELETE FROM direcciones;
DELETE FROM clientes;
DELETE FROM telas_proveedores;
DELETE FROM telas_temporadas;
DELETE FROM telas;
DELETE FROM proveedores;
DELETE FROM disenos;
DELETE FROM colecciones;
DELETE FROM temporadas;
DELETE FROM años;
DELETE FROM categorias;
DELETE FROM tipos_prenda;
DELETE FROM estados_pedido;
DELETE FROM metodos_pago;

-- ===================================================================
-- CATALOG TABLES
-- ===================================================================

-- Años
INSERT INTO años (año) VALUES
(2023), (2024), (2025), (2026);

-- Temporadas
INSERT INTO temporadas (nombre) VALUES
('Invierno'), ('Verano'), ('Otoño'), ('Primavera');

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Buzo', 'Buzos y sweaters de distintos estilos'),
('Sweater', 'Sweaters y pulóvers'),
('Vestido', 'Vestidos casuales y formales'),
('Pantalón', 'Pantalones y leggins'),
('Falda', 'Faldas de diferentes largos'),
('Blusa', 'Blusas y tops'),
('Chaleco', 'Chalecos tejidos'),
('Cárdigan', 'Cárdigans abiertos'),
('Poncho', 'Ponchos artesanales'),
('Bufanda', 'Bufandas y pashminas'),
('Gorro', 'Gorros tejidos'),
('Accesorio', 'Accesorios varios'),
('Conjunto', 'Conjuntos coordinados');

-- Tipos de Prenda (if needed - simplified)
INSERT INTO tipos_prenda (nombre, descripcion) VALUES
('Tejido', 'Prendas tejidas a mano o máquina'),
('Bordado', 'Prendas con bordados artesanales'),
('Estampado', 'Prendas con diseños estampados'),
('Liso', 'Prendas sin diseño especial');

-- Estados de Pedido
INSERT INTO estados_pedido (codigo, nombre, descripcion) VALUES
('PEN', 'pendiente', 'Pedido recibido, pendiente de procesamiento'),
('PRO', 'procesando', 'Pedido en proceso de preparación'),
('ENV', 'enviado', 'Pedido enviado al cliente'),
('COM', 'completado', 'Pedido entregado y completado'),
('CAN', 'cancelado', 'Pedido cancelado');

-- Métodos de Pago
INSERT INTO metodos_pago (codigo, nombre, descripcion) VALUES
('EFE', 'Efectivo', 'Pago en efectivo'),
('TAR', 'Tarjeta', 'Pago con tarjeta de crédito/débito'),
('TRA', 'Transferencia', 'Transferencia bancaria'),
('YAP', 'Yape', 'Pago por Yape'),
('PLI', 'Plin', 'Pago por Plin');

-- Colecciones (with FK relationships to años and temporadas)
INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Tierra', a.id, t.id, 'Colección Invierno 2025 - Inspirada en la naturaleza', '2025-06-01', '2025-09-30', TRUE
FROM años a, temporadas t WHERE a.año = 2025 AND t.nombre = 'Invierno';

INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Magia', a.id, t.id, 'Colección Verano 2026 - Inspirada en lo místico', '2026-01-01', '2026-03-31', TRUE
FROM años a, temporadas t WHERE a.año = 2026 AND t.nombre = 'Verano';

INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Otoño Dorado', a.id, t.id, 'Colección Otoño 2025 - Tonos cálidos', '2025-03-01', '2025-05-31', TRUE
FROM años a, temporadas t WHERE a.año = 2025 AND t.nombre = 'Otoño';

INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion, fecha_inicio, fecha_fin, activa)
SELECT 'Primavera Floral', a.id, t.id, 'Colección Primavera 2024 - Diseños florales', '2024-09-01', '2024-12-31', TRUE
FROM años a, temporadas t WHERE a.año = 2024 AND t.nombre = 'Primavera';

-- Telas (with tipo - required in Supabase schema)
INSERT INTO telas (nombre, tipo, descripcion) VALUES
('Alpaca Baby', 'Natural', 'Fibra de alpaca suave y cálida'),
('Vicuña', 'Natural', 'Fibra premium exclusiva'),
('Seda Natural', 'Natural', 'Seda 100% natural importada'),
('Lino Belga', 'Natural', 'Lino europeo de alta calidad'),
('Algodón Tangüis', 'Natural', 'Algodón peruano premium'),
('Merino Australiano', 'Natural', 'Lana merino importada'),
('Algodón Pima', 'Natural', 'Algodón orgánico certificado'),
('Cashmere', 'Natural', 'Cashmere puro importado'),
('Mohair', 'Natural', 'Fibra de mohair suave'),
('Bambú', 'Sintética', 'Fibra de bambú sostenible');

-- Diseños (only nombre and descripcion in Supabase schema)
INSERT INTO disenos (nombre, descripcion) VALUES
('Flores Andinas', 'Bordado de flores nativas'),
('Geometría Inca', 'Patrones geométricos incaicos'),
('Chakana', 'Cruz andina sagrada'),
('Llamas', 'Diseño de llamas estilizadas'),
('Montañas', 'Siluetas de montañas andinas'),
('Sol Radiante', 'Sol con rayos decorativos'),
('Textil Paracas', 'Inspirado en textiles Paracas'),
('Espirales', 'Espirales decorativas continuas'),
('Rayas Verticales', 'Patrón simple de rayas'),
('Damero Colorido', 'Patrón de cuadros multicolor'),
('Hojas Tropicales', 'Hojas exóticas bordadas'),
('Sin Diseño', 'Prenda lisa sin diseño');

-- Proveedores (without contacto and pais - don't exist in Supabase schema)
INSERT INTO proveedores (nombre, telefono, email, ciudad) VALUES
('Textiles Andinos SAC', '+51 987654321', 'ventas@textilesandinos.pe', 'Arequipa'),
('Fibras Nobles Perú', '+51 912345678', 'contacto@fibrasnoblespe.com', 'Cusco'),
('Importaciones Chen', '+51 998877665', 'importaciones@chenpe.com', 'Lima'),
('Cooperativa Warmi', '+51 965432187', 'info@coopwarmi.org', 'Puno'),
('Hilandería del Sur', '+51 954321876', 'ventas@hilanderiadelsur.pe', 'Tacna');

-- ===================================================================
-- PRENDAS (20 products)
-- ===================================================================

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Buzo Tierra Flores Andinas', 'Buzo de alpaca con bordado de flores andinas', 280.00,
  cat.id, d.id, t.id, 25, 18, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Buzo' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Vestido Premium Vicuña', 'Vestido exclusivo de vicuña', 1200.00,
  cat.id, d.id, t.id, 8, 5, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Vestido' AND d.nombre = 'Geometría Inca' AND t.nombre = 'Vicuña';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Sweater Magia Chakana', 'Sweater con símbolo chakana', 340.00,
  cat.id, d.id, t.id, 30, 22, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Sweater' AND d.nombre = 'Chakana' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Poncho Llamas Andinas', 'Poncho artesanal con llamas', 450.00,
  cat.id, d.id, t.id, 15, 9, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Poncho' AND d.nombre = 'Llamas' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Blusa Seda Montañas', 'Blusa de seda con montañas', 280.00,
  cat.id, d.id, t.id, 20, 14, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Blusa' AND d.nombre = 'Montañas' AND t.nombre = 'Seda Natural';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Cárdigan Cashmere Sol', 'Cárdigan de cashmere con sol', 890.00,
  cat.id, d.id, t.id, 10, 6, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Cárdigan' AND d.nombre = 'Sol Radiante' AND t.nombre = 'Cashmere';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Falda Lino Paracas', 'Falda midi diseño Paracas', 320.00,
  cat.id, d.id, t.id, 18, 11, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Falda' AND d.nombre = 'Textil Paracas' AND t.nombre = 'Lino Belga';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Pantalón Algodón Rayas', 'Pantalón con rayas verticales', 240.00,
  cat.id, d.id, t.id, 35, 28, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Pantalón' AND d.nombre = 'Rayas Verticales' AND t.nombre = 'Algodón Tangüis';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Chaleco Espirales Merino', 'Chaleco lana merino', 380.00,
  cat.id, d.id, t.id, 22, 17, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Chaleco' AND d.nombre = 'Espirales' AND t.nombre = 'Merino Australiano';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Top Best Seller Agotado', 'Top más vendido - sin stock', 195.00,
  cat.id, d.id, t.id, 20, 20, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Blusa' AND d.nombre = 'Hojas Tropicales' AND t.nombre = 'Bambú';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Buzo Stock Crítico', 'Buzo con stock muy bajo', 250.00,
  cat.id, d.id, t.id, 15, 13, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Buzo' AND d.nombre = 'Damero Colorido' AND t.nombre = 'Algodón Pima';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Vestido Stock Crítico 2', 'Vestido últimas unidades', 420.00,
  cat.id, d.id, t.id, 10, 9, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Vestido' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Seda Natural';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Sweater Stock Bajo', 'Sweater considerar reposición', 310.00,
  cat.id, d.id, t.id, 20, 16, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Sweater' AND d.nombre = 'Llamas' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Bufanda Mohair Espirales', 'Bufanda suave mohair', 180.00,
  cat.id, d.id, t.id, 40, 25, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Bufanda' AND d.nombre = 'Espirales' AND t.nombre = 'Mohair';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Gorro Alpaca Montañas', 'Gorro tejido con montañas', 95.00,
  cat.id, d.id, t.id, 50, 35, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Gorro' AND d.nombre = 'Montañas' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Conjunto Premium Paracas', 'Conjunto coordinado Paracas', 980.00,
  cat.id, d.id, t.id, 12, 7, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Conjunto' AND d.nombre = 'Textil Paracas' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Poncho Descontinuado 2023', 'Colección pasada', 380.00,
  cat.id, d.id, t.id, 8, 8, FALSE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Poncho' AND d.nombre = 'Sol Radiante' AND t.nombre = 'Alpaca Baby';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Vestido Descontinuado', 'Temporada pasada', 450.00,
  cat.id, d.id, t.id, 10, 10, FALSE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Vestido' AND d.nombre = 'Geometría Inca' AND t.nombre = 'Lino Belga';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Chaleco Experimental', 'Diseño experimental', 290.00,
  cat.id, d.id, t.id, 5, 5, FALSE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Chaleco' AND d.nombre = 'Chakana' AND t.nombre = 'Bambú';

INSERT INTO prendas (nombre, descripcion, precio_chamana, categoria_id, diseno_id, tela_id, stock_inicial, stock_vendido, activa)
SELECT 'Blusa Algodón Lisa', 'Blusa básica sin diseño', 165.00,
  cat.id, d.id, t.id, 60, 42, TRUE
FROM categorias cat, disenos d, telas t
WHERE cat.nombre = 'Blusa' AND d.nombre = 'Sin Diseño' AND t.nombre = 'Algodón Tangüis';

-- ===================================================================
-- CLIENTES (15 customers - without pais in Supabase)
-- ===================================================================

INSERT INTO clientes (nombre, apellido, email, telefono, ciudad)
VALUES
('María', 'García', 'maria.garcia@email.com', '+51 987654321', 'Lima'),
('José', 'López', 'jose.lopez@email.com', '+51 912345678', 'Cusco'),
('Ana', 'Martínez', 'ana.martinez@email.com', '+51 998877665', 'Arequipa'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '+51 965432187', 'Puno'),
('Lucía', 'Fernández', 'lucia.fernandez@email.com', '+51 954321876', 'Trujillo'),
('Fernando', 'Quispe', 'fernando.quispe@email.com', '+51 923456789', 'Chiclayo'),
('Patricia', 'Mamani', 'patricia.mamani@email.com', '+51 987123456', 'Puno'),
('Roberto', 'Vargas', 'roberto.vargas@email.com', '+51 976543210', 'Piura'),
('Isabel', 'Torres', 'isabel.torres@email.com', '+51 965123456', 'Tacna'),
('Diego', 'Ramírez', 'diego.ramirez@email.com', '+51 954876543', 'Ica'),
('Carmen', 'Flores', 'carmen.flores@email.com', '+51 943765432', 'Lima'),
('Miguel', 'Castro', 'miguel.castro@email.com', '+51 932654321', 'Lima'),
('Rosa', 'Huamán', 'rosa.huaman@email.com', '+51 921543210', 'Cusco'),
('Antonio', 'Mendoza', 'antonio.mendoza@email.com', '+51 910432109', 'Arequipa'),
('Elena', 'Ríos', 'elena.rios@email.com', '+51 998321098', 'Lima');

-- ===================================================================
-- PEDIDOS (20 orders - 18 completado, 2 pendiente)
-- ===================================================================

-- Get estado_id for queries
DO $$
DECLARE
  estado_completado_id INT;
  estado_pendiente_id INT;
BEGIN
  SELECT id INTO estado_completado_id FROM estados_pedido WHERE nombre = 'completado';
  SELECT id INTO estado_pendiente_id FROM estados_pedido WHERE nombre = 'pendiente';

  -- Order 1 (6 months ago)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '6 months', estado_completado_id, 560.00, 0, 560.00,
    CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '3 days'
  FROM clientes c WHERE c.email = 'maria.garcia@email.com';

  -- Order 2
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '6 months', estado_completado_id, 1200.00, 0, 1200.00,
    CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '4 days'
  FROM clientes c WHERE c.email = 'jose.lopez@email.com';

  -- Order 3 (5 months)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '5 months', estado_completado_id, 680.00, 0, 680.00,
    CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '2 days'
  FROM clientes c WHERE c.email = 'ana.martinez@email.com';

  -- Order 4
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '5 months', estado_completado_id, 450.00, 0, 450.00,
    CURRENT_TIMESTAMP - INTERVAL '5 months' + INTERVAL '3 days'
  FROM clientes c WHERE c.email = 'carlos.rodriguez@email.com';

  -- Order 5 (4 months)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '4 months', estado_completado_id, 890.00, 0, 890.00,
    CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '4 days'
  FROM clientes c WHERE c.email = 'lucia.fernandez@email.com';

  -- Order 6
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '4 months', estado_completado_id, 760.00, 0, 760.00,
    CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '2 days'
  FROM clientes c WHERE c.email = 'fernando.quispe@email.com';

  -- Order 7 (3 months)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 months', estado_completado_id, 340.00, 0, 340.00,
    CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '3 days'
  FROM clientes c WHERE c.email = 'patricia.mamani@email.com';

  -- Order 8
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 months', estado_completado_id, 980.00, 0, 980.00,
    CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '5 days'
  FROM clientes c WHERE c.email = 'roberto.vargas@email.com';

  -- Order 9
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 months', estado_completado_id, 420.00, 0, 420.00,
    CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '2 days'
  FROM clientes c WHERE c.email = 'isabel.torres@email.com';

  -- Order 10 (2 months)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 months', estado_completado_id, 595.00, 0, 595.00,
    CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '3 days'
  FROM clientes c WHERE c.email = 'diego.ramirez@email.com';

  -- Order 11
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 months', estado_completado_id, 1170.00, 0, 1170.00,
    CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '4 days'
  FROM clientes c WHERE c.email = 'carmen.flores@email.com';

  -- Order 12
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 months', estado_completado_id, 640.00, 0, 640.00,
    CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '2 days'
  FROM clientes c WHERE c.email = 'miguel.castro@email.com';

  -- Order 13 (1 month)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 month', estado_completado_id, 530.00, 0, 530.00,
    CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '3 days'
  FROM clientes c WHERE c.email = 'rosa.huaman@email.com';

  -- Order 14
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 month', estado_completado_id, 760.00, 0, 760.00,
    CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '4 days'
  FROM clientes c WHERE c.email = 'antonio.mendoza@email.com';

  -- Order 15
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 month', estado_completado_id, 485.00, 0, 485.00,
    CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '2 days'
  FROM clientes c WHERE c.email = 'elena.rios@email.com';

  -- Order 16
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 month', estado_completado_id, 370.00, 0, 370.00,
    CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '3 days'
  FROM clientes c WHERE c.email = 'maria.garcia@email.com';

  -- Order 17 (2 weeks)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 weeks', estado_completado_id, 950.00, 0, 950.00,
    CURRENT_TIMESTAMP - INTERVAL '2 weeks' + INTERVAL '4 days'
  FROM clientes c WHERE c.email = 'jose.lopez@email.com';

  -- Order 18
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total, fecha_completado)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '2 weeks', estado_completado_id, 620.00, 0, 620.00,
    CURRENT_TIMESTAMP - INTERVAL '2 weeks' + INTERVAL '2 days'
  FROM clientes c WHERE c.email = 'ana.martinez@email.com';

  -- Order 19 (PENDING)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '3 days', estado_pendiente_id, 440.00, 0, 440.00
  FROM clientes c WHERE c.email = 'maria.garcia@email.com';

  -- Order 20 (PENDING)
  INSERT INTO pedidos (cliente_id, fecha_pedido, estado_id, subtotal, descuento, total)
  SELECT c.id, CURRENT_TIMESTAMP - INTERVAL '1 day', estado_pendiente_id, 280.00, 0, 280.00
  FROM clientes c WHERE c.email = 'fernando.quispe@email.com';

END $$;

-- ===================================================================
-- PEDIDOS_PRENDAS (Order line items - simplified mapping)
-- ===================================================================

-- Map items to orders (simplified - first 20 items)
INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 1, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Buzo Tierra Flores Andinas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 2, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Vestido Premium Vicuña';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 3, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Sweater Magia Chakana';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 4, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Poncho Llamas Andinas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 5, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Cárdigan Cashmere Sol';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 6, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Blusa Seda Montañas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 6, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Pantalón Algodón Rayas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 7, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Sweater Magia Chakana';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 8, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Conjunto Premium Paracas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 9, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Vestido Stock Crítico 2';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 10, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Falda Lino Paracas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 10, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Blusa Seda Montañas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 11, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Vestido Premium Vicuña' LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 12, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Pantalón Algodón Rayas' LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 12, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Blusa Algodón Lisa';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 13, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Sweater Stock Bajo';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 13, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Bufanda Mohair Espirales';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 14, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Chaleco Espirales Merino';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 15, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Top Best Seller Agotado';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 15, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Gorro Alpaca Montañas';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 16, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Blusa Algodón Lisa' LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 17, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Cárdigan Cashmere Sol' LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 17, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Bufanda Mohair Espirales' LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 18, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Sweater Magia Chakana' LIMIT 1;

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 18, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Blusa Seda Montañas' LIMIT 1;

-- Pending orders
INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 19, p.id, 2, p.precio_chamana, p.precio_chamana * 2
FROM prendas p WHERE p.nombre = 'Buzo Stock Crítico';

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
SELECT 20, p.id, 1, p.precio_chamana, p.precio_chamana
FROM prendas p WHERE p.nombre = 'Buzo Tierra Flores Andinas' LIMIT 1;

-- ===================================================================
-- SUMMARY
-- ===================================================================

SELECT 'SEED COMPLETED' as status;
