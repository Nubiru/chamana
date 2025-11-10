import { GetCriticalInventory } from '@/domains/analytics/use-cases/GetCriticalInventory';
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
    const getCriticalInventory = new GetCriticalInventory(analyticsRepo);

    const inventory = await getCriticalInventory.execute({
      categoryId: categoryId || undefined,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    });

    interface CriticalInventoryResponse {
      productId: string;
      productName: string;
      categoryName: string;
      availableStock: number;
      initialStock: number;
      soldStock: number;
      stockPercentage: number;
      status: string;
      needsRestock: boolean;
    }

    const response: ApiResponse<CriticalInventoryResponse[]> = {
      success: true,
      data: inventory.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        categoryName: item.categoryName,
        availableStock: item.availableStock,
        initialStock: item.initialStock,
        soldStock: item.soldStock,
        stockPercentage: item.stockPercentage,
        status: item.status,
        needsRestock: item.needsRestock,
      })),
      message: 'Inventario crítico obtenido exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching critical inventory:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
});
