'use client';

import { ProductFilters } from '@/components/store/ProductFilters';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CATEGORIAS } from '@/lib/data/categories';
import { MODELOS } from '@/lib/data/products';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TiendaContent() {
  const searchParams = useSearchParams();
  const categoriaSlug = searchParams.get('categoria');

  const filteredModels = categoriaSlug
    ? MODELOS.filter((m) => {
        const cat = CATEGORIAS.find((c) => c.slug === categoriaSlug);
        return cat ? m.tipo === cat.nombre : true;
      })
    : MODELOS;

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

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-6 px-4">
          <div className="h-8 w-48 bg-muted/30 animate-pulse rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6', 'sk-7', 'sk-8'].map((id) => (
              <div key={id} className="bg-muted/30 animate-pulse rounded-lg aspect-[3/4]" />
            ))}
          </div>
        </div>
      }
    >
      <TiendaContent />
    </Suspense>
  );
}
