// =====================================================
// Script 04: Insertar Prendas Reales
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Propósito: Insertar productos reales del catálogo CHAMANA
// Datos extraídos de: 1.normalizacion/prendas.png y telas.png
// =====================================================

const { pool } = require('./00_db');

// Mapeo de códigos de tela a nombres completos (de telas.png)
const telaMap = {
  JerBor: 'Jersey Bordó',
  PluVer: 'Plush Verde',
  JerVerM: 'Jersey Verde Musgo',
  CorNeg: 'Coral Negro',
  FriVer: 'Frisa Verde',
  JerVerA: 'Jersey Verde Agua',
  FriBor: 'Frisa Bordó',
  FriNeg: 'Frisa Negro',
  Morley: 'Morley',
  Modal: 'Modal',
  PluNeg: 'Plush Negro',
  GabAer: 'Gabardina Aereo',
  GabVer: 'Gabardina Verde',
  GabNeg: 'Gabardina Negro',
  FriVer: 'Frisa Verde'
};

// Productos reales de CHAMANA (extraídos de prendas.png)
// Formato: [diseño, tela_codigo, tipo, stock, precio_chamana, precio_arro]
const prendas = [
  // === BUZOS (Tipo: Buzo) ===
  ['Gaia', 'JerBor', 'Buzo', 1, 40000.0, 34000.0],
  ['Gaia', 'PluVer', 'Buzo', 1, 40000.0, 34000.0],
  ['Gaia', 'JerVerM', 'Buzo', 1, 40000.0, 34000.0],
  ['Gaia', 'CorNeg', 'Buzo', 1, 50000.0, 42500.0],

  ['Nube', 'FriVer', 'Buzo', 1, 40000.0, 34000.0],
  ['Nube', 'JerBor', 'Buzo', 1, 40000.0, 34000.0],
  ['Nube', 'CorNeg', 'Buzo', 1, 50000.0, 42500.0],
  ['Nube', 'JerVerA', 'Buzo', 3, 40000.0, 34000.0],
  ['Nube', 'JerVerM', 'Buzo', 4, 40000.0, 34000.0],
  ['Nube', 'FriNeg', 'Buzo', 2, 40000.0, 34000.0],

  ['Tormenta', 'FriBor', 'Buzo', 1, 40000.0, 34000.0],
  ['Tormenta', 'CorNeg', 'Buzo', 1, 50000.0, 42500.0],

  // === REMERAS (Tipo: Remera) ===
  ['Nube', 'Morley', 'Remera', 1, 10000.0, 8500.0],
  ['Nube', 'Modal', 'Remera', 2, 10000.0, 8500.0],

  ['Rocio', 'Modal', 'Remera', 2, 10000.0, 8500.0],
  ['Rocio', 'Morley', 'Remera', 3, 10000.0, 8500.0],

  ['Brisa', 'Modal', 'Remera', 1, 10000.0, 8500.0],

  // === VESTIDOS (Tipo: Vestido) ===
  ['Aire', 'PluNeg', 'Vestido', 1, 27000.0, 22950.0],

  // === PALAZZOS (Tipo: Palazzo) ===
  ['Corteza', 'GabAer', 'Palazzo', 2, 30000.0, 25500.0],
  ['Corteza', 'GabVer', 'Palazzo', 1, 30000.0, 25500.0],
  ['Corteza', 'GabNeg', 'Palazzo', 1, 40000.0, 34000.0],
  ['Corteza', 'FriBor', 'Palazzo', 1, 30000.0, 25500.0],
  ['Corteza', 'FriVer', 'Palazzo', 1, 30000.0, 25500.0],
  ['Corteza', 'FriNeg', 'Palazzo', 1, 30000.0, 25500.0],
  ['Corteza', 'PluNeg', 'Palazzo', 2, 40000.0, 34000.0],
  ['Corteza', 'PluVer', 'Palazzo', 1, 40000.0, 34000.0],

  // === PANTALONES (Tipo: Pantalón) ===
  ['Raiz', 'FriBor', 'Pantalón', 2, 40000.0, 34000.0],
  ['Raiz', 'FriVer', 'Pantalón', 2, 40000.0, 34000.0],
  ['Raiz', 'FriNeg', 'Pantalón', 2, 40000.0, 34000.0],
  ['Raiz', 'PluNeg', 'Pantalón', 1, 40000.0, 34000.0]

  // === NOTA PARA AGREGAR MÁS PRODUCTOS ===
  // Formato: ['Diseño', 'TelaCode', 'Tipo', stock, precio_chamana, precio_arro],
  // Ejemplo:
  // ['NuevoDiseño', 'JerBor', 'Buzo', 5, 45000.00, 38250.00],
];

// Mapeo de tipos a IDs de categorías (deben coincidir con 03_insertar_categorias.js)
const categoriaMap = {
  Buzo: 1,
  Remera: 2,
  Vestido: 3,
  Palazzo: 4,
  Pantalón: 5
};

async function insertarPrendas() {
  console.log('=====================================================');
  console.log('👗 CHAMANA - Inserción de Prendas Reales');
  console.log('=====================================================\n');

  try {
    console.log(
      `📌 Insertando ${prendas.length} prendas del catálogo real...\n`
    );

    let insertadas = 0;
    let errores = 0;

    for (const [
      diseno,
      telaCode,
      tipo,
      stock,
      precioChamana,
      precioArro
    ] of prendas) {
      try {
        const telaNombre = telaMap[telaCode] || telaCode;
        const nombreCompleto = `${diseno} - ${telaNombre}`;
        const categoriaId = categoriaMap[tipo];

        const query = `
          INSERT INTO prendas (
            nombre_completo, 
            tipo, 
            tela_nombre, 
            precio_chamana, 
            precio_arro, 
            stock, 
            categoria_id, 
            activa
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id;
        `;

        const valores = [
          nombreCompleto,
          tipo,
          telaNombre,
          precioChamana,
          precioArro,
          stock,
          categoriaId,
          true
        ];

        const resultado = await pool.query(query, valores);
        insertadas++;

        if (insertadas % 10 === 0) {
          console.log(`✅ ${insertadas} prendas insertadas...`);
        }
      } catch (error) {
        errores++;
        console.error(
          `❌ Error insertando "${diseno} - ${telaCode}":`,
          error.message
        );
      }
    }

    console.log(`\n✅ Proceso completado: ${insertadas} prendas insertadas`);
    if (errores > 0) {
      console.log(`⚠️  ${errores} prendas con errores`);
    }

    // Mostrar resumen por categoría
    console.log('\n📊 Resumen por categoría:');
    const resumen = await pool.query(`
      SELECT 
        c.nombre as categoria,
        COUNT(p.id) as cantidad,
        SUM(p.stock) as stock_total,
        ROUND(AVG(p.precio_chamana), 2) as precio_promedio
      FROM categorias c
      LEFT JOIN prendas p ON c.id = p.categoria_id
      GROUP BY c.id, c.nombre
      ORDER BY c.id;
    `);

    resumen.rows.forEach((row) => {
      console.log(
        `   ${row.categoria}: ${row.cantidad} productos, Stock total: ${row.stock_total}, Precio promedio: $${row.precio_promedio}`
      );
    });

    // Mostrar total
    const total = await pool.query('SELECT COUNT(*) as total FROM prendas;');
    console.log(`\n   TOTAL: ${total.rows[0].total} prendas en catálogo`);

    console.log('\n=====================================================');
    console.log('✨ Prendas reales insertadas exitosamente!');
    console.log('   Catálogo CHAMANA cargado con datos reales');
    console.log('=====================================================');
    console.log('✨ Siguiente paso: Ejecutar "node 05_insertar_clientes.js"');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Error al insertar prendas:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que las tablas existan');
    console.error('   - Verifica que las categorías estén insertadas');
    console.error('   - Ejecuta los scripts anteriores en orden');
  } finally {
    await pool.end();
  }
}

// Ejecutar función
insertarPrendas();
