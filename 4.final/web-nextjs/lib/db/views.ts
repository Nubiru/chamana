import { query } from '@/infrastructure/database/connection';
import type {
  AnalisisCliente,
  InventarioCritico,
  RotacionInventario,
  TopProducto,
  VentaMensual,
} from '@/types/database';

export async function getVentasMensuales(): Promise<VentaMensual[]> {
  return query<VentaMensual>('SELECT * FROM vista_ventas_mensuales ORDER BY mes DESC');
}

export async function getInventarioCritico(): Promise<InventarioCritico[]> {
  return query<InventarioCritico>(
    'SELECT * FROM vista_inventario_critico ORDER BY stock_disponible ASC'
  );
}

export async function getTopProductos(limit = 10): Promise<TopProducto[]> {
  return query<TopProducto>('SELECT * FROM vista_top_productos LIMIT $1', [limit]);
}

export async function getAnalisisClientes(): Promise<AnalisisCliente[]> {
  return query<AnalisisCliente>(
    'SELECT * FROM vista_analisis_clientes ORDER BY total_gastado DESC'
  );
}

export async function getRotacionInventario(): Promise<RotacionInventario[]> {
  return query<RotacionInventario>(
    'SELECT * FROM vista_rotacion_inventario ORDER BY porcentaje_vendido DESC'
  );
}
