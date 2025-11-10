import { GetInventoryTurnover } from '@/domains/analytics/use-cases/GetInventoryTurnover';
import { getPool } from '@/infrastructure/database/connection';
import { requireRole, type AuthRequest } from '@/infrastructure/auth/middleware';
import { PostgresAnalyticsRepository } from '@/infrastructure/database/repositories/PostgresAnalyticsRepository';
import type { ApiResponse } from '@/types/database';
import { NextResponse } from 'next/server';

// Analytics routes should be admin-only for security
export const GET = requireRole(['admin'])(async (request: AuthRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const limit = searchParams.get('limit');

    const pool = getPool();
    const analyticsRepo = new PostgresAnalyticsRepository(pool);
    const getInventoryTurnover = new GetInventoryTurnover(analyticsRepo);

    const turnover = await getInventoryTurnover.execute({
      categoryId: categoryId || undefined,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    });

    interface InventoryTurnoverResponse {
      productId: string;
      productName: string;
      categoryName: string;
      initialStock: number;
      soldStock: number;
      availableStock: number;
      soldPercentage: number;
      turnoverRate: number;
      isHighTurnover: boolean;
      isLowTurnover: boolean;
    }

    const response: ApiResponse<InventoryTurnoverResponse[]> = {
      success: true,
      data: turnover.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        categoryName: item.categoryName,
        initialStock: item.initialStock,
        soldStock: item.soldStock,
        availableStock: item.availableStock,
        soldPercentage: item.soldPercentage,
        turnoverRate: item.turnoverRate,
        isHighTurnover: item.isHighTurnover,
        isLowTurnover: item.isLowTurnover,
      })),
      message: 'Rotación de inventario obtenida exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching inventory turnover:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
});
