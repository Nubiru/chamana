/**
 * Script 07: Crear Triggers - Phase 3
 *
 * Creates 3 triggers for automatic data management:
 * 1. trigger_track_order_state - Tracks order state changes
 * 2. trigger_stock_alert - Alerts on critical stock levels
 * 3. trigger_manage_default_address - Manages default addresses
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function crearTriggers() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando triggers automáticos...\n');

    // ===================================================================
    // Trigger 1: Rastreo de Cambios de Estado de Pedidos
    // ===================================================================

    console.log('📦 Creando función track_order_state_change...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE FUNCTION track_order_state_change()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.estado IS DISTINCT FROM NEW.estado THEN
          INSERT INTO historial_estados_pedido (
            pedido_id,
            estado_anterior_id,
            estado_nuevo_id,
            usuario_cambio,
            automatico
          )
          SELECT
            NEW.id,
            (SELECT id FROM estados_pedido WHERE codigo = OLD.estado),
            (SELECT id FROM estados_pedido WHERE codigo = NEW.estado),
            current_user,
            FALSE;

          RAISE NOTICE 'Pedido % cambió de estado: % → %', NEW.id, OLD.estado, NEW.estado;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `
    );
    await executeQuery(
      client,
      "COMMENT ON FUNCTION track_order_state_change IS 'Registra cambios de estado en historial de pedidos'"
    );

    console.log('   ✅ Función track_order_state_change creada');

    console.log('📦 Creando trigger trigger_track_order_state...');
    await executeQuery(
      client,
      `
      DROP TRIGGER IF EXISTS trigger_track_order_state ON pedidos;
      CREATE TRIGGER trigger_track_order_state
      AFTER UPDATE ON pedidos
      FOR EACH ROW
      WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
      EXECUTE FUNCTION track_order_state_change()
    `
    );
    console.log('   ✅ trigger_track_order_state creado');

    // ===================================================================
    // Trigger 2: Alertas de Stock Crítico
    // ===================================================================

    console.log('\n📦 Creando función check_stock_alert...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE FUNCTION check_stock_alert()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.stock_disponible <= 5 AND NEW.stock_disponible < OLD.stock_disponible THEN
          RAISE NOTICE 'ALERTA: Stock crítico para prenda "%" (ID: %) - Solo % unidades disponibles',
                       NEW.nombre, NEW.id, NEW.stock_disponible;
        END IF;

        IF NEW.stock_disponible = 0 AND OLD.stock_disponible > 0 THEN
          RAISE WARNING 'AGOTADO: Prenda "%" (ID: %) se ha agotado completamente',
                        NEW.nombre, NEW.id;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `
    );
    await executeQuery(
      client,
      "COMMENT ON FUNCTION check_stock_alert IS 'Genera alertas cuando el stock alcanza niveles críticos'"
    );

    console.log('   ✅ Función check_stock_alert creada');

    console.log('📦 Creando trigger trigger_stock_alert...');
    await executeQuery(
      client,
      `
      DROP TRIGGER IF EXISTS trigger_stock_alert ON prendas;
      CREATE TRIGGER trigger_stock_alert
      AFTER UPDATE ON prendas
      FOR EACH ROW
      WHEN (NEW.stock_disponible IS DISTINCT FROM OLD.stock_disponible)
      EXECUTE FUNCTION check_stock_alert()
    `
    );
    console.log('   ✅ trigger_stock_alert creado');

    // ===================================================================
    // Trigger 3: Gestión de Dirección Predeterminada
    // ===================================================================

    console.log('\n📦 Creando función manage_default_address...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE FUNCTION manage_default_address()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.predeterminada = TRUE THEN
          -- Quitar predeterminada de otras direcciones del mismo tipo
          UPDATE direcciones
          SET predeterminada = FALSE
          WHERE cliente_id = NEW.cliente_id
              AND tipo = NEW.tipo
              AND id != COALESCE(NEW.id, 0);

          RAISE NOTICE 'Dirección % establecida como predeterminada para cliente %',
                       NEW.tipo, NEW.cliente_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `
    );
    await executeQuery(
      client,
      "COMMENT ON FUNCTION manage_default_address IS 'Asegura que solo haya una dirección predeterminada por tipo'"
    );

    console.log('   ✅ Función manage_default_address creada');

    console.log('📦 Creando trigger trigger_manage_default_address...');
    await executeQuery(
      client,
      `
      DROP TRIGGER IF EXISTS trigger_manage_default_address ON direcciones;
      CREATE TRIGGER trigger_manage_default_address
      BEFORE INSERT OR UPDATE ON direcciones
      FOR EACH ROW
      WHEN (NEW.predeterminada = TRUE)
      EXECUTE FUNCTION manage_default_address()
    `
    );
    console.log('   ✅ trigger_manage_default_address creado');

    await client.query('COMMIT');

    logSuccess('07_crear_triggers.js', 'Triggers creados exitosamente', {
      'Funciones creadas': 3,
      'Triggers creados': 3,
    });

    console.log('\n📋 Triggers activos:');
    console.log('   • trigger_track_order_state - Rastrea cambios de estado en pedidos');
    console.log('   • trigger_stock_alert - Alertas automáticas de stock crítico');
    console.log('   • trigger_manage_default_address - Gestión de direcciones predeterminadas\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('07_crear_triggers.js', 'Creación de Triggers', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
crearTriggers()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
