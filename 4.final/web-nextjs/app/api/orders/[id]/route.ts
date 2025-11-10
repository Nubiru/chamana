import { CancelOrder } from '@/domains/order-management/use-cases/CancelOrder';
import { ProcessOrder } from '@/domains/order-management/use-cases/ProcessOrder';
import { authenticate } from '@/infrastructure/auth/middleware';
import { getPool } from '@/infrastructure/database/connection';
import { PostgresOrderRepository } from '@/infrastructure/database/repositories/PostgresOrderRepository';
import type { ApiResponse } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const pool = getPool();
    const orderRepo = new PostgresOrderRepository(pool);
    const order = await orderRepo.findById(id);

    if (!order) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Order not found',
        message: `Pedido con ID ${id} no encontrado`,
      };
      return NextResponse.json(response, { status: 404 });
    }

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

    const response: ApiResponse<OrderResponse> = {
      success: true,
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
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        completedAt: order.completedAt?.toISOString(),
        cancelledAt: order.cancelledAt?.toISOString(),
      },
      message: 'Pedido obtenido exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'action is required (process or cancel)',
        message: 'action es requerido (process o cancel)',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const pool = getPool();
    const orderRepo = new PostgresOrderRepository(pool);

    if (action === 'process') {
      const processOrder = new ProcessOrder(orderRepo);
      await processOrder.execute(id);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Pedido procesado exitosamente',
      };
      return NextResponse.json(response);
    }

    if (action === 'cancel') {
      const cancelOrder = new CancelOrder(orderRepo);
      await cancelOrder.execute(id, reason);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Pedido cancelado exitosamente',
      };
      return NextResponse.json(response);
    }

    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid action. Must be "process" or "cancel"',
      message: 'Acción inválida. Debe ser "process" o "cancel"',
    };
    return NextResponse.json(response, { status: 400 });
  } catch (error) {
    console.error('Error updating order:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
