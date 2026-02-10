import { CategoryCircles } from '@/components/store/CategoryCircles';
import { HeroCarousel3D } from '@/components/store/HeroCarousel3D';
import { InfiniteCarousel } from '@/components/store/InfiniteCarousel';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      {/* ===== BG 1: SOMOS NATURALEZA (banner, width-fill only) ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10" style={fadeEdges}>
          <Image
            src="/images/brand/bg-somos-naturaleza.jpg"
            alt=""
            width={1920}
            height={640}
            className="w-full h-auto opacity-25"
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
                className="rounded-3xl overflow-hidden"
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

          {/* 3D Carousel */}
          <div className="mt-8 md:mt-10">
            <HeroCarousel3D />
          </div>
        </div>
      </section>

      {/* ===== BG 2: Fluye en tu interior ===== */}
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

        {/* Category Circles */}
        <div className="py-8 px-4">
          <CategoryCircles />
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

      {/* ===== BG 3: Sé tu misma ===== */}
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
            <h2 className="text-2xl md:text-3xl font-bold font-titles mb-8 text-center">
              Colección Completa
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {MODELOS.map((model) => (
                <ProductCard key={model.slug} model={model} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BG 4: Thread ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" style={fadeEdges}>
          <Image
            src="/images/brand/bg-thread.jpg"
            alt=""
            width={1920}
            height={1920}
            className="w-full h-auto opacity-15 absolute top-1/2 left-0 -translate-y-1/2"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        {/* Brand Story */}
        <div className="py-16 px-4">
          <Card className="max-w-3xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="space-y-3 text-center">
              <CardTitle className="text-2xl font-titles">Nuestra Esencia</CardTitle>
              <CardDescription className="text-base">
                Moda atemporal que celebra la naturaleza y el cuerpo femenino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="leading-relaxed text-center">
                CHAMANA nace de la conexión con los cinco elementos: Aire, Agua, Fuego, Tierra y
                Éter. Cada hilo, cada curva, cada movimiento está inspirado en la fluidez y
                sensibilidad de la naturaleza.
              </p>
              <p className="leading-relaxed text-center">
                Creemos en la libertad de movimiento, en la calma que viene de estar conectada con
                tu naturaleza interna, y en la fuerza que surge de la ternura y la templanza.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
