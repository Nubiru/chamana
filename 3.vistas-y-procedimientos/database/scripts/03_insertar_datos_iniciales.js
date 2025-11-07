/**
 * Script 03: Insertar Datos Iniciales - Phase 3
 *
 * Inserts initial data for new 3NF tables:
 * - tipos_prenda (catalog of garment types)
 * - estados_pedido (order state machine)
 * - proveedores (suppliers)
 * - metodos_pago (payment methods)
 *
 * These tables need initial data before migration can proceed.
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function insertarDatosIniciales() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Insertando datos iniciales para tablas 3NF...\n');

    // ===================================================================
    // Tipos de Prenda
    // ===================================================================

    console.log('📦 Insertando tipos de prenda...');
    await executeQuery(
      client,
      `
      INSERT INTO tipos_prenda (nombre, subcategoria, temporada_recomendada, ocasion_uso, cuidados_lavado) VALUES
        ('Blusa', 'Casual', 'Todo el año', 'Diario, Oficina', 'Lavar a máquina 30°C'),
        ('Vestido', 'Formal', 'Primavera/Verano', 'Eventos, Ocasiones especiales', 'Lavar a mano o tintorería'),
        ('Pantalón', 'Formal', 'Todo el año', 'Oficina, Reuniones', 'Lavar a máquina 40°C'),
        ('Falda', 'Casual/Formal', 'Primavera/Verano', 'Oficina, Eventos', 'Lavar a máquina 30°C'),
        ('Saco', 'Formal', 'Otoño/Invierno', 'Oficina, Reuniones', 'Tintorería recomendada')
      ON CONFLICT (nombre) DO NOTHING
    `
    );
    console.log('   ✅ tipos_prenda');

    // ===================================================================
    // Estados de Pedido
    // ===================================================================

    console.log('\n📦 Insertando estados de pedido...');
    await executeQuery(
      client,
      `
      INSERT INTO estados_pedido (codigo, nombre, descripcion, es_inicial, es_final, permite_edicion, permite_cancelacion, color_hex, orden_workflow) VALUES
        ('pendiente', 'Pendiente', 'Pedido recibido, pendiente de confirmación', TRUE, FALSE, TRUE, TRUE, '#FFA500', 1),
        ('confirmado', 'Confirmado', 'Pedido confirmado, en proceso', FALSE, FALSE, FALSE, TRUE, '#4169E1', 2),
        ('preparando', 'Preparando', 'Preparando productos para envío', FALSE, FALSE, FALSE, TRUE, '#9370DB', 3),
        ('enviado', 'Enviado', 'Pedido enviado al cliente', FALSE, FALSE, FALSE, FALSE, '#20B2AA', 4),
        ('entregado', 'Entregado', 'Pedido entregado al cliente', FALSE, TRUE, FALSE, FALSE, '#32CD32', 5),
        ('completado', 'Completado', 'Pedido completado y pagado', FALSE, TRUE, FALSE, FALSE, '#228B22', 6),
        ('cancelado', 'Cancelado', 'Pedido cancelado', FALSE, TRUE, FALSE, FALSE, '#DC143C', 99)
      ON CONFLICT (codigo) DO NOTHING
    `
    );
    console.log('   ✅ estados_pedido');

    // ===================================================================
    // Proveedores
    // ===================================================================

    console.log('\n📦 Insertando proveedores...');
    await executeQuery(
      client,
      `
      INSERT INTO proveedores (nombre, telefono, email, dias_entrega_promedio, calificacion) VALUES
        ('Textiles del Norte', '555-0101', 'contacto@texnorte.mx', 7, 4.5),
        ('Telas Premium SA', '555-0202', 'ventas@telaspremium.mx', 5, 4.8),
        ('Importadora Fashion', '555-0303', 'info@impfashion.mx', 14, 4.2)
      ON CONFLICT (rfc) DO NOTHING
    `
    );
    console.log('   ✅ proveedores');

    // ===================================================================
    // Métodos de Pago
    // ===================================================================

    console.log('\n📦 Insertando métodos de pago...');
    await executeQuery(
      client,
      `
      INSERT INTO metodos_pago (codigo, nombre, tipo, comision_porcentaje, dias_procesamiento) VALUES
        ('efectivo', 'Efectivo', 'efectivo', 0, 0),
        ('tarjeta_c', 'Tarjeta de Crédito', 'tarjeta_credito', 3.5, 1),
        ('tarjeta_d', 'Tarjeta de Débito', 'tarjeta_debito', 2.0, 1),
        ('transferencia', 'Transferencia Bancaria', 'transferencia', 0, 1),
        ('paypal', 'PayPal', 'paypal', 4.0, 2)
      ON CONFLICT (codigo) DO NOTHING
    `
    );
    console.log('   ✅ metodos_pago');

    await client.query('COMMIT');

    logSuccess('03_insertar_datos_iniciales.js', 'Datos iniciales insertados exitosamente', {
      'Tipos de prenda': 5,
      'Estados de pedido': 7,
      Proveedores: 3,
      'Métodos de pago': 5,
    });

    console.log('\n📋 Datos iniciales listos para migración\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('03_insertar_datos_iniciales.js', 'Inserción de Datos Iniciales', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
insertarDatosIniciales()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
