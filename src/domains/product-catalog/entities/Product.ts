export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public sku: string,
    public categoryId: string,
    public stock: number,
    public active = true
  ) {}

  isAvailable(): boolean {
    return this.active && this.stock > 0;
  }

  reduceStock(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error(`Insufficient stock. Available: ${this.stock}, Requested: ${quantity}`);
    }
    this.stock -= quantity;
  }

  increaseStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity must be positive');
    }
    this.stock += quantity;
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price must be positive');
    }
    this.price = newPrice;
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }
}
