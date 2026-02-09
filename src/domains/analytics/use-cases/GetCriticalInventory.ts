import type { CriticalInventory } from '../entities/CriticalInventory';
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface GetCriticalInventoryRequest {
  categoryId?: string;
  limit?: number;
}

export class GetCriticalInventory {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  async execute(request?: GetCriticalInventoryRequest): Promise<CriticalInventory[]> {
    return await this.analyticsRepo.getCriticalInventory({
      categoryId: request?.categoryId,
      limit: request?.limit,
    });
  }
}
