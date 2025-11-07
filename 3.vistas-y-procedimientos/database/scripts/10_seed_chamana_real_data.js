/**
 * CHAMANA - Seed Real Data
 *
 * Este script puebla la base de datos con datos REALES de las colecciones:
 * - Invierno 2025 "Tierra"
 * - Verano 2026 "Magia"
 *
 * Basado en los datos de producción real de Chamana.
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function seedRealData() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    console.log('🌱 Poblando base de datos con datos reales de Chamana...\n');

    await client.query('BEGIN');

    // ===================================================================
    // 1. CATÁLOGOS ESTÁTICOS
    // ===================================================================

    console.log('📦 Insertando catálogos estáticos...');

    // Categorías (basadas en los tipos de prendas)
    await executeQuery(
      client,
      `
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
      ON CONFLICT (nombre) DO NOTHING
    `
    );

    // Años
    await executeQuery(
      client,
      `
      INSERT INTO años (año) VALUES
      (2025),
      (2026)
      ON CONFLICT (año) DO NOTHING
    `
    );

    // Temporadas
    await executeQuery(
      client,
      `
      INSERT INTO temporadas (nombre) VALUES
      ('Invierno'),
      ('Verano'),
      ('Otoño'),
      ('Primavera')
      ON CONFLICT (nombre) DO NOTHING
    `
    );

    // Colecciones Reales
    // Usar ON CONFLICT para manejar colecciones que ya existen de la migración
    await executeQuery(
      client,
      `
      INSERT INTO colecciones (nombre, año_id, temporada_id, descripcion) VALUES
      ('Tierra',
        (SELECT id FROM años WHERE año = 2025),
        (SELECT id FROM temporadas WHERE nombre = 'Invierno'),
        'Colección Invierno 2025 - Tierra: Inspirada en la naturaleza y elementos terrestres'),
      ('Magia',
        (SELECT id FROM años WHERE año = 2026),
        (SELECT id FROM temporadas WHERE nombre = 'Verano'),
        'Colección Verano 2026 - Magia: Inspirada en lo místico y lo etéreo')
      ON CONFLICT (año_id, temporada_id) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion
    `
    );

    console.log('   ✅ Catálogos estáticos insertados');

    // ===================================================================
    // 2. DISEÑOS REALES - COLECCIÓN TIERRA (Invierno 2025)
    // ===================================================================

    console.log('\n📐 Insertando diseños de colección TIERRA...');

    const disenosTierra = [
      ['Gaia', 'Buzo', 'Dolman', 'Buzo estilo Dolman con corte amplio'],
      ['Tormenta', 'Buzo', 'Nuevo', 'Buzo de estilo nuevo con diseño moderno'],
      ['Nube', 'Buzo', 'Polerón Corto - M. Ranglán', 'Buzo polerón corto con manga ranglán'],
      ['Constelación', 'Sweater', 'Polerón Largo - M. Ranglán', 'Sweater largo con manga ranglán'],
      ['Solar', 'Sweater', 'Dolman', 'Sweater estilo Dolman'],
      ['Eter', 'Remerón', 'M. Larga - Campana', 'Remerón manga larga campana'],
      ['Glaciar', 'Remerón', 'M. Larga - Campana', 'Remerón manga larga campana'],
      ['Mar', 'Remerón', 'Dolman', 'Remerón estilo Dolman'],
      ['Brisa', 'Remera', 'Corta', 'Remera manga corta'],
      ['Rocío', 'Remera', 'Manga Larga', 'Remera manga larga'],
      ['Aire', 'Vestido', 'M. Dolman', 'Vestido con manga Dolman'],
      ['Marea', 'Top', 'M. Larga', 'Top manga larga'],
      ['Corteza', 'Palazzo', 'Tiro Alto Plano', 'Pantalón palazzo tiro alto plano'],
      ['Árbol', 'Pantalón', 'Babucha', 'Pantalón estilo babucha'],
      ['Tierra', 'Pantalón', 'Sastrero', 'Pantalón sastrero clásico'],
      ['Raíz', 'Pantalón', 'Jogger', 'Pantalón tipo jogger'],
    ];

    for (const [nombre, tipo, detalle, descripcion] of disenosTierra) {
      await executeQuery(
        client,
        `
        INSERT INTO disenos (nombre, tipo, detalle, descripcion, coleccion_id) VALUES
        ($1, $2, $3, $4, (SELECT id FROM colecciones WHERE nombre = 'Tierra'))
        ON CONFLICT (nombre) DO NOTHING
      `,
        [nombre, tipo, detalle, descripcion]
      );
    }

    console.log(`   ✅ ${disenosTierra.length} diseños de TIERRA insertados`);

    // ===================================================================
    // 3. DISEÑOS REALES - COLECCIÓN MAGIA (Verano 2026)
    // ===================================================================

    console.log('\n📐 Insertando diseños de colección MAGIA...');

    const disenosMagia = [
      ['Hechizo', 'Falda', 'Volados', 'Falda con volados'],
      ['Intuición', 'Kimono', '', 'Kimono'],
      ['Dejavu', 'Palazzo', 'Bolsillos', 'Palazzo con bolsillos'],
      ['Luz y Sombra', 'Palazzo', 'Gajos', 'Palazzo con gajos'],
      ['Sabia', 'Remerón', 'Oriental', 'Remerón oriental'],
      ['Magnética', 'Musculosa', 'Escote V', 'Musculosa con escote en V'],
      ['Espejo', 'Top', 'Reversible', 'Top reversible'],
      ['Simpleza', 'Short', 'Bolsillos', 'Short con bolsillos'],
      ['Símbolo', 'Top', 'Simple', 'Top simple'],
      ['Vidente', 'Top', 'Reversible', 'Top reversible'],
      ['Corazonada', 'Camisa', '', 'Camisa'],
    ];

    for (const [nombre, tipo, detalle, descripcion] of disenosMagia) {
      await executeQuery(
        client,
        `
        INSERT INTO disenos (nombre, tipo, detalle, descripcion, coleccion_id) VALUES
        ($1, $2, $3, $4, (SELECT id FROM colecciones WHERE nombre = 'Magia'))
        ON CONFLICT (nombre) DO NOTHING
      `,
        [nombre, tipo, detalle || '', descripcion]
      );
    }

    console.log(`   ✅ ${disenosMagia.length} diseños de MAGIA insertados`);

    // ===================================================================
    // 4. TELAS REALES - COLECCIÓN TIERRA (Invierno 2025)
    // ===================================================================

    console.log('\n🧵 Insertando telas de colección TIERRA...');

    const telasTierra = [
      // nombre, tipo, detalle, color, costo_por_metro
      ['FriNeg', 'Friza', 'Cardada', 'Negro', 2965],
      ['FriVer', 'Friza', 'Cardada', 'Verde M.', 3818],
      ['FriBor', 'Friza', 'Invisible', 'Bordo', 3529],
      ['JerVerM', 'Jersey', 'Corderito', 'Verde M.', 4257],
      ['JerVerA', 'Jersey', 'Corderito', 'Verde A.', 4257],
      ['JerBor', 'Jersey', 'Corderito', 'Bordo', 4257],
      ['PluVer', 'Plush', 'Punto', 'Verde A.', 4773],
      ['PluNeg', 'Plush', 'Punto', 'Negro', 3580],
      ['CorNeg', 'Corderoy', 'Piel', 'Negro', 2210],
      ['Morley', 'Morley', 'Modal', 'Chocolate', 4533],
      ['Modal', 'Modal', 'Común', 'Bordo', 3667],
      ['GabNeg', 'Gabardina', 'Algodón', 'Negro', 5540],
      ['GabVer', 'Gabardina', 'Algodón', 'Verde M.', 6990],
      ['GabAer', 'Gabardina', 'Algodón', 'Aereo', 6990],
      ['RibNeg', 'Ribb', 'Algodón', 'Negro', 10800],
      ['RibVer', 'Ribb', 'Algodón', 'Verde', 10800],
      ['RibBor', 'Ribb', 'Algodón', 'Bordo', 10800],
    ];

    for (const [nombre, tipo, detalle, color, costo] of telasTierra) {
      const descripcion = `${detalle} - ${color}`;
      await executeQuery(
        client,
        `
        INSERT INTO telas (nombre, tipo, descripcion, costo_por_metro) VALUES
        ($1, $2, $3, $4)
        ON CONFLICT (nombre) DO NOTHING
      `,
        [nombre, tipo, descripcion, costo]
      );

      // Asociar con temporada Invierno
      await executeQuery(
        client,
        `
        INSERT INTO telas_temporadas (tela_id, temporada_id, año_id) VALUES
        ((SELECT id FROM telas WHERE nombre = $1),
         (SELECT id FROM temporadas WHERE nombre = 'Invierno'),
         (SELECT id FROM años WHERE año = 2025))
        ON CONFLICT DO NOTHING
      `,
        [nombre]
      );
    }

    console.log(`   ✅ ${telasTierra.length} telas de TIERRA insertadas`);

    // ===================================================================
    // 5. TELAS REALES - COLECCIÓN MAGIA (Verano 2026)
    // ===================================================================

    console.log('\n🧵 Insertando telas de colección MAGIA...');

    const telasMagia = [
      // nombre, tipo, detalle, color, costo_por_metro
      ['LinSpanBei', 'Lino', 'Spandex', 'Beige', 3634],
      ['LinSpanCho', 'Lino', 'Spandex', 'Chocolate', 3634],
      ['LinMenGris', 'Lino', 'Men', 'Gris', 4612],
      ['LinMenMili', 'Lino', 'Men', 'V. Militar', 4612],
      ['LinMenChoc', 'Lino', 'Men', 'Chocolate', 4612],
      ['LinMarNeg', 'Lino', 'Marruecos', 'Negro', 6093],
      ['LinMarCasc', 'Lino', 'Marruecos', 'Cascarilla', 6093],
      ['LinMarCho', 'Lino', 'Marruecos', 'Chocolate', 6093],
      ['TejNegro', 'Tejido', 'Formentera', 'Negro', 6655],
      ['TejBeige', 'Tejido', 'Formentera', 'Beige', 6008],
      ['TejMalva', 'Tejido', 'Formentera', 'V. Malva', 5823],
      ['RibNegro', 'Ribb', 'New York', 'Negro', 6104],
      ['RibMilitar', 'Ribb', 'New York', 'V. Militar', 5930],
      ['RibMarino', 'Ribb', 'New York', 'Marino', 6192],
      ['GabMilitar', 'Gabardina', 'Algodón', 'V. Militar', 4643],
      ['GabAereo', 'Gabardina', 'Algodón', 'V. Aereo', 4643],
      ['GabNeg', 'Gabardina', 'Algodón', 'Negro', 4643],
      ['TusNegro', 'Tusor', '', 'Negro', 3557],
      ['TusMarino', 'Tusor', '', 'Marino', 3557],
      ['TusMaiz', 'Tusor', '', 'Maiz', 3557],
      ['FibAgua', 'Fibrana', '', 'V. Agua', 546],
    ];

    for (const [nombre, tipo, detalle, color, costo] of telasMagia) {
      const descripcion = detalle ? `${detalle} - ${color}` : color;
      await executeQuery(
        client,
        `
        INSERT INTO telas (nombre, tipo, descripcion, costo_por_metro) VALUES
        ($1, $2, $3, $4)
        ON CONFLICT (nombre) DO NOTHING
      `,
        [nombre, tipo, descripcion, costo]
      );

      // Asociar con temporada Verano
      await executeQuery(
        client,
        `
        INSERT INTO telas_temporadas (tela_id, temporada_id, año_id) VALUES
        ((SELECT id FROM telas WHERE nombre = $1),
         (SELECT id FROM temporadas WHERE nombre = 'Verano'),
         (SELECT id FROM años WHERE año = 2026))
        ON CONFLICT DO NOTHING
      `,
        [nombre]
      );
    }

    console.log(`   ✅ ${telasMagia.length} telas de MAGIA insertadas`);

    // ===================================================================
    // 6. TIPOS DE PRENDA (3NF)
    // ===================================================================

    console.log('\n👕 Insertando tipos de prenda (3NF)...');

    const tiposPrenda = [
      ['Buzo', 'Casual', 'Todo el año', 'Diario, Casual', 'Lavar a máquina 30°C'],
      [
        'Sweater',
        'Casual/Formal',
        'Otoño/Invierno',
        'Diario, Oficina',
        'Lavar a mano o máquina delicado',
      ],
      ['Remerón', 'Casual', 'Todo el año', 'Diario, Casual', 'Lavar a máquina 30°C'],
      ['Remera', 'Casual', 'Todo el año', 'Diario, Deportivo', 'Lavar a máquina 40°C'],
      ['Vestido', 'Formal', 'Primavera/Verano', 'Eventos, Oficina', 'Lavar a mano o tintorería'],
      ['Top', 'Casual', 'Primavera/Verano', 'Diario, Casual', 'Lavar a máquina 30°C'],
      ['Palazzo', 'Formal', 'Todo el año', 'Oficina, Eventos', 'Lavar a máquina 30°C o tintorería'],
      ['Pantalón', 'Formal/Casual', 'Todo el año', 'Oficina, Diario', 'Lavar a máquina 40°C'],
      ['Falda', 'Formal/Casual', 'Primavera/Verano', 'Oficina, Eventos', 'Lavar a máquina 30°C'],
      ['Kimono', 'Casual', 'Primavera/Verano', 'Playa, Casual', 'Lavar a mano'],
      ['Musculosa', 'Casual', 'Primavera/Verano', 'Deportivo, Casual', 'Lavar a máquina 40°C'],
      ['Short', 'Casual', 'Primavera/Verano', 'Deportivo, Casual', 'Lavar a máquina 40°C'],
      ['Camisa', 'Formal', 'Todo el año', 'Oficina, Formal', 'Lavar a máquina 30°C'],
    ];

    for (const [nombre, subcategoria, temporada, ocasion, cuidados] of tiposPrenda) {
      await executeQuery(
        client,
        `
        INSERT INTO tipos_prenda (nombre, subcategoria, temporada_recomendada, ocasion_uso, cuidados_lavado) VALUES
        ($1, $2, $3, $4, $5)
        ON CONFLICT (nombre) DO NOTHING
      `,
        [nombre, subcategoria, temporada, ocasion, cuidados]
      );
    }

    console.log(`   ✅ ${tiposPrenda.length} tipos de prenda insertados`);

    // ===================================================================
    // 7. PROVEEDORES (3NF)
    // ===================================================================

    console.log('\n🏭 Insertando proveedores (3NF)...');

    await executeQuery(
      client,
      `
      INSERT INTO proveedores (nombre, telefono, email, dias_entrega_promedio, calificacion, ciudad, pais) VALUES
      ('Textiles Premium SA', '555-0101', 'ventas@textilespremium.com.ar', 7, 4.8, 'Buenos Aires', 'Argentina'),
      ('Telas del Norte', '555-0202', 'contacto@telasdelnorte.com.ar', 5, 4.5, 'Córdoba', 'Argentina'),
      ('Importadora Textil Global', '555-0303', 'info@imptext global.com', 14, 4.2, 'Buenos Aires', 'Argentina')
      ON CONFLICT DO NOTHING
    `
    );

    console.log('   ✅ Proveedores insertados');

    // ===================================================================
    // 8. MÉTODOS DE PAGO (3NF)
    // ===================================================================

    console.log('\n💳 Insertando métodos de pago (3NF)...');

    await executeQuery(
      client,
      `
      INSERT INTO metodos_pago (codigo, nombre, tipo, comision_porcentaje, dias_procesamiento) VALUES
      ('efectivo', 'Efectivo', 'efectivo', 0, 0),
      ('transferencia', 'Transferencia Bancaria', 'transferencia', 0, 1),
      ('mp', 'Mercado Pago', 'mercado_pago', 5.99, 2),
      ('tarjeta_debito', 'Tarjeta de Débito', 'tarjeta_debito', 2.5, 1),
      ('tarjeta_credito', 'Tarjeta de Crédito', 'tarjeta_credito', 4.5, 1)
      ON CONFLICT (codigo) DO NOTHING
    `
    );

    console.log('   ✅ Métodos de pago insertados');

    // ===================================================================
    // 9. ESTADOS DE PEDIDO (3NF)
    // ===================================================================

    console.log('\n📋 Insertando estados de pedido (3NF)...');

    await executeQuery(
      client,
      `
      INSERT INTO estados_pedido (codigo, nombre, descripcion, es_inicial, es_final, color_hex, orden_workflow) VALUES
      ('pendiente', 'Pendiente', 'Pedido recibido, pendiente de confirmación', TRUE, FALSE, '#FFA500', 1),
      ('confirmado', 'Confirmado', 'Pedido confirmado, en preparación', FALSE, FALSE, '#4169E1', 2),
      ('en_produccion', 'En Producción', 'Prenda en proceso de confección', FALSE, FALSE, '#9370DB', 3),
      ('listo', 'Listo para Retirar', 'Pedido listo en taller', FALSE, FALSE, '#20B2AA', 4),
      ('entregado', 'Entregado', 'Pedido entregado al cliente', FALSE, TRUE, '#32CD32', 5),
      ('cancelado', 'Cancelado', 'Pedido cancelado', FALSE, TRUE, '#DC143C', 99)
      ON CONFLICT (codigo) DO NOTHING
    `
    );

    console.log('   ✅ Estados de pedido insertados');

    // ===================================================================
    // 10. PRENDAS REALES - Muestras de Tierra
    // ===================================================================

    console.log('\n👗 Insertando prendas de muestra - Colección TIERRA...');

    // Algunas combinaciones reales del Excel
    const prendasTierra = [
      // Diseño Gaia
      {
        diseno: 'Gaia',
        tela: 'JerBor',
        precio_chamana: 49583,
        precio_arro: 42146,
        stock_inicial: 3,
        stock_vendido: 1,
      },
      {
        diseno: 'Gaia',
        tela: 'PluVer',
        precio_chamana: 50747,
        precio_arro: 43135,
        stock_inicial: 1,
        stock_vendido: 0,
      },
      {
        diseno: 'Gaia',
        tela: 'JerVerM',
        precio_chamana: 49583,
        precio_arro: 42146,
        stock_inicial: 1,
        stock_vendido: 1,
      },
      {
        diseno: 'Gaia',
        tela: 'CorNeg',
        precio_chamana: 54976,
        precio_arro: 46729,
        stock_inicial: 1,
        stock_vendido: 1,
      },
      // Diseño Nube
      {
        diseno: 'Nube',
        tela: 'FriVer',
        precio_chamana: 48822,
        precio_arro: 41499,
        stock_inicial: 1,
        stock_vendido: 1,
      },
      {
        diseno: 'Nube',
        tela: 'JerBor',
        precio_chamana: 49835,
        precio_arro: 42360,
        stock_inicial: 1,
        stock_vendido: 0,
      },
      {
        diseno: 'Nube',
        tela: 'CorNeg',
        precio_chamana: 55108,
        precio_arro: 46840,
        stock_inicial: 1,
        stock_vendido: 1,
      },
      // Diseño Tormenta
      {
        diseno: 'Tormenta',
        tela: 'FriBor',
        precio_chamana: 52364,
        precio_arro: 44509,
        stock_inicial: 1,
        stock_vendido: 0,
      },
      {
        diseno: 'Tormenta',
        tela: 'CorNeg',
        precio_chamana: 57742,
        precio_arro: 49081,
        stock_inicial: 1,
        stock_vendido: 0,
      },
      // Diseño Corteza (Palazzo)
      {
        diseno: 'Corteza',
        tela: 'GabAer',
        precio_chamana: 53528,
        precio_arro: 45499,
        stock_inicial: 2,
        stock_vendido: 0,
      },
      {
        diseno: 'Corteza',
        tela: 'GabVer',
        precio_chamana: 53528,
        precio_arro: 45499,
        stock_inicial: 1,
        stock_vendido: 0,
      },
      {
        diseno: 'Corteza',
        tela: 'GabNeg',
        precio_chamana: 58647,
        precio_arro: 49851,
        stock_inicial: 1,
        stock_vendido: 0,
      },
      // Diseño Raíz (Pantalón)
      {
        diseno: 'Raíz',
        tela: 'FriBor',
        precio_chamana: 50131,
        precio_arro: 42611,
        stock_inicial: 1,
        stock_vendido: 1,
      },
      {
        diseno: 'Raíz',
        tela: 'FriVer',
        precio_chamana: 50960,
        precio_arro: 43316,
        stock_inicial: 1,
        stock_vendido: 1,
      },
      {
        diseno: 'Raíz',
        tela: 'FriNeg',
        precio_chamana: 48510,
        precio_arro: 41234,
        stock_inicial: 1,
        stock_vendido: 1,
      },
    ];

    for (const prenda of prendasTierra) {
      const { diseno, tela, precio_chamana, stock_inicial, stock_vendido } = prenda;

      await executeQuery(
        client,
        `
        INSERT INTO prendas (
          nombre, categoria_id, diseno_id, tela_id, coleccion_id,
          precio_chamana,
          stock_inicial, stock_vendido, activa
        ) VALUES (
          $1,
          (SELECT c.id FROM categorias c JOIN disenos d ON d.tipo = c.nombre WHERE d.nombre = $2 LIMIT 1),
          (SELECT id FROM disenos WHERE nombre = $2),
          (SELECT id FROM telas WHERE nombre = $3),
          (SELECT id FROM colecciones WHERE nombre = 'Tierra'),
          $4, $5, $6, TRUE
        )
        ON CONFLICT DO NOTHING
      `,
        [`${diseno} - ${tela}`, diseno, tela, precio_chamana, stock_inicial, stock_vendido]
      );
    }

    console.log(`   ✅ ${prendasTierra.length} prendas de TIERRA insertadas`);

    await client.query('COMMIT');

    console.log('\n✅ Datos reales de Chamana insertados exitosamente!');
    console.log('   • Colección Tierra (Invierno 2025)');
    console.log('   • Colección Magia (Verano 2026)');
    console.log('   • Catálogos completos de telas y diseños reales\n');

    logSuccess('10_seed_chamana_real_data.js', 'Datos reales de Chamana insertados');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('10_seed_chamana_real_data.js', 'Seed data', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
seedRealData()
  .then(() => {
    console.log('🎉 Seed completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Seed falló\n');
    process.exit(1);
  });
