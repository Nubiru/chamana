import { GetTopProducts } from '@/domains/analytics/use-cases/GetTopProducts';
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
    const getTopProducts = new GetTopProducts(analyticsRepo);

    const products = await getTopProducts.execute({
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    });

    interface TopProductResponse {
      productId: string;
      productName: string;
      categoryName: string;
      unitsSold: number;
      revenue: number;
      averagePrice: number;
    }

    const response: ApiResponse<TopProductResponse[]> = {
      success: true,
      data: products.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        categoryName: product.categoryName,
        unitsSold: product.unitsSold,
        revenue: product.revenue,
        averagePrice: product.averagePrice,
      })),
      message: 'Top productos obtenidos exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching top products:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
});
