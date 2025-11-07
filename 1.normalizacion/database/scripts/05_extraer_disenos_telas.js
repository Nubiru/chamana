// =====================================================
// Script: Extraer Diseños y Telas - Fase 1 (1NF)
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Descripción: Extrae diseños y telas únicas desde Fase 0
// =====================================================

const { pool, fase0Pool } = require('./00_db');

async function extraerDisenosTelas() {
  try {
    console.log('🔍 Extrayendo diseños y telas desde chamana_db_fase0...\n');

    // Obtener todas las prendas de Fase 0
    const prendasResult = await fase0Pool.query(
      'SELECT nombre_completo, tipo, tela_nombre FROM prendas'
    );

    // Extraer diseños únicos
    console.log('🎨 Extrayendo diseños...');
    const disenosSet = new Set();

    for (const prenda of prendasResult.rows) {
      // Lógica: "Vestido Marbella Algodón Stretch" → "Marbella"
      // Remover tipo al inicio y tela_nombre al final
      let nombreCompleto = prenda.nombre_completo;
      const tipoPrenda = prenda.tipo;
      const tipoTela = prenda.tela_nombre;

      // Remover tipo_prenda del inicio
      if (nombreCompleto.startsWith(tipoPrenda)) {
        nombreCompleto = nombreCompleto.slice(tipoPrenda.length).trim();
      }

      // Remover tipo_tela del final
      if (tipoTela && nombreCompleto.endsWith(tipoTela)) {
        nombreCompleto = nombreCompleto.slice(0, -tipoTela.length).trim();
      }

      // Lo que queda es el diseño
      if (nombreCompleto) {
        disenosSet.add(nombreCompleto);
      }
    }

    // Insertar diseños
    let disenoCount = 0;
    for (const diseno of disenosSet) {
      await pool.query(
        'INSERT INTO disenos (nombre, descripcion, activo) VALUES ($1, $2, $3) ON CONFLICT (nombre) DO NOTHING',
        [diseno, `Diseño ${diseno}`, true]
      );
      disenoCount++;
    }
    console.log(`   ✅ ${disenoCount} diseños únicos extraídos`);

    // Extraer telas únicas
    console.log('🧵 Extrayendo telas...');
    const telasSet = new Set();

    for (const prenda of prendasResult.rows) {
      if (prenda.tela_nombre) {
        telasSet.add(prenda.tela_nombre);
      }
    }

    // Insertar telas
    let telaCount = 0;
    for (const tela of telasSet) {
      // Determinar tipo basado en el nombre
      let tipo = 'Natural';
      if (tela.toLowerCase().includes('stretch') || tela.toLowerCase().includes('lycra')) {
        tipo = 'Sintético';
      }

      await pool.query(
        'INSERT INTO telas (nombre, tipo, activo) VALUES ($1, $2, $3) ON CONFLICT (nombre) DO NOTHING',
        [tela, tipo, true]
      );
      telaCount++;
    }
    console.log(`   ✅ ${telaCount} telas únicas extraídas`);

    // Verificación
    console.log('\n📊 Verificando extracción:');
    const disenosCount = await pool.query('SELECT COUNT(*) FROM disenos');
    const telasCount = await pool.query('SELECT COUNT(*) FROM telas');

    console.log(`   - Diseños: ${disenosCount.rows[0].count}`);
    console.log(`   - Telas: ${telasCount.rows[0].count}`);

    // Mostrar ejemplos
    console.log('\n📋 Ejemplos de diseños extraídos:');
    const disenosEjemplos = await pool.query('SELECT nombre FROM disenos LIMIT 5');
    for (const d of disenosEjemplos.rows) {
      console.log(`   - ${d.nombre}`);
    }

    console.log('\n📋 Ejemplos de telas extraídas:');
    const telasEjemplos = await pool.query('SELECT nombre, tipo FROM telas LIMIT 5');
    for (const t of telasEjemplos.rows) {
      console.log(`   - ${t.nombre} (${t.tipo})`);
    }

    console.log('\n✅ Diseños y telas extraídos exitosamente!\n');
    console.log('📍 Siguiente paso: Ejecuta 06_migrar_prendas.js\n');
  } catch (error) {
    console.error('❌ Error al extraer diseños y telas:', error.message);
    throw error;
  } finally {
    await pool.end();
    await fase0Pool.end();
  }
}

// Ejecutar
extraerDisenosTelas();
