import { getPool } from '@/infrastructure/database/connection';
import type { ApiResponse } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prenda_id, cantidad, motivo = 'Reabastecimiento manual' } = body;

    // Validate required fields
    if (
      prenda_id === undefined ||
      prenda_id === null ||
      cantidad === undefined ||
      cantidad === null
    ) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'prenda_id and cantidad are required',
        message: 'prenda_id y cantidad son requeridos',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (cantidad <= 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'cantidad must be greater than 0',
        message: 'La cantidad debe ser mayor a 0',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query('SELECT reabastecer_inventario($1, $2, $3) as success', [
      prenda_id,
      cantidad,
      motivo,
    ]);

    interface ReabastecerResponse {
      success: boolean;
      prenda_id: number;
      cantidad: number;
    }

    const response: ApiResponse<ReabastecerResponse> = {
      success: true,
      message: 'Inventario reabastecido exitosamente',
      data: {
        success: result.rows[0].success as boolean,
        prenda_id,
        cantidad,
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
