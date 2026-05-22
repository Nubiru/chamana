import { ColeccionCard } from '@/components/store/ColeccionCard';
import { coleccionesIndexJsonLd } from '@/lib/structured-data';
import { getColecciones } from '@/payload/queries';
import type { Metadata } from 'next';

// ISR self-heal net (F-storefront-freshness AC-1 / ADR-014). On-mutation Payload
// hooks do the instant refresh; this hourly window is the fallback. NO force-dynamic.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Colecciones | CHAMANA',
  description:
    'Explorá las colecciones de CHAMANA. Cada colección es un universo de prendas artesanales inspiradas en la naturaleza y lo sagrado femenino.',
};

export default async function ColeccionesPage() {
  const colecciones = await getColecciones();

  return (
    <div className="container py-8 px-4">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coleccionesIndexJsonLd(colecciones)) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-titles text-foreground">Colecciones</h1>
        <p className="text-muted-foreground mt-2">
          Cada colección es un ritual. Descubrí el universo detrás de cada prenda.
        </p>
      </header>

      {colecciones.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          Pronto vas a poder explorar nuestras colecciones acá.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {colecciones.map((coleccion) => (
            <ColeccionCard key={coleccion.slug} coleccion={coleccion} />
          ))}
        </div>
      )}
    </div>
  );
}
