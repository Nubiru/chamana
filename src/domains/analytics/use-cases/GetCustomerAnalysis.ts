import type { CustomerAnalysis } from '../entities/CustomerAnalysis';
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface GetCustomerAnalysisRequest {
  limit?: number;
}

export class GetCustomerAnalysis {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  async execute(request?: GetCustomerAnalysisRequest): Promise<CustomerAnalysis[]> {
    return await this.analyticsRepo.getCustomerAnalysis({
      limit: request?.limit,
    });
  }
}
