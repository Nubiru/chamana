/**
 * Script 06: Generar Pedidos de Prueba
 *
 * Generates 10 sample orders for testing the orders system:
 * - Mix of order states (pendiente, completado, cancelado)
 * - Variable order sizes (1-3 items per order)
 * - Realistic pricing from prendas table
 * - Automatic stock updates for completed orders
 * - Inventory movement logging
 *
 * Uses micro-transactions: Each order in its own transaction for independence.
 * If one order fails, others continue.
 *
 * If this script fails:
 * 1. Check if prendas and clientes have data
 * 2. Verify tables exist: pedidos, pedidos_prendas, movimientos_inventario
 * 3. Manual cleanup: TRUNCATE pedidos, pedidos_prendas, movimientos_inventario CASCADE;
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');

// Helper function to get random element from array
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random date in the past N days
function randomPastDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
}

async function generarPedidosPrueba() {
  const pool = createPool('fase2');

  try {
    console.log('🚀 Iniciando generación de pedidos de prueba...\n');

    // Get all active clientes and prendas
    const clientesResult = await pool.query(
      'SELECT id FROM clientes WHERE activo = true LIMIT 10'
    );
    // Note: Not filtering by stock > 0 because we'll initialize stock through orders
    const prendasResult = await pool.query(
      'SELECT id, nombre, precio_chamana, stock_disponible FROM prendas WHERE activa = true LIMIT 20'
    );

    if (clientesResult.rows.length === 0 || prendasResult.rows.length === 0) {
      throw new Error(
        'No hay clientes o prendas disponibles para generar pedidos'
      );
    }

    const clientes = clientesResult.rows;
    const prendas = prendasResult.rows;

    console.log(`📊 Datos disponibles:`);
    console.log(`   • Clientes: ${clientes.length}`);
    console.log(`   • Prendas: ${prendas.length}\n`);

    const orderSpecs = [
      {
        items: 2,
        estado: 'completado',
        daysAgo: 60,
        purpose: 'Pedido antiguo completado'
      },
      {
        items: 1,
        estado: 'completado',
        daysAgo: 30,
        purpose: 'Pedido del mes pasado'
      },
      {
        items: 3,
        estado: 'completado',
        daysAgo: 14,
        purpose: 'Pedido hace 2 semanas'
      },
      {
        items: 2,
        estado: 'completado',
        daysAgo: 7,
        purpose: 'Pedido de la semana pasada'
      },
      {
        items: 1,
        estado: 'completado',
        daysAgo: 2,
        purpose: 'Pedido reciente'
      },
      { items: 2, estado: 'completado', daysAgo: 0, purpose: 'Pedido de hoy' },
      {
        items: 1,
        estado: 'pendiente',
        daysAgo: 0,
        purpose: 'Pedido pendiente'
      },
      {
        items: 2,
        estado: 'pendiente',
        daysAgo: 1,
        purpose: 'Pedido pendiente ayer'
      },
      {
        items: 3,
        estado: 'pendiente',
        daysAgo: 3,
        purpose: 'Pedido pendiente hace 3 días'
      },
      { items: 1, estado: 'cancelado', daysAgo: 5, purpose: 'Pedido cancelado' }
    ];

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < orderSpecs.length; i++) {
      const spec = orderSpecs[i];
      const orderNum = i + 1;
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        console.log(
          `📦 Pedido ${orderNum}/${orderSpecs.length}: ${spec.purpose}`
        );

        // Select random cliente
        const cliente = randomElement(clientes);

        // Select random prendas for this order
        const orderItems = [];
        const selectedPrendaIds = new Set();

        for (let j = 0; j < spec.items; j++) {
          // Find a prenda not yet in this order
          let prenda;
          let attempts = 0;
          do {
            prenda = randomElement(prendas);
            attempts++;
          } while (selectedPrendaIds.has(prenda.id) && attempts < 20);

          if (attempts >= 20) continue; // Skip if we can't find unique prenda

          selectedPrendaIds.add(prenda.id);
          const cantidad = randomInt(1, 2); // 1 or 2 units

          orderItems.push({
            prenda_id: prenda.id,
            nombre: prenda.nombre,
            cantidad,
            precio_unitario: parseFloat(prenda.precio_chamana),
            subtotal: cantidad * parseFloat(prenda.precio_chamana)
          });
        }

        if (orderItems.length === 0) {
          throw new Error('No se pudieron seleccionar prendas para el pedido');
        }

        // Calculate totals
        const subtotal = orderItems.reduce(
          (sum, item) => sum + item.subtotal,
          0
        );
        const descuento = 0; // No discount for sample orders
        const total = subtotal - descuento;

        // Generate order date
        const fechaPedido =
          spec.daysAgo === 0 ? new Date() : randomPastDate(spec.daysAgo);

        // Create pedido
        const pedidoResult = await executeQuery(
          client,
          `
          INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, descuento, total, notas)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `,
          [
            cliente.id,
            fechaPedido,
            spec.estado,
            subtotal,
            descuento,
            total,
            `Pedido de prueba - ${spec.purpose}`
          ]
        );

        const pedidoId = pedidoResult.rows[0].id;

        // Create pedido items
        for (const item of orderItems) {
          await executeQuery(
            client,
            `
            INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5)
          `,
            [
              pedidoId,
              item.prenda_id,
              item.cantidad,
              item.precio_unitario,
              item.subtotal
            ]
          );

          console.log(
            `      • ${item.nombre} x${
              item.cantidad
            } = $${item.subtotal.toFixed(0)}`
          );
        }

        // If order is completed, update stock and log movements
        if (spec.estado === 'completado') {
          const fechaCompletado = fechaPedido;

          // Update pedido with completion date
          await executeQuery(
            client,
            `
            UPDATE pedidos SET fecha_completado = $1 WHERE id = $2
          `,
            [fechaCompletado, pedidoId]
          );

          // Update stock for each item
          for (const item of orderItems) {
            // Get current stock
            const stockResult = await executeQuery(
              client,
              `
              SELECT stock_inicial, stock_vendido, stock_disponible FROM prendas WHERE id = $1
            `,
              [item.prenda_id]
            );

            const currentStock = stockResult.rows[0];
            const stockAnterior = currentStock.stock_disponible;
            const nuevoStockVendido =
              currentStock.stock_vendido + item.cantidad;

            // Update stock_vendido (stock_disponible will auto-calculate)
            await executeQuery(
              client,
              `
              UPDATE prendas 
              SET stock_vendido = stock_vendido + $1,
                  fecha_ultima_venta = $2
              WHERE id = $3
            `,
              [item.cantidad, fechaCompletado, item.prenda_id]
            );

            // Get new stock value
            const newStockResult = await executeQuery(
              client,
              `
              SELECT stock_disponible FROM prendas WHERE id = $1
            `,
              [item.prenda_id]
            );
            const stockNuevo = newStockResult.rows[0].stock_disponible;

            // Log movement
            await executeQuery(
              client,
              `
              INSERT INTO movimientos_inventario 
                (prenda_id, tipo, cantidad, stock_anterior, stock_nuevo, pedido_id, motivo, fecha)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
              [
                item.prenda_id,
                'venta',
                item.cantidad,
                stockAnterior,
                stockNuevo,
                pedidoId,
                `Venta en pedido #${pedidoId}`,
                fechaCompletado
              ]
            );
          }

          console.log(
            `   ✅ Pedido #${pedidoId} completado, stock actualizado`
          );
        } else if (spec.estado === 'cancelado') {
          await executeQuery(
            client,
            `
            UPDATE pedidos SET fecha_cancelado = $1 WHERE id = $2
          `,
            [fechaPedido, pedidoId]
          );
          console.log(
            `   🚫 Pedido #${pedidoId} cancelado (sin cambio de stock)`
          );
        } else {
          console.log(`   ⏳ Pedido #${pedidoId} pendiente`);
        }

        console.log(`   💰 Total: $${total.toFixed(0)}\n`);

        await client.query('COMMIT');
        successCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`   ❌ Pedido ${orderNum} falló: ${error.message}\n`);
        failCount++;
        // Continue with next order (micro-transaction pattern)
      } finally {
        client.release();
      }
    }

    logSuccess('06_generar_pedidos_prueba.js', 'Pedidos de prueba generados', {
      'Pedidos exitosos': successCount,
      'Pedidos fallidos': failCount,
      'Total intentos': orderSpecs.length
    });

    console.log('\n📋 Resumen de pedidos:');
    console.log(
      `   • Completados: ${
        orderSpecs.filter((s) => s.estado === 'completado').length
      } (stock actualizado)`
    );
    console.log(
      `   • Pendientes: ${
        orderSpecs.filter((s) => s.estado === 'pendiente').length
      } (sin cambio de stock)`
    );
    console.log(
      `   • Cancelados: ${
        orderSpecs.filter((s) => s.estado === 'cancelado').length
      } (sin cambio de stock)`
    );
    console.log(
      '   • Movimientos de inventario registrados para todos los completados\n'
    );
  } catch (error) {
    logError('06_generar_pedidos_prueba.js', 'Generación de Pedidos', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute script
generarPedidosPrueba()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
