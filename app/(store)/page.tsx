import { OrganicShapeBackground } from '@/components/graphics/OrganicShape';
import { ThreadLineDecorative } from '@/components/graphics/ThreadLine';
import { CategoryCircles } from '@/components/store/CategoryCircles';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MODELOS } from '@/lib/data/products';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const featured = MODELOS.slice(0, 6);

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32 overflow-hidden">
        <OrganicShapeBackground variant="subtle" className="absolute top-10 left-10 -z-10" />
        <OrganicShapeBackground variant="subtle" className="absolute bottom-20 right-20 -z-10" />

        <div className="max-w-4xl space-y-8 text-center relative z-10">
          <div className="space-y-4">
            <h1
              className="text-6xl md:text-8xl font-bold tracking-tight font-titles"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--primary), var(--muted))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CHAMANA
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-text tracking-widest uppercase">
              Colección Magia
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 font-text max-w-xl mx-auto leading-relaxed">
              Ropa femenina artesanal inspirada en la naturaleza. Cada prenda es una expresión de
              sensibilidad, fluidez y fuerza.
            </p>
          </div>

          <div className="flex justify-center py-2">
            <ThreadLineDecorative variant="accent" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild size="lg" className="min-w-[200px] gap-2">
              <Link href="/tienda">
                <Sparkles className="h-5 w-5" />
                Ver Colección
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Circles */}
      <section className="py-8 px-4">
        <CategoryCircles />
      </section>

      {/* Featured Products Carousel */}
      <section className="py-12 px-4">
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

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {featured.map((model) => (
              <div key={model.slug} className="min-w-[260px] sm:min-w-[280px] snap-start">
                <ProductCard model={model} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Collection Grid */}
      <section className="py-12 px-4">
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
      </section>

      {/* Brand Story */}
      <section className="py-16 px-4">
        <Card className="max-w-3xl mx-auto border-none shadow-none bg-transparent">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-titles">Nuestra Esencia</CardTitle>
            <CardDescription className="text-base">
              Moda atemporal que celebra la naturaleza y el cuerpo femenino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-text">
            <p className="leading-relaxed text-center">
              CHAMANA nace de la conexión con los cinco elementos: Aire, Agua, Fuego, Tierra y Éter.
              Cada hilo, cada curva, cada movimiento está inspirado en la fluidez y sensibilidad de
              la naturaleza.
            </p>
            <p className="leading-relaxed text-center">
              Creemos en la libertad de movimiento, en la calma que viene de estar conectada con tu
              naturaleza interna, y en la fuerza que surge de la ternura y la templanza.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
