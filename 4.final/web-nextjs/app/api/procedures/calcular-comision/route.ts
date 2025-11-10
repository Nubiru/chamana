import { getPool } from '@/infrastructure/database/connection';
import type { ApiResponse } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fecha_inicio, fecha_fin, mes, año, porcentaje = 5.0 } = body;

    // Convert mes/año to date range if provided
    let startDate = fecha_inicio;
    let endDate = fecha_fin;

    if (!startDate && mes && año) {
      // Convert mes/año to date range (first and last day of month)
      startDate = `${año}-${String(mes).padStart(2, '0')}-01`;
      const lastDay = new Date(Number.parseInt(año), Number.parseInt(mes), 0).getDate();
      endDate = `${año}-${String(mes).padStart(2, '0')}-${lastDay}`;
    }

    if (!startDate || !endDate) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'fecha_inicio/fecha_fin or mes/año are required',
        message: 'fecha_inicio/fecha_fin o mes/año son requeridos',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM calcular_comision_vendedor($1::DATE, $2::DATE, $3)',
      [startDate, endDate, porcentaje]
    );

    // Calculate totals
    const total_comision = result.rows.reduce(
      (sum, row) => sum + Number.parseFloat(row.comision || 0),
      0
    );
    const total_ventas = result.rows.reduce(
      (sum, row) => sum + Number.parseFloat(row.total_ventas || 0),
      0
    );
    const total_pedidos = result.rows.reduce(
      (sum, row) => sum + Number.parseInt(row.pedidos || 0),
      0
    );

    interface CalcularComisionResponse {
      comision: string;
      total_ventas: string;
      pedidos: number;
      detalle: Array<Record<string, unknown>>;
    }

    const response: ApiResponse<CalcularComisionResponse> = {
      success: true,
      message: 'Comisión calculada exitosamente',
      data: {
        comision: total_comision.toFixed(2),
        total_ventas: total_ventas.toFixed(2),
        pedidos: total_pedidos,
        detalle: result.rows as Array<Record<string, unknown>>,
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
