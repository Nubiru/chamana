'use client';

import { Card, CardContent } from '@/components/ui/card';
import { getCategoryColor } from '@/lib/data/categories';
import type { ChamanaModel } from '@/lib/data/products';
import { getModelPriceDisplay } from '@/lib/data/products';
import Image from 'next/image';
import Link from 'next/link';

export function ProductCard({ model }: { model: ChamanaModel }) {
  const firstImage = model.imagenes?.[0];

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border-border/30 p-0">
      <Link href={`/producto/${model.slug}`}>
        {/* Image / Placeholder */}
        <div
          className="aspect-[3/4] earth-gradient relative overflow-hidden"
          style={{ '--cat-color': getCategoryColor(model.tipo) } as React.CSSProperties}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={model.nombre}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl md:text-6xl font-titles text-foreground/10 group-hover:text-foreground/15 transition-colors">
                {model.nombre.charAt(0)}
              </span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] bg-background/80 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full">
              {model.tipo}
            </span>
          </div>

          {/* Color swatches or Proximamente badge */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {model.variantes.length === 0 ? (
              <span className="text-[10px] bg-background/80 backdrop-blur-sm text-muted-foreground px-2 py-0.5 rounded-full">
                Proximamente
              </span>
            ) : (
              <>
                {model.variantes.slice(0, 4).map((v) => (
                  <span
                    key={v.id}
                    className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm"
                    style={{ backgroundColor: v.tela1.colorHex }}
                    title={v.tela1.color}
                  />
                ))}
                {model.variantes.length > 4 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-background/80 border border-white/60 shadow-sm flex items-center justify-center text-[8px] text-muted-foreground">
                    +{model.variantes.length - 4}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {model.nombre}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {model.tipo}
            {model.detalle ? ` · ${model.detalle}` : ''}
          </p>
          {model.variantes.length > 0 && (
            <p className="text-sm font-semibold text-foreground mt-1">
              {getModelPriceDisplay(model)}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
