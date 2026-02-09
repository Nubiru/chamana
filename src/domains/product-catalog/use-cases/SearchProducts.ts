import type { Product } from '../entities/Product';
import type { ProductRepository, SearchFilters } from '../repositories/ProductRepository';

export class SearchProducts {
  constructor(private productRepo: ProductRepository) {}

  async execute(filters: SearchFilters): Promise<Product[]> {
    const products = await this.productRepo.search(filters);

    // Additional business logic: only return available products
    return products.filter((p) => p.isAvailable());
  }
}
