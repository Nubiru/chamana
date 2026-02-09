import type { OrderRepository } from '../repositories/OrderRepository';

export class ProcessOrder {
  constructor(private orderRepo: OrderRepository) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (!order.canBeCompleted()) {
      throw new Error(`Order ${orderId} cannot be completed. Current status: ${order.status}`);
    }

    order.updateStatus('completado');
    await this.orderRepo.update(order);
  }
}
