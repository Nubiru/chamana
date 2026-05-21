'use client';

import type { ChamanaModel } from '@/lib/data/products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  models: ChamanaModel[];
}

export function ProductGrid({ models }: ProductGridProps) {
  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No se encontraron prendas con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {models.map((model) => (
        <ProductCard key={model.slug} model={model} />
      ))}
    </div>
  );
}
