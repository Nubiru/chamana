import { MODELOS } from '@/lib/data/products';
import Image from 'next/image';
import Link from 'next/link';

const CARD_W = 120;
const CARD_H = 160;
const RADIUS = 440;

export function HeroCarousel3D() {
  const total = MODELOS.length;

  return (
    <div className="carousel-3d-scene mx-auto w-[300px] h-[220px] md:w-[460px] md:h-[260px]">
      <div className="carousel-3d relative w-full h-full">
        {MODELOS.map((model, i) => {
          const angle = (360 / total) * i;
          const firstImage = model.imagenes?.[0];

          return (
            <Link
              key={model.slug}
              href={`/producto/${model.slug}`}
              className="carousel-3d-item absolute top-1/2 left-1/2 block"
              style={{
                width: `${CARD_W}px`,
                height: `${CARD_H}px`,
                marginLeft: `${-CARD_W / 2}px`,
                marginTop: `${-CARD_H / 2}px`,
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
              }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden border border-border/30 shadow-lg bg-card/30">
                {firstImage ? (
                  <Image
                    src={firstImage}
                    alt={model.nombre}
                    width={CARD_W}
                    height={CARD_H}
                    className="w-full h-full object-cover"
                    sizes={`${CARD_W}px`}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/40 to-accent/30">
                    <span className="text-3xl font-titles text-foreground/15">
                      {model.nombre.charAt(0)}
                    </span>
                    <span className="text-[9px] text-foreground/30 mt-1">{model.nombre}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
