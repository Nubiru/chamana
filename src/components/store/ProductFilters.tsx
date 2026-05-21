'use client';

import { Button } from '@/components/ui/button';
import { CATEGORIAS } from '@/lib/data/categories';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('categoria');

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set('categoria', slug);
      } else {
        params.delete('categoria');
      }
      router.push(`/tienda?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
      <Button
        variant={!currentCategory ? 'default' : 'outline'}
        size="sm"
        className="rounded-full shrink-0 snap-start"
        onClick={() => handleCategoryChange(null)}
      >
        Todas
      </Button>
      {CATEGORIAS.map((cat) => (
        <Button
          key={cat.slug}
          variant={currentCategory === cat.slug ? 'default' : 'outline'}
          size="sm"
          className="rounded-full shrink-0 snap-start"
          onClick={() => handleCategoryChange(cat.slug)}
        >
          {cat.nombre}
        </Button>
      ))}
    </div>
  );
}
