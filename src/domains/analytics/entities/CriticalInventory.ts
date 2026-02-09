/**
 * Critical Inventory Entity
 *
 * Represents inventory items that are running low on stock.
 */
export class CriticalInventory {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly categoryName: string,
    public readonly availableStock: number,
    public readonly initialStock: number,
    public readonly soldStock: number,
    public readonly stockPercentage: number,
    public readonly status: 'critical' | 'low' | 'normal'
  ) {}

  get needsRestock(): boolean {
    return this.status === 'critical' || this.status === 'low';
  }

  get stockLevel(): string {
    if (this.status === 'critical') {
      return 'Crítico';
    }
    if (this.status === 'low') {
      return 'Bajo';
    }
    return 'Normal';
  }

  calculateRequiredStock(targetStock: number): number {
    return Math.max(0, targetStock - this.availableStock);
  }
}
