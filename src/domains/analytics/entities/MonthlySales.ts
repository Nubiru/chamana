/**
 * Monthly Sales Entity
 *
 * Represents monthly sales analytics data.
 */
export class MonthlySales {
  constructor(
    public readonly month: Date,
    public readonly totalOrders: number,
    public readonly uniqueCustomers: number,
    public readonly itemsSold: number,
    public readonly subtotal: number,
    public readonly discounts: number,
    public readonly total: number,
    public readonly averageTicket: number,
    public readonly averageOrderValue: number
  ) {}

  get monthName(): string {
    return this.month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  get formattedTotal(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(this.total);
  }

  /**
   * Calculate growth rate compared to previous month
   * @param previousMonth - The previous month's sales data, or null if not available
   * @returns Growth rate as a percentage
   */
  calculateGrowthRate(previousMonth: MonthlySales | null): number {
    if (!previousMonth) {
      return 0;
    }
    if (previousMonth.total === 0) {
      return this.total > 0 ? 100 : 0;
    }
    return ((this.total - previousMonth.total) / previousMonth.total) * 100;
  }
}
