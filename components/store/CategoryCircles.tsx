'use client';

import { CATEGORIAS } from '@/lib/data/categories';
import Link from 'next/link';

const CATEGORY_GRADIENTS: Record<string, string> = {
  falda: 'from-amber-100 to-orange-200',
  vestido: 'from-rose-100 to-pink-200',
  kimono: 'from-emerald-100 to-teal-200',
  remeron: 'from-sky-100 to-blue-200',
  musculosa: 'from-violet-100 to-purple-200',
  top: 'from-fuchsia-100 to-pink-200',
  camisa: 'from-lime-100 to-green-200',
  bermuda: 'from-yellow-100 to-amber-200',
  short: 'from-cyan-100 to-sky-200',
  palazzo: 'from-indigo-100 to-violet-200',
};

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
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${
              CATEGORY_GRADIENTS[cat.slug] || 'from-gray-100 to-gray-200'
            } flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/40 transition-all`}
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
