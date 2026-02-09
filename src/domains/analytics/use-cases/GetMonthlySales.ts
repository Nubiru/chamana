import type { MonthlySales } from '../entities/MonthlySales';
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface GetMonthlySalesRequest {
  startDate?: Date;
  endDate?: Date;
}

export class GetMonthlySales {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  async execute(request?: GetMonthlySalesRequest): Promise<MonthlySales[]> {
    return await this.analyticsRepo.getMonthlySales({
      startDate: request?.startDate,
      endDate: request?.endDate,
    });
  }
}
