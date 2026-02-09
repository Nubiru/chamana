import type { Customer } from '../entities/Customer';

export interface CustomerFilters {
  active?: boolean;
  search?: string; // Search in name or email
}

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(filters?: CustomerFilters): Promise<Customer[]>;
  create(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}
