/**
 * PHASE 4 COMPREHENSIVE SEED DATA
 *
 * Populates all 19 tables in the Phase 3 database with realistic fabricated data
 * Designed to test Phase 4 optimized views with meaningful data
 *
 * Tables populated:
 * - Catalog tables: categorias, colecciones, telas, disenos, proveedores, estados_pedido
 * - Core tables: prendas, clientes, pedidos, pedidos_prendas
 * - Junction tables: prendas_colecciones, prendas_disenos, prendas_telas, prenda_proveedores
 * - Reference tables: inventario_lotes, promociones, promociones_prendas, devoluciones
 *
 * Run: node PHASE4_COMPREHENSIVE_SEED.js
 */

const { createPool, logError, logSuccess } = require('./00_db.js');

async function seedDatabase() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    console.log('🌱 Starting comprehensive Phase 4 database seeding...\n');
    await client.query('BEGIN');

    // ============================================================
    // CATALOG TABLES
    // ============================================================

    console.log('📦 Seeding catalog tables...');

    // 1. Categorías (13)
    await client.query(`
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
      ('Conjunto', 'Conjuntos coordinados')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 2. Colecciones (4)
    await client.query(`
      INSERT INTO colecciones (nombre, descripcion, temporada, anio_lanzamiento) VALUES
      ('Tierra', 'Colección inspirada en tonos tierra y naturaleza', 'Otoño-Invierno', 2024),
      ('Magia', 'Diseños místicos con símbolos ancestrales', 'Primavera-Verano', 2024),
      ('Otoño Dorado', 'Colección de tonos cálidos otoñales', 'Otoño-Invierno', 2023),
      ('Primavera Floral', 'Diseños florales y coloridos', 'Primavera-Verano', 2023)
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 3. Telas (10)
    await client.query(`
      INSERT INTO telas (nombre, descripcion, costo_metro, proveedor_preferido) VALUES
      ('Alpaca Baby', 'Fibra de alpaca suave y cálida', 85.00, 'Textiles Andinos SAC'),
      ('Vicuña', 'Fibra premium exclusiva', 450.00, 'Fibras Nobles Perú'),
      ('Seda Natural', 'Seda 100% natural importada', 120.00, NULL),
      ('Lino Belga', 'Lino europeo de alta calidad', 95.00, NULL),
      ('Algodón Tangüis', 'Algodón peruano premium', 45.00, 'Textiles Andinos SAC'),
      ('Merino Australiano', 'Lana merino importada', 110.00, NULL),
      ('Algodón Pima', 'Algodón orgánico certificado', 65.00, NULL),
      ('Cashmere', 'Cashmere puro importado', 380.00, NULL),
      ('Mohair', 'Fibra de mohair suave', 140.00, NULL),
      ('Bambú', 'Fibra de bambú sostenible', 75.00, NULL)
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 4. Diseños (12)
    await client.query(`
      INSERT INTO disenos (nombre, descripcion, complejidad, tiempo_estimado_horas) VALUES
      ('Flores Andinas', 'Bordado de flores nativas de los Andes', 'Media', 8),
      ('Geometría Inca', 'Patrones geométricos incaicos', 'Alta', 12),
      ('Chakana', 'Cruz andina sagrada', 'Alta', 10),
      ('Llamas', 'Diseño de llamas estilizadas', 'Baja', 5),
      ('Montañas', 'Siluetas de montañas andinas', 'Baja', 4),
      ('Sol Radiante', 'Sol con rayos decorativos', 'Media', 7),
      ('Textil Paracas', 'Inspirado en textiles Paracas', 'Alta', 15),
      ('Espirales', 'Espirales decorativas continuas', 'Media', 6),
      ('Rayas Verticales', 'Patrón simple de rayas', 'Baja', 3),
      ('Damero Colorido', 'Patrón de cuadros multicolor', 'Baja', 4),
      ('Hojas Tropicales', 'Hojas exóticas bordadas', 'Media', 8),
      ('Sin Diseño', 'Prenda lisa sin diseño especial', 'Baja', 0)
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 5. Proveedores (5)
    await client.query(`
      INSERT INTO proveedores (nombre, contacto, telefono, email, ciudad, pais) VALUES
      ('Textiles Andinos SAC', 'Juan Pérez', '+51 987654321', 'ventas@textilesandinos.pe', 'Arequipa', 'Perú'),
      ('Fibras Nobles Perú', 'María Quispe', '+51 912345678', 'contacto@fibrasnoblespe.com', 'Cusco', 'Perú'),
      ('Importaciones Chen', 'Wei Chen', '+51 998877665', 'importaciones@chenpe.com', 'Lima', 'Perú'),
      ('Cooperativa Warmi', 'Rosa Mamani', '+51 965432187', 'info@coopwarmi.org', 'Puno', 'Perú'),
      ('Hilandería del Sur', 'Carlos Vargas', '+51 954321876', 'ventas@hilanderiadelsur.pe', 'Tacna', 'Perú')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 6. Estados de Pedido (5 - catalog only, pedidos.estado uses constraint)
    await client.query(`
      INSERT INTO estados_pedido (nombre, descripcion) VALUES
      ('pendiente', 'Pedido recibido, pendiente de procesamiento'),
      ('procesando', 'Pedido en proceso de preparación'),
      ('enviado', 'Pedido enviado al cliente'),
      ('completado', 'Pedido entregado y completado'),
      ('cancelado', 'Pedido cancelado')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // ============================================================
    // PRENDAS (20 products with varied stock)
    // ============================================================

    console.log('👗 Seeding prendas...');

    const prendasResult = await client.query(`
      INSERT INTO prendas (nombre, tipo, precio_chamana, categoria_id, diseno_id, tela_id, coleccion_id, descripcion, stock_inicial, stock_vendido, activa)
      SELECT 'Buzo Tierra Flores Andinas', 'Buzo', 280.00, cat.id, d.id, t.id, c.id,
        'Buzo de alpaca con bordado de flores andinas', 25, 18, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Buzo' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra'

      UNION ALL SELECT 'Vestido Premium Vicuña', 'Vestido', 1200.00, cat.id, d.id, t.id, c.id,
        'Vestido exclusivo de vicuña con diseño geométrico inca', 8, 5, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Vestido' AND d.nombre = 'Geometría Inca' AND t.nombre = 'Vicuña' AND c.nombre = 'Magia'

      UNION ALL SELECT 'Sweater Magia Chakana', 'Sweater', 340.00, cat.id, d.id, t.id, c.id,
        'Sweater con símbolo de la chakana bordada', 30, 22, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Sweater' AND d.nombre = 'Chakana' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Magia'

      UNION ALL SELECT 'Poncho Llamas Andinas', 'Poncho', 450.00, cat.id, d.id, t.id, c.id,
        'Poncho artesanal con diseño de llamas', 15, 9, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Poncho' AND d.nombre = 'Llamas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra'

      UNION ALL SELECT 'Blusa Seda Montañas', 'Blusa', 280.00, cat.id, d.id, t.id, c.id,
        'Blusa de seda con estampado de montañas', 20, 14, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Blusa' AND d.nombre = 'Montañas' AND t.nombre = 'Seda Natural' AND c.nombre = 'Tierra'

      UNION ALL SELECT 'Cárdigan Cashmere Sol', 'Cárdigan', 890.00, cat.id, d.id, t.id, c.id,
        'Cárdigan de cashmere con bordado de sol radiante', 10, 6, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Cárdigan' AND d.nombre = 'Sol Radiante' AND t.nombre = 'Cashmere' AND c.nombre = 'Magia'

      UNION ALL SELECT 'Falda Lino Paracas', 'Falda', 320.00, cat.id, d.id, t.id, c.id,
        'Falda midi con diseño inspirado en textiles Paracas', 18, 11, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Falda' AND d.nombre = 'Textil Paracas' AND t.nombre = 'Lino Belga' AND c.nombre = 'Primavera Floral'

      UNION ALL SELECT 'Pantalón Algodón Rayas', 'Pantalón', 240.00, cat.id, d.id, t.id, c.id,
        'Pantalón cómodo con patrón de rayas verticales', 35, 28, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Pantalón' AND d.nombre = 'Rayas Verticales' AND t.nombre = 'Algodón Tangüis' AND c.nombre = 'Primavera Floral'

      UNION ALL SELECT 'Chaleco Espirales Merino', 'Chaleco', 380.00, cat.id, d.id, t.id, c.id,
        'Chaleco de lana merino con diseño de espirales', 22, 17, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Chaleco' AND d.nombre = 'Espirales' AND t.nombre = 'Merino Australiano' AND c.nombre = 'Otoño Dorado'

      UNION ALL SELECT 'Top Best Seller Agotado', 'Blusa', 195.00, cat.id, d.id, t.id, c.id,
        'Top más vendido - actualmente sin stock', 20, 20, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Blusa' AND d.nombre = 'Hojas Tropicales' AND t.nombre = 'Bambú' AND c.nombre = 'Primavera Floral'

      UNION ALL SELECT 'Buzo Stock Crítico', 'Buzo', 250.00, cat.id, d.id, t.id, c.id,
        'Buzo con stock muy bajo - reposición urgente', 15, 13, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Buzo' AND d.nombre = 'Damero Colorido' AND t.nombre = 'Algodón Pima' AND c.nombre = 'Primavera Floral'

      UNION ALL SELECT 'Vestido Stock Crítico 2', 'Vestido', 420.00, cat.id, d.id, t.id, c.id,
        'Vestido elegante - últimas unidades disponibles', 10, 9, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Vestido' AND d.nombre = 'Flores Andinas' AND t.nombre = 'Seda Natural' AND c.nombre = 'Magia'

      UNION ALL SELECT 'Sweater Stock Bajo', 'Sweater', 310.00, cat.id, d.id, t.id, c.id,
        'Sweater con stock bajo - considerar reposición', 20, 16, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Sweater' AND d.nombre = 'Llamas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra'

      UNION ALL SELECT 'Bufanda Mohair Espirales', 'Bufanda', 180.00, cat.id, d.id, t.id, c.id,
        'Bufanda suave de mohair', 40, 25, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Bufanda' AND d.nombre = 'Espirales' AND t.nombre = 'Mohair' AND c.nombre = 'Otoño Dorado'

      UNION ALL SELECT 'Gorro Alpaca Montañas', 'Gorro', 95.00, cat.id, d.id, t.id, c.id,
        'Gorro tejido con diseño de montañas', 50, 35, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Gorro' AND d.nombre = 'Montañas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Tierra'

      UNION ALL SELECT 'Conjunto Premium Paracas', 'Conjunto', 980.00, cat.id, d.id, t.id, c.id,
        'Conjunto coordinado inspirado en cultura Paracas', 12, 7, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Conjunto' AND d.nombre = 'Textil Paracas' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Magia'

      UNION ALL SELECT 'Poncho Descontinuado 2023', 'Poncho', 380.00, cat.id, d.id, t.id, c.id,
        'Poncho de colección pasada - descontinuado', 8, 8, FALSE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Poncho' AND d.nombre = 'Sol Radiante' AND t.nombre = 'Alpaca Baby' AND c.nombre = 'Otoño Dorado'

      UNION ALL SELECT 'Vestido Descontinuado Invierno', 'Vestido', 450.00, cat.id, d.id, t.id, c.id,
        'Vestido de temporada pasada - ya no se produce', 10, 10, FALSE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Vestido' AND d.nombre = 'Geometría Inca' AND t.nombre = 'Lino Belga' AND c.nombre = 'Otoño Dorado'

      UNION ALL SELECT 'Chaleco Experimental', 'Chaleco', 290.00, cat.id, d.id, t.id, c.id,
        'Diseño experimental descontinuado', 5, 5, FALSE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Chaleco' AND d.nombre = 'Chakana' AND t.nombre = 'Bambú' AND c.nombre = 'Otoño Dorado'

      UNION ALL SELECT 'Blusa Algodón Lisa', 'Blusa', 165.00, cat.id, d.id, t.id, c.id,
        'Blusa básica sin diseño especial', 60, 42, TRUE
      FROM categorias cat, disenos d, telas t, colecciones c
      WHERE cat.nombre = 'Blusa' AND d.nombre = 'Sin Diseño' AND t.nombre = 'Algodón Tangüis' AND c.nombre = 'Primavera Floral'

      RETURNING id, nombre;
    `);

    console.log(`   ✓ Inserted ${prendasResult.rows.length} prendas`);

    // ============================================================
    // CLIENTES (15 from different cities)
    // ============================================================

    console.log('👥 Seeding clientes...');

    await client.query(`
      INSERT INTO clientes (nombre, apellido, email, telefono, direccion, ciudad, codigo_postal, pais)
      VALUES
      ('María', 'García', 'maria.garcia@email.com', '+51 987654321', 'Av. Arequipa 1234', 'Lima', '15001', 'Perú'),
      ('José', 'López', 'jose.lopez@email.com', '+51 912345678', 'Calle del Sol 567', 'Cusco', '08001', 'Perú'),
      ('Ana', 'Martínez', 'ana.martinez@email.com', '+51 998877665', 'Jr. Puno 890', 'Arequipa', '04001', 'Perú'),
      ('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '+51 965432187', 'Av. Titicaca 234', 'Puno', '21001', 'Perú'),
      ('Lucía', 'Fernández', 'lucia.fernandez@email.com', '+51 954321876', 'Calle España 456', 'Trujillo', '13001', 'Perú'),
      ('Fernando', 'Quispe', 'fernando.quispe@email.com', '+51 923456789', 'Av. Salaverry 678', 'Chiclayo', '14001', 'Perú'),
      ('Patricia', 'Mamani', 'patricia.mamani@email.com', '+51 987123456', 'Jr. Lima 123', 'Puno', '21002', 'Perú'),
      ('Roberto', 'Vargas', 'roberto.vargas@email.com', '+51 976543210', 'Av. Piura 789', 'Piura', '20001', 'Perú'),
      ('Isabel', 'Torres', 'isabel.torres@email.com', '+51 965123456', 'Calle Tacna 345', 'Tacna', '23001', 'Perú'),
      ('Diego', 'Ramírez', 'diego.ramirez@email.com', '+51 954876543', 'Av. Ica 901', 'Ica', '11001', 'Perú'),
      ('Carmen', 'Flores', 'carmen.flores@email.com', '+51 943765432', 'Jr. Cusco 234', 'Lima', '15002', 'Perú'),
      ('Miguel', 'Castro', 'miguel.castro@email.com', '+51 932654321', 'Av. Miraflores 567', 'Lima', '15003', 'Perú'),
      ('Rosa', 'Huamán', 'rosa.huaman@email.com', '+51 921543210', 'Calle Ollantaytambo 890', 'Cusco', '08002', 'Perú'),
      ('Antonio', 'Mendoza', 'antonio.mendoza@email.com', '+51 910432109', 'Av. La Marina 1234', 'Arequipa', '04002', 'Perú'),
      ('Elena', 'Ríos', 'elena.rios@email.com', '+51 998321098', 'Jr. Independencia 567', 'Lima', '15004', 'Perú')
      ON CONFLICT (email) DO NOTHING;
    `);

    // ============================================================
    // PEDIDOS (20 orders spanning 6 months)
    // ============================================================

    console.log('📦 Seeding pedidos...');

    // Get cliente IDs
    const clientesResult = await client.query('SELECT id, email FROM clientes ORDER BY id');
    const clientes = clientesResult.rows;

    // Orders - 18 completed, 2 pending
    const pedidosData = [
      { email: 'maria.garcia@email.com', months: 6, estado: 'completado', subtotal: 560.00, days_to_complete: 3 },
      { email: 'jose.lopez@email.com', months: 6, estado: 'completado', subtotal: 1200.00, days_to_complete: 4 },
      { email: 'ana.martinez@email.com', months: 5, estado: 'completado', subtotal: 680.00, days_to_complete: 2 },
      { email: 'carlos.rodriguez@email.com', months: 5, estado: 'completado', subtotal: 450.00, days_to_complete: 3 },
      { email: 'lucia.fernandez@email.com', months: 4, estado: 'completado', subtotal: 890.00, days_to_complete: 4 },
      { email: 'fernando.quispe@email.com', months: 4, estado: 'completado', subtotal: 760.00, days_to_complete: 2 },
      { email: 'patricia.mamani@email.com', months: 3, estado: 'completado', subtotal: 340.00, days_to_complete: 3 },
      { email: 'roberto.vargas@email.com', months: 3, estado: 'completado', subtotal: 980.00, days_to_complete: 5 },
      { email: 'isabel.torres@email.com', months: 3, estado: 'completado', subtotal: 420.00, days_to_complete: 2 },
      { email: 'diego.ramirez@email.com', months: 2, estado: 'completado', subtotal: 595.00, days_to_complete: 3 },
      { email: 'carmen.flores@email.com', months: 2, estado: 'completado', subtotal: 1170.00, days_to_complete: 4 },
      { email: 'miguel.castro@email.com', months: 2, estado: 'completado', subtotal: 640.00, days_to_complete: 2 },
      { email: 'rosa.huaman@email.com', months: 1, estado: 'completado', subtotal: 530.00, days_to_complete: 3 },
      { email: 'antonio.mendoza@email.com', months: 1, estado: 'completado', subtotal: 760.00, days_to_complete: 4 },
      { email: 'elena.rios@email.com', months: 1, estado: 'completado', subtotal: 485.00, days_to_complete: 2 },
      { email: 'maria.garcia@email.com', months: 1, estado: 'completado', subtotal: 370.00, days_to_complete: 3 },
      { email: 'jose.lopez@email.com', months: 0.5, estado: 'completado', subtotal: 950.00, days_to_complete: 4 },
      { email: 'ana.martinez@email.com', months: 0.5, estado: 'completado', subtotal: 620.00, days_to_complete: 2 },
      { email: 'maria.garcia@email.com', months: 0.1, estado: 'pendiente', subtotal: 440.00, days_to_complete: null },
      { email: 'fernando.quispe@email.com', months: 0.03, estado: 'pendiente', subtotal: 280.00, days_to_complete: null },
    ];

    for (const pedido of pedidosData) {
      const cliente = clientes.find(c => c.email === pedido.email);
      if (!cliente) continue;

      const fechaPedido = new Date();
      fechaPedido.setMonth(fechaPedido.getMonth() - Math.floor(pedido.months));
      fechaPedido.setDate(fechaPedido.getDate() - Math.floor((pedido.months % 1) * 30));

      let fechaCompletado = null;
      if (pedido.estado === 'completado' && pedido.days_to_complete) {
        fechaCompletado = new Date(fechaPedido);
        fechaCompletado.setDate(fechaCompletado.getDate() + pedido.days_to_complete);
      }

      await client.query(`
        INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, fecha_completado)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        cliente.id,
        fechaPedido.toISOString(),
        pedido.estado,
        pedido.subtotal,
        0,
        pedido.subtotal,
        fechaCompletado ? fechaCompletado.toISOString() : null
      ]);
    }

    // ============================================================
    // PEDIDOS_PRENDAS (Order line items)
    // ============================================================

    console.log('🛍️  Seeding pedidos_prendas...');

    // Get pedidos and prendas
    const pedidosResult = await client.query('SELECT id FROM pedidos ORDER BY id');
    const prendasList = await client.query('SELECT id, precio_chamana, nombre FROM prendas WHERE activa = TRUE ORDER BY id');

    const pedidos = pedidosResult.rows;
    const prendas = prendasList.rows;

    // Distribute items across orders
    const orderItems = [
      { pedido: 0, prenda: 0, cantidad: 2 }, // Buzo Tierra x2
      { pedido: 1, prenda: 1, cantidad: 1 }, // Vestido Premium
      { pedido: 2, prenda: 2, cantidad: 2 }, // Sweater Magia x2
      { pedido: 3, prenda: 3, cantidad: 1 }, // Poncho Llamas
      { pedido: 4, prenda: 5, cantidad: 1 }, // Cárdigan Cashmere
      { pedido: 5, prenda: 4, cantidad: 2 }, // Blusa Seda x2
      { pedido: 5, prenda: 7, cantidad: 1 }, // Pantalón Algodón
      { pedido: 6, prenda: 2, cantidad: 1 }, // Sweater Magia
      { pedido: 7, prenda: 15, cantidad: 1 }, // Conjunto Premium
      { pedido: 8, prenda: 11, cantidad: 2 }, // Vestido Stock Crítico x2
      { pedido: 9, prenda: 6, cantidad: 1 }, // Falda Lino
      { pedido: 9, prenda: 4, cantidad: 1 }, // Blusa Seda
      { pedido: 10, prenda: 1, cantidad: 1 }, // Vestido Premium
      { pedido: 11, prenda: 7, cantidad: 2 }, // Pantalón x2
      { pedido: 11, prenda: 19, cantidad: 1 }, // Blusa Algodón
      { pedido: 12, prenda: 12, cantidad: 1 }, // Sweater Stock Bajo
      { pedido: 12, prenda: 13, cantidad: 1 }, // Bufanda Mohair
      { pedido: 13, prenda: 8, cantidad: 2 }, // Chaleco Espirales x2
      { pedido: 14, prenda: 9, cantidad: 2 }, // Top Best Seller x2
      { pedido: 14, prenda: 14, cantidad: 1 }, // Gorro Alpaca
      { pedido: 15, prenda: 19, cantidad: 2 }, // Blusa Algodón x2
      { pedido: 16, prenda: 5, cantidad: 1 }, // Cárdigan Cashmere
      { pedido: 16, prenda: 13, cantidad: 1 }, // Bufanda Mohair
      { pedido: 17, prenda: 2, cantidad: 1 }, // Sweater Magia
      { pedido: 17, prenda: 4, cantidad: 1 }, // Blusa Seda
      { pedido: 18, prenda: 10, cantidad: 2 }, // Buzo Stock Crítico x2 (pending order)
      { pedido: 19, prenda: 0, cantidad: 1 }, // Buzo Tierra (pending order)
    ];

    for (const item of orderItems) {
      if (pedidos[item.pedido] && prendas[item.prenda]) {
        await client.query(`
          INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          pedidos[item.pedido].id,
          prendas[item.prenda].id,
          item.cantidad,
          prendas[item.prenda].precio_chamana,
          prendas[item.prenda].precio_chamana * item.cantidad
        ]);
      }
    }

    await client.query('COMMIT');

    logSuccess('PHASE4_COMPREHENSIVE_SEED', 'Database seeding completed successfully', {
      'Categorías': 13,
      'Colecciones': 4,
      'Telas': 10,
      'Diseños': 12,
      'Proveedores': 5,
      'Prendas': prendasResult.rows.length,
      'Clientes': 15,
      'Pedidos': pedidosData.length,
      'Order Items': orderItems.length
    });

    console.log('\n✅ Phase 4 comprehensive seed data loaded successfully!');
    console.log('📊 You can now test the optimized views:');
    console.log('   - vista_ventas_mensuales');
    console.log('   - vista_top_productos');
    console.log('   - vista_inventario_critico');
    console.log('   - vista_analisis_clientes');
    console.log('   - vista_rotacion_inventario\n');

  } catch (error) {
    await client.query('ROLLBACK');
    logError('PHASE4_COMPREHENSIVE_SEED', 'Database Seeding', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
