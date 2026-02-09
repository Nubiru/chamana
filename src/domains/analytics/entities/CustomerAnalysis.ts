/**
 * Customer Analysis Entity
 *
 * Represents customer segmentation and analysis data.
 */
export class CustomerAnalysis {
  constructor(
    public readonly customerId: string,
    public readonly customerName: string,
    public readonly email: string,
    public readonly totalSpent: number,
    public readonly orderCount: number,
    public readonly averageOrderValue: number,
    public readonly lastOrderDate: Date | null,
    public readonly segment: 'VIP' | 'Active' | 'Inactive'
  ) {}

  get formattedTotalSpent(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(this.totalSpent);
  }

  get formattedAverageOrderValue(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(this.averageOrderValue);
  }

  get isActive(): boolean {
    return this.segment !== 'Inactive';
  }

  get daysSinceLastOrder(): number | null {
    if (!this.lastOrderDate) {
      return null;
    }
    const diff = Date.now() - this.lastOrderDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
