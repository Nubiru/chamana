import type { OrderRepository } from '../repositories/OrderRepository';

export class CancelOrder {
  constructor(private orderRepo: OrderRepository) {}

  async execute(orderId: string, reason?: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (!order.canBeCancelled()) {
      throw new Error(`Order ${orderId} cannot be cancelled. Current status: ${order.status}`);
    }

    order.updateStatus('cancelado');
    if (reason) {
      order.notes = order.notes
        ? `${order.notes}\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }
    await this.orderRepo.update(order);
  }
}
