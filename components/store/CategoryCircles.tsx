'use client';

import { CATEGORIAS, getCategoryColor } from '@/lib/data/categories';
import Link from 'next/link';

export function CategoryCircles() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide px-2">
      {CATEGORIAS.map((cat) => (
        <Link
          key={cat.slug}
          href={`/tienda?categoria=${cat.slug}`}
          className="flex flex-col items-center gap-2 min-w-[72px] snap-start group"
        >
          <div
            className="earth-circle w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/40 transition-all"
            style={{ '--cat-color': getCategoryColor(cat.slug) } as React.CSSProperties}
          >
            <span className="text-lg md:text-xl font-titles text-foreground/60">
              {cat.nombre.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
            {cat.nombre}
          </span>
        </Link>
      ))}
    </div>
  );
}
