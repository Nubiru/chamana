import { ProductCard } from '@/components/store/ProductCard';
import { coleccionBreadcrumbJsonLd, coleccionJsonLd } from '@/lib/structured-data';
import { formatTemporada } from '@/lib/utils';
import {
  getColeccionBySlug,
  getColecciones,
  getModelosByColeccion,
  isPublicColeccion,
} from '@/payload/queries';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// ISR self-heal net (F-storefront-freshness AC-1 / ADR-014). The Colecciones/Modelos
// afterChange hooks do the instant refresh; this hourly window is the fallback. NO force-dynamic.
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    // getColecciones is public-estado-filtered, so only public collections are pre-rendered.
    const colecciones = await getColecciones();
    return colecciones.map((coleccion) => ({ slug: coleccion.slug }));
  } catch {
    // Tables may not exist yet on first deploy before seeding
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coleccion = await getColeccionBySlug(slug);
  if (!coleccion || !isPublicColeccion(coleccion.estado)) return {};

  return {
    title: `${coleccion.nombreCompleto} | CHAMANA`,
    description: coleccion.descripcion,
    openGraph: {
      title: `${coleccion.nombreCompleto} | CHAMANA`,
      description: coleccion.descripcion,
      type: 'website',
    },
  };
}

export default async function ColeccionPage({ params }: Props) {
  const { slug } = await params;
  const coleccion = await getColeccionBySlug(slug);

  if (!coleccion || !isPublicColeccion(coleccion.estado)) {
    notFound();
  }

  const modelos = await getModelosByColeccion(slug);

  return (
    <div className="container py-8 px-4">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coleccionJsonLd(coleccion, modelos)) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coleccionBreadcrumbJsonLd(coleccion)) }}
      />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-titles text-foreground">{coleccion.nombreCompleto}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {`${formatTemporada(coleccion.temporada)} ${coleccion.anio}`}
        </p>
        <p className="text-muted-foreground mt-4">{coleccion.descripcion}</p>
        {coleccion.ejes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {coleccion.ejes.map((eje) => (
              <span
                key={eje}
                className="text-xs bg-secondary/15 text-foreground/70 px-3 py-1 rounded-full"
              >
                {eje}
              </span>
            ))}
          </div>
        )}
      </header>

      {modelos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg font-titles text-foreground/80">Próximamente</p>
          <p className="text-muted-foreground mt-2">Prendas en camino para esta colección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {modelos.map((modelo) => (
            <ProductCard key={modelo.slug} model={modelo} />
          ))}
        </div>
      )}
    </div>
  );
}
