import type { InventoryTurnover } from '../entities/InventoryTurnover';
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface GetInventoryTurnoverRequest {
  categoryId?: string;
  limit?: number;
}

export class GetInventoryTurnover {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  async execute(request?: GetInventoryTurnoverRequest): Promise<InventoryTurnover[]> {
    return await this.analyticsRepo.getInventoryTurnover({
      categoryId: request?.categoryId,
      limit: request?.limit,
    });
  }
}
