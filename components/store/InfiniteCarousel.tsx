import type { ChamanaModel } from '@/lib/data/products';
import { MODELOS } from '@/lib/data/products';
import Image from 'next/image';
import Link from 'next/link';

const ITEM_WIDTH = 260;
const GAP = 16;

function MarqueeCard({ model }: { model: ChamanaModel }) {
  const firstImage = model.imagenes?.[0];

  return (
    <Link href={`/producto/${model.slug}`} className="block w-full h-full group">
      <div className="w-full h-full rounded-xl overflow-hidden border border-border/30 shadow-md bg-card">
        <div className="aspect-[3/4] relative bg-secondary/30">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={model.nombre}
              fill
              sizes="260px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/40 to-accent/30">
              <span className="text-5xl font-titles text-foreground/10">
                {model.nombre.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] bg-background/80 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full">
              {model.tipo}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm text-foreground line-clamp-1">{model.nombre}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {model.tipo}
            {model.detalle ? ` · ${model.detalle}` : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function InfiniteCarousel() {
  const items = MODELOS;
  const totalWidth = items.length * (ITEM_WIDTH + GAP);
  const duration = items.length * 3; // 3s per item

  return (
    <div
      className="carousel-marquee"
      style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      <div className="carousel-marquee-track flex gap-4" style={{ width: `${totalWidth * 2}px` }}>
        {/* Render items twice for seamless loop */}
        {[...items, ...items].map((model, i) => (
          <div
            key={`${model.slug}-${i}`}
            className="carousel-marquee-item flex-shrink-0"
            style={{ width: `${ITEM_WIDTH}px`, height: '380px' }}
          >
            <MarqueeCard model={model} />
          </div>
        ))}
      </div>
    </div>
  );
}
