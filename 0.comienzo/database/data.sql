-- =====================================================
-- Datos de Ejemplo - Fase 0: Comienzo
-- Proyecto: CHAMANA - E-commerce de Ropa Femenina
-- Fecha: 15 de Octubre, 2025
-- Versión: 0.1.0
-- =====================================================

-- Conectar a la base de datos
-- \c chamana_db_fase0;

-- =====================================================
-- DATOS DE CATEGORÍAS DE ROPA FEMENINA
-- =====================================================

INSERT INTO categorias (nombre, descripcion, imagen_url, activa, orden_display) VALUES 
('Vestidos', 'Vestidos elegantes y casuales para toda ocasión', '/images/categorias/vestidos.jpg', TRUE, 1),
('Blusas', 'Blusas y camisas femeninas de diferentes estilos', '/images/categorias/blusas.jpg', TRUE, 2),
('Pantalones', 'Pantalones, jeans y leggings para mujer', '/images/categorias/pantalones.jpg', TRUE, 3),
('Faldas', 'Faldas de diferentes longitudes y estilos', '/images/categorias/faldas.jpg', TRUE, 4),
('Abrigos', 'Chamarras, abrigos y blazers para mujer', '/images/categorias/abrigos.jpg', TRUE, 5),
('Accesorios', 'Bolsas, cinturones y accesorios de moda', '/images/categorias/accesorios.jpg', TRUE, 6),
('Ropa Interior', 'Ropa interior femenina cómoda y elegante', '/images/categorias/ropa-interior.jpg', TRUE, 7),
('Zapatos', 'Zapatos y sandalias para mujer', '/images/categorias/zapatos.jpg', TRUE, 8);

-- =====================================================
-- DATOS DE CLIENTES CHAMANA
-- =====================================================

INSERT INTO clientes (nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, ciudad, codigo_postal, pais, activo) VALUES 
('María', 'García', 'maria.garcia@email.com', '555-0101', '1990-05-15', 'F', 'Av. Reforma 123, Col. Centro', 'Ciudad de México', '06000', 'México', TRUE),
('Ana', 'Martínez', 'ana.martinez@email.com', '555-0102', '1985-08-22', 'F', 'Calle Insurgentes 456, Col. Roma', 'Ciudad de México', '06700', 'México', TRUE),
('Sofia', 'Hernández', 'sofia.hernandez@email.com', '555-0103', '1992-12-10', 'F', 'Av. Chapultepec 789, Col. Condesa', 'Ciudad de México', '06140', 'México', TRUE),
('Valentina', 'Morales', 'valentina.morales@email.com', '555-0104', '1988-03-18', 'F', 'Calle Álvaro Obregón 321, Col. Roma Norte', 'Ciudad de México', '06700', 'México', TRUE),
('Carmen', 'López', 'carmen.lopez@email.com', '555-0105', '1995-07-03', 'F', 'Av. Insurgentes Sur 654, Col. Del Valle', 'Ciudad de México', '03100', 'México', TRUE),
('Isabella', 'González', 'isabella.gonzalez@email.com', '555-0106', '1991-11-25', 'F', 'Calle Coyoacán 987, Col. Coyoacán', 'Ciudad de México', '04100', 'México', TRUE),
('Camila', 'Rodríguez', 'camila.rodriguez@email.com', '555-0107', '1987-09-14', 'F', 'Av. Universidad 147, Col. Del Valle', 'Ciudad de México', '03100', 'México', TRUE),
('Alejandra', 'Pérez', 'alejandra.perez@email.com', '555-0108', '1993-04-30', 'F', 'Calle Nápoles 258, Col. Juárez', 'Ciudad de México', '06600', 'México', TRUE);

-- =====================================================
-- DATOS DE PRENDAS CHAMANA
-- =====================================================

-- Vestidos
INSERT INTO prendas (nombre, descripcion, precio, precio_original, categoria_id, talla, color, material, marca, stock, stock_minimo, imagen_principal, etiquetas, activa, destacada) VALUES 
('Vestido Elegante Negro', 'Vestido de fiesta elegante en color negro, perfecto para ocasiones especiales', 899.00, 1199.00, 1, 'M', 'Negro', 'Poliester', 'CHAMANA', 15, 5, '/images/prendas/vestido-negro-elegante.jpg', ARRAY['nuevo', 'elegante'], TRUE, TRUE),
('Vestido Casual Floral', 'Vestido casual con estampado floral, ideal para el día', 599.00, 799.00, 1, 'S', 'Floral', 'Algodón', 'CHAMANA', 20, 5, '/images/prendas/vestido-floral-casual.jpg', ARRAY['casual', 'tendencia'], TRUE, FALSE),
('Vestido de Noche Rojo', 'Vestido de noche en color rojo intenso, perfecto para eventos formales', 1299.00, 1599.00, 1, 'L', 'Rojo', 'Seda', 'CHAMANA', 8, 3, '/images/prendas/vestido-rojo-noche.jpg', ARRAY['elegante', 'formal'], TRUE, TRUE);

-- Blusas
INSERT INTO prendas (nombre, descripcion, precio, precio_original, categoria_id, talla, color, material, marca, stock, stock_minimo, imagen_principal, etiquetas, activa, destacada) VALUES 
('Blusa Blanca Básica', 'Blusa blanca básica de algodón, versátil para cualquier ocasión', 299.00, 399.00, 2, 'M', 'Blanco', 'Algodón', 'CHAMANA', 25, 10, '/images/prendas/blusa-blanca-basica.jpg', ARRAY['básica', 'versátil'], TRUE, FALSE),
('Blusa de Seda Azul', 'Blusa de seda en color azul marino, elegante y cómoda', 599.00, 799.00, 2, 'S', 'Azul', 'Seda', 'CHAMANA', 12, 5, '/images/prendas/blusa-seda-azul.jpg', ARRAY['elegante', 'seda'], TRUE, TRUE),
('Camisa a Cuadros', 'Camisa a cuadros en tonos rojos y blancos, estilo casual', 399.00, 499.00, 2, 'L', 'Cuadros', 'Algodón', 'CHAMANA', 18, 8, '/images/prendas/camisa-cuadros.jpg', ARRAY['casual', 'cuadros'], TRUE, FALSE);

-- Pantalones
INSERT INTO prendas (nombre, descripcion, precio, precio_original, categoria_id, talla, color, material, marca, stock, stock_minimo, imagen_principal, etiquetas, activa, destacada) VALUES 
('Jeans Clásicos Azules', 'Jeans clásicos de mezclilla azul, corte recto', 699.00, 899.00, 3, 'M', 'Azul', 'Denim', 'CHAMANA', 22, 8, '/images/prendas/jeans-clasicos-azules.jpg', ARRAY['clásico', 'denim'], TRUE, FALSE),
('Pantalón de Vestir Negro', 'Pantalón de vestir en color negro, elegante y formal', 799.00, 999.00, 3, 'L', 'Negro', 'Poliester', 'CHAMANA', 15, 5, '/images/prendas/pantalon-vestir-negro.jpg', ARRAY['formal', 'elegante'], TRUE, TRUE),
('Leggings Deportivos', 'Leggings deportivos cómodos para ejercicio', 399.00, 499.00, 3, 'S', 'Negro', 'Spandex', 'CHAMANA', 30, 10, '/images/prendas/leggings-deportivos.jpg', ARRAY['deportivo', 'cómodo'], TRUE, FALSE);

-- Faldas
INSERT INTO prendas (nombre, descripcion, precio, precio_original, categoria_id, talla, color, material, marca, stock, stock_minimo, imagen_principal, etiquetas, activa, destacada) VALUES 
('Falda Lápiz Negra', 'Falda lápiz en color negro, elegante y versátil', 599.00, 799.00, 4, 'M', 'Negro', 'Poliester', 'CHAMANA', 18, 6, '/images/prendas/falda-lapiz-negra.jpg', ARRAY['elegante', 'versátil'], TRUE, TRUE),
('Falda Floral Casual', 'Falda con estampado floral, perfecta para el día', 499.00, 699.00, 4, 'S', 'Floral', 'Algodón', 'CHAMANA', 20, 8, '/images/prendas/falda-floral-casual.jpg', ARRAY['casual', 'floral'], TRUE, FALSE),
('Mini Falda de Cuero', 'Mini falda de cuero sintético, estilo rockero', 799.00, 999.00, 4, 'L', 'Negro', 'Cuero Sintético', 'CHAMANA', 12, 4, '/images/prendas/mini-falda-cuero.jpg', ARRAY['rockero', 'tendencia'], TRUE, FALSE);

-- Abrigos
INSERT INTO prendas (nombre, descripcion, precio, precio_original, categoria_id, talla, color, material, marca, stock, stock_minimo, imagen_principal, etiquetas, activa, destacada) VALUES 
('Chaqueta de Cuero', 'Chaqueta de cuero genuino en color negro', 1999.00, 2499.00, 5, 'M', 'Negro', 'Cuero', 'CHAMANA', 8, 3, '/images/prendas/chaqueta-cuero-negra.jpg', ARRAY['elegante', 'cuero'], TRUE, TRUE),
('Blazer Formal Gris', 'Blazer formal en color gris, perfecto para oficina', 1299.00, 1599.00, 5, 'L', 'Gris', 'Lana', 'CHAMANA', 10, 4, '/images/prendas/blazer-formal-gris.jpg', ARRAY['formal', 'oficina'], TRUE, FALSE),
('Chamarra Casual Rosa', 'Chamarra casual en color rosa, estilo juvenil', 899.00, 1199.00, 5, 'S', 'Rosa', 'Algodón', 'CHAMANA', 15, 6, '/images/prendas/chamarra-casual-rosa.jpg', ARRAY['casual', 'juvenil'], TRUE, FALSE);

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen de datos insertados
SELECT 'Categorías' as tabla, COUNT(*) as total FROM categorias
UNION ALL
SELECT 'Clientes' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Prendas' as tabla, COUNT(*) as total FROM prendas;

-- Mostrar prendas con sus categorías
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.talla,
    p.color,
    p.stock,
    c.nombre as categoria
FROM prendas p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activa = TRUE
ORDER BY c.nombre, p.nombre;

-- Mostrar estadísticas por categoría
SELECT 
    c.nombre as categoria,
    COUNT(p.id) as total_prendas,
    SUM(p.stock) as total_stock,
    ROUND(AVG(p.precio), 2) as precio_promedio,
    MIN(p.precio) as precio_minimo,
    MAX(p.precio) as precio_maximo,
    COUNT(CASE WHEN p.destacada = TRUE THEN 1 END) as prendas_destacadas
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id AND p.activa = TRUE
GROUP BY c.id, c.nombre
ORDER BY total_prendas DESC;

-- =====================================================
-- FIN DE DATOS DE EJEMPLO
-- =====================================================