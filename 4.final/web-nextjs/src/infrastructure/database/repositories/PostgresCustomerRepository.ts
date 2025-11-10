import { Customer } from '@/domains/customer/entities/Customer';
import type {
  CustomerFilters,
  CustomerRepository,
} from '@/domains/customer/repositories/CustomerRepository';
import type { Pool } from 'pg';

export class PostgresCustomerRepository implements CustomerRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Customer | null> {
    const result = await this.pool.query('SELECT * FROM clientes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToCustomer(result.rows[0]);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await this.pool.query('SELECT * FROM clientes WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToCustomer(result.rows[0]);
  }

  async findAll(filters?: CustomerFilters): Promise<Customer[]> {
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params: Array<string | boolean> = [];
    let paramCount = 1;

    if (filters?.active !== undefined) {
      query += ` AND activo = $${paramCount}`;
      params.push(filters.active);
      paramCount++;
    }

    if (filters?.search) {
      query += ` AND (nombre ILIKE $${paramCount} OR apellido ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm);
      paramCount++;
      params.push(searchTerm);
      paramCount++;
      params.push(searchTerm);
      paramCount++;
    }

    query += ' ORDER BY fecha_registro DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapToCustomer(row));
  }

  async create(customer: Customer): Promise<Customer> {
    const result = await this.pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, activo, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        customer.firstName,
        customer.lastName,
        customer.email.toLowerCase(),
        customer.phone || null,
        customer.active,
        customer.registeredAt,
      ]
    );

    return this.mapToCustomer(result.rows[0]);
  }

  async update(customer: Customer): Promise<Customer> {
    const result = await this.pool.query(
      `UPDATE clientes
       SET nombre = $1, apellido = $2, email = $3, telefono = $4, activo = $5
       WHERE id = $6
       RETURNING *`,
      [
        customer.firstName,
        customer.lastName,
        customer.email.toLowerCase(),
        customer.phone || null,
        customer.active,
        customer.id,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error(`Customer with ID ${customer.id} not found`);
    }

    return this.mapToCustomer(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    // Soft delete (set activo = false)
    await this.pool.query('UPDATE clientes SET activo = false WHERE id = $1', [id]);
  }

  private mapToCustomer(row: Record<string, unknown>): Customer {
    return new Customer(
      String(row.id),
      String(row.nombre),
      String(row.apellido),
      String(row.email),
      row.telefono ? String(row.telefono) : undefined,
      Boolean(row.activo),
      row.fecha_registro ? new Date(row.fecha_registro as string) : new Date()
    );
  }
}
