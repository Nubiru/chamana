import { GetMonthlySales } from '@/domains/analytics/use-cases/GetMonthlySales';
import { getPool } from '@/infrastructure/database/connection';
import {
  requireRole,
  type AuthRequest
} from '@/infrastructure/auth/middleware';
import { PostgresAnalyticsRepository } from '@/infrastructure/database/repositories/PostgresAnalyticsRepository';
import type { ApiResponse } from '@/types/database';
import { NextResponse } from 'next/server';

// Analytics routes should be admin-only for security
export const GET = requireRole(['admin'])(async (request: AuthRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const pool = getPool();
    const analyticsRepo = new PostgresAnalyticsRepository(pool);
    const getMonthlySales = new GetMonthlySales(analyticsRepo);

    const sales = await getMonthlySales.execute({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    interface MonthlySalesResponse {
      month: string;
      totalOrders: number;
      uniqueCustomers: number;
      itemsSold: number;
      subtotal: number;
      discounts: number;
      total: number;
      averageTicket: number;
      averageOrderValue: number;
    }

    const response: ApiResponse<MonthlySalesResponse[]> = {
      success: true,
      data: sales.map((sale) => ({
        month: sale.month.toISOString(),
        totalOrders: sale.totalOrders,
        uniqueCustomers: sale.uniqueCustomers,
        itemsSold: sale.itemsSold,
        subtotal: sale.subtotal,
        discounts: sale.discounts,
        total: sale.total,
        averageTicket: sale.averageTicket,
        averageOrderValue: sale.averageOrderValue
      })),
      message: 'Ventas mensuales obtenidas exitosamente'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
    return NextResponse.json(response, { status: 500 });
  }
});
