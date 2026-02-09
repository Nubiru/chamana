import type { CriticalInventory } from '../entities/CriticalInventory';
import type { CustomerAnalysis } from '../entities/CustomerAnalysis';
import type { InventoryTurnover } from '../entities/InventoryTurnover';
import type { MonthlySales } from '../entities/MonthlySales';
import type { TopProduct } from '../entities/TopProduct';

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  limit?: number;
}

export interface AnalyticsRepository {
  getMonthlySales(filters?: AnalyticsFilters): Promise<MonthlySales[]>;
  getCriticalInventory(filters?: AnalyticsFilters): Promise<CriticalInventory[]>;
  getTopProducts(limit?: number): Promise<TopProduct[]>;
  getCustomerAnalysis(filters?: AnalyticsFilters): Promise<CustomerAnalysis[]>;
  getInventoryTurnover(filters?: AnalyticsFilters): Promise<InventoryTurnover[]>;
}
