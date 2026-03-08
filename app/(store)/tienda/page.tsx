import { TiendaContent } from '@/components/store/TiendaContent';
import { getModelos, getCategorias } from '@/lib/payload/queries';
import { Suspense } from 'react';

export default async function TiendaPage() {
  const [modelos, categorias] = await Promise.all([getModelos(), getCategorias()]);

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
      <TiendaContent modelos={modelos} categorias={categorias} />
    </Suspense>
  );
}
