'use client';

import { ProductFilters } from '@/components/store/ProductFilters';
import { ProductGrid } from '@/components/store/ProductGrid';
import type { ChamanaModel } from '@/lib/data/products';
import { useSearchParams } from 'next/navigation';

interface Category {
  slug: string;
  nombre: string;
  count: number;
}

interface TiendaContentProps {
  modelos: ChamanaModel[];
  categorias: Category[];
}

export function TiendaContent({ modelos, categorias }: TiendaContentProps) {
  const searchParams = useSearchParams();
  const categoriaSlug = searchParams.get('categoria');

  const filteredModels = categoriaSlug
    ? modelos.filter((m) => {
        const cat = categorias.find((c) => c.slug === categoriaSlug);
        return cat ? m.tipo === cat.nombre : true;
      })
    : modelos;

  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-titles mb-2">Colección Magia</h1>
        <p className="text-sm text-muted-foreground">
          {filteredModels.length} modelo{filteredModels.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-6">
        <ProductFilters />
      </div>

      <ProductGrid models={filteredModels} />
    </div>
  );
}
