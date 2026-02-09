/**
 * OrderItem Value Object
 *
 * Represents a single item in an order with quantity and pricing information.
 * Immutable value object following DDD principles.
 */
export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly subtotal: number
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (unitPrice < 0) {
      throw new Error('Unit price must be non-negative');
    }
    if (subtotal < 0) {
      throw new Error('Subtotal must be non-negative');
    }
    // Validate that subtotal matches quantity * unitPrice (with small tolerance for rounding)
    const expectedSubtotal = quantity * unitPrice;
    if (Math.abs(subtotal - expectedSubtotal) > 0.01) {
      throw new Error(
        `Subtotal ${subtotal} does not match quantity ${quantity} × unitPrice ${unitPrice} = ${expectedSubtotal}`
      );
    }
  }

  static create(productId: string, quantity: number, unitPrice: number): OrderItem {
    const subtotal = quantity * unitPrice;
    return new OrderItem(productId, quantity, unitPrice, subtotal);
  }
}
