import * as viewQueries from '@/lib/db/views';
import type {
  AnalisisCliente,
  ApiResponse,
  InventarioCritico,
  RotacionInventario,
  TopProducto,
  VentaMensual,
} from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

type ViewData =
  | VentaMensual[]
  | InventarioCritico[]
  | TopProducto[]
  | AnalisisCliente[]
  | RotacionInventario[];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ view: string }> }
) {
  try {
    const { view } = await params;

    // Map view names to query functions
    const viewMap: Record<string, () => Promise<ViewData>> = {
      'ventas-mensuales': viewQueries.getVentasMensuales,
      'inventario-critico': viewQueries.getInventarioCritico,
      'top-productos': () => viewQueries.getTopProductos(10),
      'analisis-clientes': viewQueries.getAnalisisClientes,
      'rotacion-inventario': viewQueries.getRotacionInventario,
    };

    const queryFn = viewMap[view];

    if (!queryFn) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'View not found',
        message: `La vista '${view}' no existe`,
      };
      return NextResponse.json(response, { status: 404 });
    }

    const data = await queryFn();

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      message: 'Vista cargada exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching view:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
