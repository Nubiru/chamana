import type { Order } from '../entities/Order';
import type { OrderItem } from '../value-objects/OrderItem';

export interface OrderFilters {
  customerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findAll(filters?: OrderFilters): Promise<Order[]>;
  create(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
  findOrderItems(orderId: string): Promise<OrderItem[]>;
}
