import { getPool } from '@/infrastructure/database/connection';
import type { ApiResponse } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cliente_id, items, descuento = 0 } = body;

    // Validate required fields
    if (!cliente_id || !items || !Array.isArray(items) || items.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'cliente_id and items (array) are required',
        message: 'cliente_id e items (array) son requeridos',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Convert items array to JSONB format
    const itemsJsonb = JSON.stringify(items);

    const pool = getPool();
    const result = await pool.query('SELECT procesar_pedido($1, $2::JSONB, $3) as pedido_id', [
      cliente_id,
      itemsJsonb,
      descuento,
    ]);

    interface ProcesarPedidoResponse {
      pedido_id: number;
    }

    const response: ApiResponse<ProcesarPedidoResponse> = {
      success: true,
      message: 'Pedido procesado exitosamente',
      data: {
        pedido_id: result.rows[0].pedido_id as number,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
