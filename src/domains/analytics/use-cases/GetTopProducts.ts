import type { TopProduct } from '../entities/TopProduct';
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface GetTopProductsRequest {
  limit?: number;
}

export class GetTopProducts {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  async execute(request?: GetTopProductsRequest): Promise<TopProduct[]> {
    return await this.analyticsRepo.getTopProducts(request?.limit || 10);
  }
}
