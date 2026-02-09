import { OrderItem } from '../value-objects/OrderItem';

export type OrderStatus = 'pendiente' | 'completado' | 'cancelado';

/**
 * Order Entity
 *
 * Represents a customer order with items, pricing, and status.
 * Contains business logic for order management.
 */
export class Order {
  constructor(
    public readonly id: string,
    public customerId: string,
    public items: OrderItem[],
    public subtotal: number,
    public discount: number,
    public total: number,
    public status: OrderStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public notes?: string,
    public completedAt?: Date,
    public cancelledAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.subtotal < 0) {
      throw new Error('Subtotal must be non-negative');
    }
    if (this.discount < 0) {
      throw new Error('Discount must be non-negative');
    }
    if (this.discount > this.subtotal) {
      throw new Error('Discount cannot exceed subtotal');
    }
    if (this.total < 0) {
      throw new Error('Total must be non-negative');
    }
    // Validate total matches subtotal - discount (with small tolerance for rounding)
    const expectedTotal = this.subtotal - this.discount;
    if (Math.abs(this.total - expectedTotal) > 0.01) {
      throw new Error(
        `Total ${this.total} does not match subtotal ${this.subtotal} - discount ${this.discount} = ${expectedTotal}`
      );
    }
  }

  addItem(item: OrderItem): void {
    if (this.status !== 'pendiente') {
      throw new Error('Cannot add items to a non-pending order');
    }
    this.items.push(item);
    this.recalculateTotals();
    this.updatedAt = new Date();
  }

  removeItem(productId: string): void {
    if (this.status !== 'pendiente') {
      throw new Error('Cannot remove items from a non-pending order');
    }
    const index = this.items.findIndex((item) => item.productId === productId);
    if (index === -1) {
      throw new Error(`Item with productId ${productId} not found in order`);
    }
    this.items.splice(index, 1);
    this.recalculateTotals();
    this.updatedAt = new Date();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    if (this.status !== 'pendiente') {
      throw new Error('Cannot update items in a non-pending order');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    const item = this.items.find((i) => i.productId === productId);
    if (!item) {
      throw new Error(`Item with productId ${productId} not found in order`);
    }
    const index = this.items.indexOf(item);
    this.items[index] = OrderItem.create(productId, quantity, item.unitPrice);
    this.recalculateTotals();
    this.updatedAt = new Date();
  }

  private recalculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    // Ensure discount doesn't exceed subtotal
    if (this.discount > this.subtotal) {
      this.discount = this.subtotal;
    }
    this.total = this.subtotal - this.discount;
  }

  applyDiscount(amount: number): void {
    if (this.status !== 'pendiente') {
      throw new Error('Cannot apply discount to a non-pending order');
    }
    if (amount < 0) {
      throw new Error('Discount amount must be non-negative');
    }
    this.discount = Math.min(amount, this.subtotal);
    this.total = this.subtotal - this.discount;
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: OrderStatus): void {
    if (this.status === newStatus) {
      return; // No change needed
    }

    // Validate status transitions
    if (this.status === 'completado' && newStatus !== 'cancelado') {
      throw new Error('Cannot change status from completado to anything other than cancelado');
    }
    if (this.status === 'cancelado') {
      throw new Error('Cannot change status of a cancelled order');
    }

    this.status = newStatus;
    this.updatedAt = new Date();

    if (newStatus === 'completado') {
      this.completedAt = new Date();
    } else if (newStatus === 'cancelado') {
      this.cancelledAt = new Date();
    }
  }

  canBeCancelled(): boolean {
    return this.status === 'pendiente';
  }

  canBeCompleted(): boolean {
    return this.status === 'pendiente' && this.items.length > 0;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
