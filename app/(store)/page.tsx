import { CategoryCircles } from '@/components/store/CategoryCircles';
import { HeroCarousel3D } from '@/components/store/HeroCarousel3D';
import { InfiniteCarousel } from '@/components/store/InfiniteCarousel';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { MODELOS } from '@/lib/data/products';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const fadeEdges = {
  maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
} as React.CSSProperties;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ===== BG 1: Woman's back (thread) ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" style={fadeEdges}>
          <Image
            src="/images/brand/bg-thread.jpg"
            alt=""
            width={1920}
            height={1920}
            className="w-full h-auto opacity-20 absolute top-0 left-0"
            priority
            aria-hidden="true"
          />
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-4 pt-16 pb-4 md:pt-24 md:pb-6">
          {/* Background: Large Isologo watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-[5]">
            <Image
              src="/images/brand/isologo-outline.png"
              alt=""
              width={800}
              height={800}
              className="w-[80vw] max-w-[650px] md:max-w-[750px] h-auto opacity-[0.08]"
              priority
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="max-w-4xl space-y-6 text-center relative z-10">
            {/* Full brand logo with faded edges */}
            <div className="flex justify-center">
              <div
                className="rounded-full overflow-hidden"
                style={{
                  maskImage:
                    'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)',
                }}
              >
                <Image
                  src="/images/brand/logo-tan.png"
                  alt="CHAMANA"
                  width={800}
                  height={800}
                  className="w-[280px] md:w-[360px] lg:w-[420px] h-auto"
                  priority
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-foreground/70 max-w-xl mx-auto leading-relaxed">
              Ropa femenina artesanal inspirada en la naturaleza. Cada prenda es una expresión de
              sensibilidad, fluidez y fuerza.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button asChild size="lg" className="min-w-[200px] gap-2">
                <Link href="/tienda">
                  <Sparkles className="h-5 w-5" />
                  Ver Colección
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Nuestra Esencia */}
        <div className="py-12 px-6 md:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-titles">Nuestra Esencia</h2>
            <p className="text-sm md:text-base leading-relaxed text-foreground/80">
              Mi nombre es Cintia, diseñadora y creadora de Chamana, un proyecto nacido en las
              sierras de Córdoba, Capilla del Monte, donde la naturaleza y la paz invitan a la
              creatividad.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-foreground/80">
              Nuestras prendas se inspiran en la belleza de la mujer en movimiento, libre y
              auténtica, para que se sienta cómoda, en armonía con su cuerpo y radiante en su
              feminidad.
            </p>
          </div>
        </div>

        {/* 3D Carousel */}
        <div className="mt-2 md:mt-4 mb-8">
          <HeroCarousel3D />
        </div>
      </section>

      {/* ===== BG 2: Somos Naturaleza ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" style={fadeEdges}>
          <Image
            src="/images/brand/bg-somos-naturaleza.jpg"
            alt=""
            width={1920}
            height={640}
            className="w-full h-auto opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        {/* Category Circles */}
        <div className="py-8 px-4">
          <CategoryCircles />
        </div>
      </section>

      {/* ===== BG 3: Fluye en tu interior ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" style={fadeEdges}>
          <Image
            src="/images/brand/bg-fluye.jpg"
            alt=""
            width={1920}
            height={1920}
            className="w-full h-auto opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        {/* Featured Products — Infinite Marquee */}
        <div className="py-12 px-4">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-titles">Destacados</h2>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href="/tienda">
                  Ver todo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <InfiniteCarousel />
          </div>
        </div>
      </section>

      {/* ===== BG 4: Sé tu misma ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" style={fadeEdges}>
          <Image
            src="/images/brand/bg-se-tu-misma.jpg"
            alt=""
            width={1080}
            height={1080}
            className="w-full h-auto opacity-15 absolute top-1/2 left-0 -translate-y-1/2"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        {/* Full Collection Grid */}
        <div className="py-12 px-4">
          <div className="container">
            <div className="text-center mb-10 space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold font-titles">Colección Completa</h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Colección &ldquo;Magia&rdquo; &middot; 2026
              </p>
              <p className="text-sm md:text-base leading-relaxed text-foreground/70 max-w-2xl mx-auto">
                Inspirada en los poderes y habilidades de la energía femenina, donde la belleza se
                encuentra en la autenticidad, la comodidad y la libertad de ser. Prendas
                confeccionadas con telas livianas, frescas y texturas suaves, en una paleta de
                colores que nos conecta con la naturaleza.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {MODELOS.map((model) => (
                <ProductCard key={model.slug} model={model} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
