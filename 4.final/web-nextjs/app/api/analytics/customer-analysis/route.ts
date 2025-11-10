import { GetCustomerAnalysis } from '@/domains/analytics/use-cases/GetCustomerAnalysis';
import { getPool } from '@/infrastructure/database/connection';
import { requireRole, type AuthRequest } from '@/infrastructure/auth/middleware';
import { PostgresAnalyticsRepository } from '@/infrastructure/database/repositories/PostgresAnalyticsRepository';
import type { ApiResponse } from '@/types/database';
import { NextResponse } from 'next/server';

// Analytics routes should be admin-only for security
export const GET = requireRole(['admin'])(async (request: AuthRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');

    const pool = getPool();
    const analyticsRepo = new PostgresAnalyticsRepository(pool);
    const getCustomerAnalysis = new GetCustomerAnalysis(analyticsRepo);

    const customers = await getCustomerAnalysis.execute({
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    });

    interface CustomerAnalysisResponse {
      customerId: string;
      customerName: string;
      email: string;
      totalSpent: number;
      orderCount: number;
      averageOrderValue: number;
      lastOrderDate: string | null;
      segment: string;
      isActive: boolean;
      daysSinceLastOrder: number | null;
    }

    const response: ApiResponse<CustomerAnalysisResponse[]> = {
      success: true,
      data: customers.map((customer) => ({
        customerId: customer.customerId,
        customerName: customer.customerName,
        email: customer.email,
        totalSpent: customer.totalSpent,
        orderCount: customer.orderCount,
        averageOrderValue: customer.averageOrderValue,
        lastOrderDate: customer.lastOrderDate?.toISOString() || null,
        segment: customer.segment,
        isActive: customer.isActive,
        daysSinceLastOrder: customer.daysSinceLastOrder,
      })),
      message: 'Análisis de clientes obtenido exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching customer analysis:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
});
