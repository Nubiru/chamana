import { Order, type OrderStatus } from '@/domains/order-management/entities/Order';
import type {
  OrderFilters,
  OrderRepository,
} from '@/domains/order-management/repositories/OrderRepository';
import { OrderItem } from '@/domains/order-management/value-objects/OrderItem';
import type { Pool } from 'pg';

export class PostgresOrderRepository implements OrderRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Order | null> {
    const result = await this.pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const orderRow = result.rows[0];
    const items = await this.findOrderItems(id);

    return this.mapToOrder(orderRow, items);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const result = await this.pool.query(
      'SELECT * FROM pedidos WHERE cliente_id = $1 ORDER BY fecha_pedido DESC',
      [customerId]
    );

    const orders: Order[] = [];

    for (const row of result.rows) {
      const items = await this.findOrderItems(String(row.id));
      orders.push(this.mapToOrder(row, items));
    }

    return orders;
  }

  async findAll(filters?: OrderFilters): Promise<Order[]> {
    let query = 'SELECT * FROM pedidos WHERE 1=1';
    const params: Array<string | number | Date> = [];
    let paramCount = 1;

    if (filters?.customerId) {
      query += ` AND cliente_id = $${paramCount}`;
      params.push(filters.customerId);
      paramCount++;
    }

    if (filters?.status) {
      query += ` AND estado = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.startDate) {
      query += ` AND fecha_pedido >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND fecha_pedido <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    query += ' ORDER BY fecha_pedido DESC';

    const result = await this.pool.query(query, params);
    const orders: Order[] = [];

    for (const row of result.rows) {
      const items = await this.findOrderItems(String(row.id));
      orders.push(this.mapToOrder(row, items));
    }

    return orders;
  }

  async create(order: Order): Promise<Order> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO pedidos (cliente_id, subtotal, descuento, total, estado, notas, fecha_pedido)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          order.customerId,
          order.subtotal,
          order.discount,
          order.total,
          order.status,
          order.notes || null,
          order.createdAt,
        ]
      );

      const orderId = String(orderResult.rows[0].id);

      // Insert order items
      for (const item of order.items) {
        await client.query(
          `INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.productId, item.quantity, item.unitPrice, item.subtotal]
        );
      }

      await client.query('COMMIT');

      // Return the created order with items
      const items = await this.findOrderItems(orderId);
      return this.mapToOrder(orderResult.rows[0], items);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(order: Order): Promise<Order> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Update order
      const updateFields: string[] = [];
      const updateValues: Array<string | number | Date | null> = [];
      let paramCount = 1;

      updateFields.push(`cliente_id = $${paramCount++}`);
      updateValues.push(order.customerId);

      updateFields.push(`subtotal = $${paramCount++}`);
      updateValues.push(order.subtotal);

      updateFields.push(`descuento = $${paramCount++}`);
      updateValues.push(order.discount);

      updateFields.push(`total = $${paramCount++}`);
      updateValues.push(order.total);

      updateFields.push(`estado = $${paramCount++}`);
      updateValues.push(order.status);

      if (order.notes !== undefined) {
        updateFields.push(`notas = $${paramCount++}`);
        updateValues.push(order.notes || null);
      }

      if (order.completedAt) {
        updateFields.push(`fecha_completado = $${paramCount++}`);
        updateValues.push(order.completedAt);
      }

      if (order.cancelledAt) {
        updateFields.push(`fecha_cancelado = $${paramCount++}`);
        updateValues.push(order.cancelledAt);
      }

      updateValues.push(order.id);

      await client.query(
        `UPDATE pedidos SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        updateValues
      );

      // Delete existing items and insert new ones
      await client.query('DELETE FROM pedidos_prendas WHERE pedido_id = $1', [order.id]);

      for (const item of order.items) {
        await client.query(
          `INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.productId, item.quantity, item.unitPrice, item.subtotal]
        );
      }

      await client.query('COMMIT');

      // Return updated order with items
      const items = await this.findOrderItems(order.id);
      const result = await client.query('SELECT * FROM pedidos WHERE id = $1', [order.id]);
      return this.mapToOrder(result.rows[0], items);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    // Note: In a real system, you might want to soft delete or check for dependencies
    // For now, we'll use CASCADE delete which is configured in the database
    await this.pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
  }

  async findOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.pool.query(
      'SELECT * FROM pedidos_prendas WHERE pedido_id = $1 ORDER BY id',
      [orderId]
    );

    return result.rows.map((row) =>
      OrderItem.create(
        String(row.prenda_id),
        Number(row.cantidad),
        Number.parseFloat(String(row.precio_unitario))
      )
    );
  }

  private mapToOrder(row: Record<string, unknown>, items: OrderItem[]): Order {
    return new Order(
      String(row.id),
      String(row.cliente_id),
      items,
      Number.parseFloat(String(row.subtotal)),
      Number.parseFloat(String(row.descuento || 0)),
      Number.parseFloat(String(row.total)),
      String(row.estado) as OrderStatus,
      row.notas ? String(row.notas) : undefined,
      row.fecha_pedido ? new Date(row.fecha_pedido as string) : new Date(),
      new Date(), // updatedAt - we'll use current time as fallback
      row.fecha_completado ? new Date(row.fecha_completado as string) : undefined,
      row.fecha_cancelado ? new Date(row.fecha_cancelado as string) : undefined
    );
  }
}
