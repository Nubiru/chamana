/**
 * Inventory Turnover Entity
 *
 * Represents inventory turnover analysis data.
 */
export class InventoryTurnover {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly categoryName: string,
    public readonly initialStock: number,
    public readonly soldStock: number,
    public readonly availableStock: number,
    public readonly soldPercentage: number,
    public readonly turnoverRate: number
  ) {}

  get formattedTurnoverRate(): string {
    return `${this.turnoverRate.toFixed(2)}x`;
  }

  get formattedSoldPercentage(): string {
    return `${this.soldPercentage.toFixed(1)}%`;
  }

  get isHighTurnover(): boolean {
    return this.turnoverRate > 1.0;
  }

  get isLowTurnover(): boolean {
    return this.turnoverRate < 0.5;
  }
}
