import { OrganicShapeBackground } from '@/components/graphics/OrganicShape';
import { ThreadLineDecorative } from '@/components/graphics/ThreadLine';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative organic shapes in background */}
      <OrganicShapeBackground
        variant="subtle"
        className="absolute top-10 left-10 -z-10"
      />
      <OrganicShapeBackground
        variant="subtle"
        className="absolute bottom-20 right-20 -z-10"
      />

      <div className="max-w-4xl space-y-12 text-center relative z-10">
        <div className="space-y-6">
          <h1
            className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent font-titles"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--primary), var(--muted))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            CHAMANA
          </h1>
          <div className="space-y-3">
            <p className="text-xl md:text-2xl text-muted-foreground font-text">
              E-commerce de Ropa Femenina Artesanal
            </p>
            <p className="text-base text-muted-foreground/80 font-text max-w-2xl mx-auto">
              Ropa inspirada en la naturaleza, diseñada para la libertad de
              movimiento y la conexión con tu esencia interior. Cada prenda es
              una expresión de sensibilidad, fluidez y fuerza.
            </p>
          </div>

          {/* Decorative thread line */}
          <div className="flex justify-center py-4">
            <ThreadLineDecorative variant="accent" />
          </div>
        </div>

        {/* Brand Story Card */}
        <Card className="text-left max-w-2xl mx-auto">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Nuestra Esencia</CardTitle>
            <CardDescription className="text-base">
              Moda atemporal que celebra la naturaleza y el cuerpo femenino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-text">
            <p className="leading-relaxed">
              CHAMANA nace de la conexión con los elementos naturales: Aire,
              Agua, Fuego, Tierra y Éter. Cada hilo, cada curva, cada movimiento
              está inspirado en la fluidez y sensibilidad de la naturaleza.
            </p>
            <p className="leading-relaxed">
              Creemos en la libertad de movimiento, en la calma que viene de
              estar conectada con tu naturaleza interna, y en la fuerza que
              surge de la ternura y la templanza.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link href="/api/views/top-productos">Ver API</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60 font-text">
          Base de datos: chamana_db_fase3 (PostgreSQL 17) | Autor: Gabriel
          Osemberg | Noviembre 2025
        </p>
      </div>
    </div>
  );
}
