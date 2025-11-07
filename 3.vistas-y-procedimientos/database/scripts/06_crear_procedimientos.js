/**
 * Script 06: Crear Procedimientos Almacenados - Phase 3
 *
 * Creates 3 stored procedures:
 * 1. procesar_pedido - Complete order processing with validations
 * 2. reabastecer_inventario - Restock inventory with audit trail
 * 3. calcular_comision_vendedor - Calculate sales commissions
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

async function crearProcedimientos() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando procedimientos almacenados...\n');

    // ===================================================================
    // Procedimiento 1: Procesar Pedido Completo
    // ===================================================================

    console.log('📦 Creando procedimiento procesar_pedido...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE FUNCTION procesar_pedido(
        p_cliente_id INTEGER,
        p_items JSONB,
        p_descuento DECIMAL DEFAULT 0
      ) RETURNS INTEGER AS $$
      DECLARE
        v_pedido_id INTEGER;
        v_subtotal DECIMAL := 0;
        v_total DECIMAL;
        v_item JSONB;
        v_prenda_stock INTEGER;
      BEGIN
        -- Validar cliente existe y está activo
        IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id AND activo = TRUE) THEN
          RAISE EXCEPTION 'Cliente % no existe o está inactivo', p_cliente_id;
        END IF;

        -- Crear pedido
        INSERT INTO pedidos (cliente_id, subtotal, descuento, total, estado, fecha_pedido)
        VALUES (p_cliente_id, 0, p_descuento, 0, 'pendiente', CURRENT_TIMESTAMP)
        RETURNING id INTO v_pedido_id;

        -- Procesar cada item
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
          -- Verificar stock disponible
          SELECT stock_disponible INTO v_prenda_stock
          FROM prendas
          WHERE id = (v_item->>'prenda_id')::INTEGER;

          IF v_prenda_stock IS NULL THEN
            RAISE EXCEPTION 'Prenda ID % no existe', (v_item->>'prenda_id')::INTEGER;
          END IF;

          IF v_prenda_stock < (v_item->>'cantidad')::INTEGER THEN
            RAISE EXCEPTION 'Stock insuficiente para prenda ID %. Disponible: %, Solicitado: %',
              (v_item->>'prenda_id')::INTEGER, v_prenda_stock, (v_item->>'cantidad')::INTEGER;
          END IF;

          -- Insertar item del pedido
          INSERT INTO pedidos_prendas (
            pedido_id,
            prenda_id,
            cantidad,
            precio_unitario,
            subtotal
          )
          SELECT
            v_pedido_id,
            (v_item->>'prenda_id')::INTEGER,
            (v_item->>'cantidad')::INTEGER,
            p.precio_chamana,
            p.precio_chamana * (v_item->>'cantidad')::INTEGER
          FROM prendas p
          WHERE p.id = (v_item->>'prenda_id')::INTEGER;

          -- Actualizar stock
          UPDATE prendas
          SET stock_vendido = stock_vendido + (v_item->>'cantidad')::INTEGER,
              fecha_ultima_venta = CURRENT_TIMESTAMP
          WHERE id = (v_item->>'prenda_id')::INTEGER;

          -- Registrar movimiento de inventario
          INSERT INTO movimientos_inventario (
            prenda_id, tipo, cantidad,
            stock_anterior, stock_nuevo,
            pedido_id, motivo, fecha
          )
          SELECT
            id,
            'venta',
            (v_item->>'cantidad')::INTEGER,
            stock_disponible + (v_item->>'cantidad')::INTEGER,
            stock_disponible,
            v_pedido_id,
            'Venta en pedido #' || v_pedido_id,
            CURRENT_TIMESTAMP
          FROM prendas
          WHERE id = (v_item->>'prenda_id')::INTEGER;
        END LOOP;

        -- Calcular totales
        SELECT SUM(subtotal) INTO v_subtotal
        FROM pedidos_prendas WHERE pedido_id = v_pedido_id;

        v_total := v_subtotal - p_descuento;

        -- Actualizar totales del pedido
        UPDATE pedidos
        SET subtotal = v_subtotal, total = v_total
        WHERE id = v_pedido_id;

        RAISE NOTICE 'Pedido % creado exitosamente. Total: $%', v_pedido_id, v_total;

        RETURN v_pedido_id;

      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Error procesando pedido: %', SQLERRM;
          RAISE;
      END;
      $$ LANGUAGE plpgsql
    `
    );
    await executeQuery(
      client,
      "COMMENT ON FUNCTION procesar_pedido IS 'Procesa un pedido completo con validaciones y actualización de stock'"
    );
    console.log('   ✅ procesar_pedido creado');

    // ===================================================================
    // Procedimiento 2: Reabastecer Inventario
    // ===================================================================

    console.log('\n📦 Creando procedimiento reabastecer_inventario...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE FUNCTION reabastecer_inventario(
        p_prenda_id INTEGER,
        p_cantidad INTEGER,
        p_motivo TEXT DEFAULT 'Reabastecimiento manual'
      ) RETURNS BOOLEAN AS $$
      DECLARE
        v_stock_anterior INTEGER;
        v_stock_nuevo INTEGER;
        v_prenda_nombre VARCHAR;
      BEGIN
        -- Validar prenda existe y está activa
        SELECT stock_inicial, nombre INTO v_stock_anterior, v_prenda_nombre
        FROM prendas
        WHERE id = p_prenda_id AND activa = TRUE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Prenda ID % no existe o está inactiva', p_prenda_id;
        END IF;

        IF p_cantidad <= 0 THEN
          RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
        END IF;

        v_stock_nuevo := v_stock_anterior + p_cantidad;

        -- Actualizar stock
        UPDATE prendas
        SET stock_inicial = v_stock_nuevo,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = p_prenda_id;

        -- Registrar movimiento
        INSERT INTO movimientos_inventario (
          prenda_id, tipo, cantidad,
          stock_anterior, stock_nuevo, motivo, fecha
        )
        VALUES (
          p_prenda_id,
          'ajuste',
          p_cantidad,
          v_stock_anterior,
          v_stock_nuevo,
          p_motivo,
          CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Inventario actualizado: % - Stock: % → % (+%)',
          v_prenda_nombre, v_stock_anterior, v_stock_nuevo, p_cantidad;

        RETURN TRUE;

      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Error reabasteciendo inventario: %', SQLERRM;
          RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql
    `
    );
    await executeQuery(
      client,
      "COMMENT ON FUNCTION reabastecer_inventario IS 'Reabastecer inventario de una prenda con registro de movimiento'"
    );
    console.log('   ✅ reabastecer_inventario creado');

    // ===================================================================
    // Procedimiento 3: Calcular Comisión de Vendedor
    // ===================================================================

    console.log('\n📦 Creando procedimiento calcular_comision_vendedor...');
    await executeQuery(
      client,
      `
      CREATE OR REPLACE FUNCTION calcular_comision_vendedor(
        p_fecha_inicio DATE,
        p_fecha_fin DATE,
        p_porcentaje_comision DECIMAL DEFAULT 5.0
      ) RETURNS TABLE (
        fecha DATE,
        total_ventas DECIMAL,
        comision DECIMAL,
        pedidos INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          DATE(p.fecha_pedido) as fecha,
          SUM(p.total) as total_ventas,
          ROUND(SUM(p.total) * (p_porcentaje_comision / 100), 2) as comision,
          COUNT(p.id)::INTEGER as pedidos
        FROM pedidos p
        WHERE p.fecha_pedido BETWEEN p_fecha_inicio AND p_fecha_fin
          AND p.estado = 'completado'
        GROUP BY DATE(p.fecha_pedido)
        ORDER BY fecha;
      END;
      $$ LANGUAGE plpgsql
    `
    );
    await executeQuery(
      client,
      "COMMENT ON FUNCTION calcular_comision_vendedor IS 'Calcula comisiones de venta por día en un rango de fechas'"
    );
    console.log('   ✅ calcular_comision_vendedor creado');

    await client.query('COMMIT');

    logSuccess('06_crear_procedimientos.js', 'Procedimientos almacenados creados exitosamente', {
      'Procedimientos creados': 3,
    });

    console.log('\n📋 Procedimientos disponibles:');
    console.log(
      '   • procesar_pedido(cliente_id, items_jsonb, descuento) - Procesa pedido completo'
    );
    console.log('   • reabastecer_inventario(prenda_id, cantidad, motivo) - Reabastece stock');
    console.log(
      '   • calcular_comision_vendedor(fecha_inicio, fecha_fin, porcentaje) - Calcula comisiones\n'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logError('06_crear_procedimientos.js', 'Creación de Procedimientos', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
crearProcedimientos()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
