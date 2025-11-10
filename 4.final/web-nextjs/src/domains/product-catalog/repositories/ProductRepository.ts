import type { Product } from '../entities/Product';

export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  query?: string;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  search(filters: SearchFilters): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
