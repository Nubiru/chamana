/**
 * Top Product Entity
 *
 * Represents a top-selling product with sales metrics.
 */
export class TopProduct {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly categoryName: string,
    public readonly unitsSold: number,
    public readonly revenue: number,
    public readonly averagePrice: number
  ) {}

  get formattedRevenue(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(this.revenue);
  }

  get formattedAveragePrice(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(this.averagePrice);
  }

  /**
   * Calculate sales rank within a list of products
   * @param products - Array of products to rank against
   * @returns Rank position (1-based index)
   */
  calculateSalesRank(products: TopProduct[]): number {
    return products.findIndex((p) => p.productId === this.productId) + 1;
  }
}
