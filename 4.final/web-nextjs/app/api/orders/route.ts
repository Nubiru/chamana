import { CreateOrder } from '@/domains/order-management/use-cases/CreateOrder';
import { type AuthRequest, requireAuth } from '@/infrastructure/auth/middleware';
import { getPool } from '@/infrastructure/database/connection';
import { PostgresOrderRepository } from '@/infrastructure/database/repositories/PostgresOrderRepository';
import type { ApiResponse } from '@/types/database';
import { NextResponse } from 'next/server';

export const POST = requireAuth(async (request: AuthRequest) => {
  try {
    const body = await request.json();
    const { customerId, items, discount, notes } = body;

    // Validate required fields
    if (!customerId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'customerId is required',
        message: 'customerId es requerido',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'items array is required and must not be empty',
        message: 'items (array) es requerido y no puede estar vacío',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.quantity || item.unitPrice === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Each item must have productId, quantity, and unitPrice',
          message: 'Cada item debe tener productId, quantity y unitPrice',
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const pool = getPool();
    const orderRepo = new PostgresOrderRepository(pool);
    const createOrder = new CreateOrder(orderRepo);

    const order = await createOrder.execute({
      customerId,
      items,
      discount: discount || 0,
      notes,
    });

    interface CreateOrderResponse {
      id: string;
      customerId: string;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>;
      subtotal: number;
      discount: number;
      total: number;
      status: string;
      createdAt: string;
    }

    const response: ApiResponse<CreateOrderResponse> = {
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        id: order.id,
        customerId: order.customerId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
});

export const GET = requireAuth(async (request: AuthRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters = {
      customerId: customerId || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const pool = getPool();
    const orderRepo = new PostgresOrderRepository(pool);
    const orders = await orderRepo.findAll(filters);

    interface OrderResponse {
      id: string;
      customerId: string;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>;
      subtotal: number;
      discount: number;
      total: number;
      status: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
      cancelledAt?: string;
    }

    const response: ApiResponse<OrderResponse[]> = {
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        customerId: order.customerId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        completedAt: order.completedAt?.toISOString(),
        cancelledAt: order.cancelledAt?.toISOString(),
      })),
      message: 'Pedidos obtenidos exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
});
