import { Product } from '@/domains/product-catalog/entities/Product';
import type {
  ProductRepository,
  SearchFilters,
} from '@/domains/product-catalog/repositories/ProductRepository';
import type { Pool } from 'pg';

export class PostgresProductRepository implements ProductRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToProduct(result.rows[0]);
  }

  async findAll(): Promise<Product[]> {
    const result = await this.pool.query(
      'SELECT * FROM productos WHERE activo = true ORDER BY nombre'
    );

    return result.rows.map((row) => this.mapToProduct(row));
  }

  async search(filters: SearchFilters): Promise<Product[]> {
    let query = 'SELECT * FROM productos WHERE activo = true';
    const params: Array<string | number> = [];
    let paramCount = 1;

    if (filters.categoryId) {
      query += ` AND categoria_id = $${paramCount}`;
      params.push(filters.categoryId);
      paramCount++;
    }

    if (filters.minPrice !== undefined) {
      query += ` AND precio >= $${paramCount}`;
      params.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice !== undefined) {
      query += ` AND precio <= $${paramCount}`;
      params.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.query) {
      query += ` AND (nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`;
      params.push(`%${filters.query}%`);
      paramCount++;
    }

    query += ' ORDER BY nombre';

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapToProduct(row));
  }

  async create(product: Product): Promise<Product> {
    const result = await this.pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, sku, categoria_id, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        product.name,
        product.description,
        product.price,
        product.sku,
        product.categoryId,
        product.active,
      ]
    );

    return this.mapToProduct(result.rows[0]);
  }

  async update(product: Product): Promise<Product> {
    const result = await this.pool.query(
      `UPDATE productos
       SET nombre = $1, descripcion = $2, precio = $3, sku = $4, categoria_id = $5, activo = $6, fecha_actualizacion = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        product.name,
        product.description,
        product.price,
        product.sku,
        product.categoryId,
        product.active,
        product.id,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error(`Product with ID ${product.id} not found`);
    }

    return this.mapToProduct(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    // Soft delete (set activo = false)
    await this.pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
  }

  private mapToProduct(row: Record<string, unknown>): Product {
    return new Product(
      String(row.id),
      String(row.nombre),
      String(row.descripcion),
      Number.parseFloat(String(row.precio)),
      String(row.sku),
      String(row.categoria_id),
      Number(row.stock) || 0,
      Boolean(row.activo)
    );
  }
}
