// =====================================================
// Script 06: Listar Todo
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Propósito: Verificar y listar todos los datos insertados
// =====================================================

const { pool } = require('./00_db');

async function listarTodo() {
  console.log('=====================================================');
  console.log('📊 CHAMANA - Verificación de Datos');
  console.log('=====================================================\n');

  try {
    // ===== CATEGORÍAS =====
    console.log('📁 CATEGORÍAS:');
    console.log('─────────────────────────────────────────────────────');
    const categorias = await pool.query(
      'SELECT * FROM categorias ORDER BY id;'
    );

    categorias.rows.forEach((cat) => {
      console.log(`${cat.id}. ${cat.nombre}`);
      console.log(`   ${cat.descripcion}`);
      console.log(`   Estado: ${cat.activa ? '✅ Activa' : '❌ Inactiva'}\n`);
    });

    // ===== PRENDAS =====
    console.log('\n👗 PRENDAS (Muestra de 10):');
    console.log('─────────────────────────────────────────────────────');
    const prendas = await pool.query(`
      SELECT 
        p.id,
        p.nombre_completo,
        p.tipo,
        p.tela_nombre,
        p.precio_chamana,
        p.precio_arro,
        p.stock,
        c.nombre as categoria
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id
      LIMIT 10;
    `);

    prendas.rows.forEach((p) => {
      const descuento = p.precio_arro
        ? Math.round((1 - p.precio_chamana / p.precio_arro) * 100)
        : 0;
      console.log(`${p.id}. ${p.nombre_completo}`);
      console.log(`   Tipo: ${p.tipo} | Categoría: ${p.categoria}`);
      console.log(`   Tela: ${p.tela_nombre}`);
      console.log(
        `   Precio CHAMANA: $${p.precio_chamana.toLocaleString('es-MX')}`
      );
      if (p.precio_arro) {
        console.log(
          `   Precio Arro: $${p.precio_arro.toLocaleString(
            'es-MX'
          )} (${descuento}% desc)`
        );
      }
      console.log(`   Stock: ${p.stock} unidades\n`);
    });

    // ===== CLIENTES =====
    console.log('\n👥 CLIENTES (Muestra de 10):');
    console.log('─────────────────────────────────────────────────────');
    const clientes = await pool.query(`
      SELECT 
        id,
        nombre,
        apellido,
        email,
        telefono,
        TO_CHAR(fecha_registro, 'DD/MM/YYYY HH24:MI') as fecha_registro,
        activo
      FROM clientes
      ORDER BY id
      LIMIT 10;
    `);

    clientes.rows.forEach((c) => {
      const estado = c.activo ? '✅' : '❌';
      console.log(`${c.id}. ${c.nombre} ${c.apellido} ${estado}`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Teléfono: ${c.telefono}`);
      console.log(`   Registro: ${c.fecha_registro}\n`);
    });

    // ===== ESTADÍSTICAS GENERALES =====
    console.log('\n📊 ESTADÍSTICAS GENERALES:');
    console.log('─────────────────────────────────────────────────────');

    // Total por tabla
    const totalCategorias = await pool.query(
      'SELECT COUNT(*) as total FROM categorias;'
    );
    const totalPrendas = await pool.query(
      'SELECT COUNT(*) as total FROM prendas;'
    );
    const totalClientes = await pool.query(
      'SELECT COUNT(*) as total FROM clientes;'
    );

    console.log(`📁 Categorías: ${totalCategorias.rows[0].total}`);
    console.log(`👗 Prendas: ${totalPrendas.rows[0].total}`);
    console.log(`👥 Clientes: ${totalClientes.rows[0].total}`);

    // Estadísticas de prendas
    const estadsPrendas = await pool.query(`
      SELECT 
        SUM(stock) as stock_total,
        ROUND(AVG(precio_chamana), 2) as precio_promedio,
        MIN(precio_chamana) as precio_minimo,
        MAX(precio_chamana) as precio_maximo
      FROM prendas;
    `);

    const stats = estadsPrendas.rows[0];
    console.log(`\n📦 Stock total: ${stats.stock_total} unidades`);
    console.log(
      `💰 Precio promedio: $${
        stats.precio_promedio?.toLocaleString('es-MX') || 0
      }`
    );
    console.log(
      `💵 Precio mínimo: $${stats.precio_minimo?.toLocaleString('es-MX') || 0}`
    );
    console.log(
      `💎 Precio máximo: $${stats.precio_maximo?.toLocaleString('es-MX') || 0}`
    );

    // Prendas por categoría
    console.log('\n📊 Distribución por categoría:');
    const distribucion = await pool.query(`
      SELECT 
        c.nombre,
        COUNT(p.id) as cantidad,
        SUM(p.stock) as stock_categoria
      FROM categorias c
      LEFT JOIN prendas p ON c.id = p.categoria_id
      GROUP BY c.id, c.nombre
      ORDER BY cantidad DESC;
    `);

    distribucion.rows.forEach((d) => {
      console.log(
        `   ${d.nombre}: ${d.cantidad} productos (${d.stock_categoria} unidades)`
      );
    });

    console.log('\n=====================================================');
    console.log('✨ Base de datos CHAMANA configurada exitosamente!');
    console.log('=====================================================');
    console.log('📌 Próximos pasos:');
    console.log('   1. Conectar con pgAdmin para explorar visualmente');
    console.log(
      '   2. Iniciar servidor web: cd ../../web && npm install && npm run dev'
    );
    console.log('   3. Crear diagramas MER/DER (Mermaid)');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Error al listar datos:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que los datos estén insertados');
    console.error('   - Ejecuta todos los scripts anteriores en orden');
  } finally {
    await pool.end();
  }
}

// Ejecutar función
listarTodo();
