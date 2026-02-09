import { CriticalInventory } from '@/domains/analytics/entities/CriticalInventory';
import { CustomerAnalysis } from '@/domains/analytics/entities/CustomerAnalysis';
import { InventoryTurnover } from '@/domains/analytics/entities/InventoryTurnover';
import { MonthlySales } from '@/domains/analytics/entities/MonthlySales';
import { TopProduct } from '@/domains/analytics/entities/TopProduct';
import type {
  AnalyticsFilters,
  AnalyticsRepository,
} from '@/domains/analytics/repositories/AnalyticsRepository';
import type { Pool } from 'pg';

export class PostgresAnalyticsRepository implements AnalyticsRepository {
  constructor(private pool: Pool) {}

  async getMonthlySales(filters?: AnalyticsFilters): Promise<MonthlySales[]> {
    let query = 'SELECT * FROM vista_ventas_mensuales WHERE 1=1';
    const params: Array<string | number> = [];
    let paramCount = 1;

    if (filters?.startDate) {
      query += ` AND mes >= $${paramCount}`;
      params.push(filters.startDate.toISOString());
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND mes <= $${paramCount}`;
      params.push(filters.endDate.toISOString());
      paramCount++;
    }

    query += ' ORDER BY mes DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapToMonthlySales(row));
  }

  async getCriticalInventory(filters?: AnalyticsFilters): Promise<CriticalInventory[]> {
    let query = 'SELECT * FROM vista_inventario_critico WHERE 1=1';
    const params: Array<string | number> = [];
    let paramCount = 1;

    if (filters?.categoryId) {
      query += ` AND categoria_id = $${paramCount}`;
      params.push(filters.categoryId);
      paramCount++;
    }

    query += ' ORDER BY stock_disponible ASC';

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapToCriticalInventory(row));
  }

  async getTopProducts(limit = 10): Promise<TopProduct[]> {
    const result = await this.pool.query('SELECT * FROM vista_top_productos LIMIT $1', [limit]);
    return result.rows.map((row) => this.mapToTopProduct(row));
  }

  async getCustomerAnalysis(filters?: AnalyticsFilters): Promise<CustomerAnalysis[]> {
    let query = 'SELECT * FROM vista_analisis_clientes WHERE 1=1';
    const params: Array<string | number> = [];
    let paramCount = 1;

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    query += ' ORDER BY total_gastado DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapToCustomerAnalysis(row));
  }

  async getInventoryTurnover(filters?: AnalyticsFilters): Promise<InventoryTurnover[]> {
    let query = 'SELECT * FROM vista_rotacion_inventario WHERE 1=1';
    const params: Array<string | number> = [];
    let paramCount = 1;

    if (filters?.categoryId) {
      query += ` AND categoria_id = $${paramCount}`;
      params.push(filters.categoryId);
      paramCount++;
    }

    query += ' ORDER BY porcentaje_vendido DESC';

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapToInventoryTurnover(row));
  }

  private mapToMonthlySales(row: Record<string, unknown>): MonthlySales {
    return new MonthlySales(
      new Date(row.mes as string),
      Number(row.total_pedidos) || 0,
      Number(row.clientes_unicos) || 0,
      Number(row.prendas_vendidas) || 0,
      Number.parseFloat(String(row.subtotal_mes || 0)),
      Number.parseFloat(String(row.descuentos_mes || 0)),
      Number.parseFloat(String(row.total_mes || 0)),
      Number.parseFloat(String(row.ticket_promedio || 0)),
      Number.parseFloat(String(row.venta_promedio_pedido || 0))
    );
  }

  private mapToCriticalInventory(row: Record<string, unknown>): CriticalInventory {
    const stockPercentage = Number.parseFloat(String(row.porcentaje_stock || 0));
    let status: 'critical' | 'low' | 'normal' = 'normal';
    if (stockPercentage < 10) {
      status = 'critical';
    } else if (stockPercentage < 30) {
      status = 'low';
    }

    return new CriticalInventory(
      String(row.prenda_id),
      String(row.nombre_prenda),
      String(row.categoria || 'Sin categoría'),
      Number(row.stock_disponible) || 0,
      Number(row.stock_inicial) || 0,
      Number(row.stock_vendido) || 0,
      stockPercentage,
      status
    );
  }

  private mapToTopProduct(row: Record<string, unknown>): TopProduct {
    return new TopProduct(
      String(row.prenda_id),
      String(row.nombre_prenda),
      String(row.categoria || 'Sin categoría'),
      Number(row.unidades_vendidas) || 0,
      Number.parseFloat(String(row.total_vendido || 0)),
      Number.parseFloat(String(row.precio_promedio || 0))
    );
  }

  private mapToCustomerAnalysis(row: Record<string, unknown>): CustomerAnalysis {
    return new CustomerAnalysis(
      String(row.cliente_id),
      String(row.nombre_completo || 'Sin nombre'),
      String(row.email || ''),
      Number.parseFloat(String(row.total_gastado || 0)),
      Number(row.total_pedidos) || 0,
      Number.parseFloat(String(row.ticket_promedio || 0)),
      row.ultimo_pedido ? new Date(row.ultimo_pedido as string) : null,
      (row.segmento as 'VIP' | 'Active' | 'Inactive') || 'Inactive'
    );
  }

  private mapToInventoryTurnover(row: Record<string, unknown>): InventoryTurnover {
    return new InventoryTurnover(
      String(row.prenda_id),
      String(row.nombre_prenda),
      String(row.categoria || 'Sin categoría'),
      Number(row.stock_inicial) || 0,
      Number(row.stock_vendido) || 0,
      Number(row.stock_disponible) || 0,
      Number.parseFloat(String(row.porcentaje_vendido || 0)),
      Number.parseFloat(String(row.tasa_rotacion || 0))
    );
  }
}
