import { FAQAccordion } from '@/components/store/FAQAccordion';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductoPageClient } from '@/components/store/ProductoPageClient';
import {
  getModelMaxPrice,
  getModelMinPrice,
  getModeloBySlug,
  getModelos,
  getModelosByTipo,
} from '@/lib/payload/queries';
import { getFAQsForProduct } from '@/lib/payload/queries';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModeloBySlug(slug);
  if (!model) return {};

  const minPrice = getModelMinPrice(model);
  const maxPrice = getModelMaxPrice(model);
  const priceText =
    minPrice != null
      ? minPrice === maxPrice
        ? `$${minPrice.toLocaleString('es-AR')}`
        : `Desde $${minPrice.toLocaleString('es-AR')}`
      : 'Consultar precio';

  const title = `${model.nombre} - ${model.tipo}${model.detalle ? ` ${model.detalle}` : ''} | CHAMANA`;
  const description = `${model.descripcion} ${priceText}. Ropa femenina artesanal.`;

  return {
    title,
    description,
    openGraph: {
      title: `${model.nombre} - ${model.tipo} Artesanal | CHAMANA`,
      description: model.descripcion,
      type: 'website',
      images: model.imagenes?.[0]
        ? [
            {
              url: model.imagenes[0],
              width: 800,
              height: 800,
              alt: `${model.nombre} - ${model.tipo}`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${model.nombre} - ${model.tipo} | CHAMANA`,
      description: model.descripcion,
    },
  };
}

export async function generateStaticParams() {
  try {
    const modelos = await getModelos();
    return modelos.map((model) => ({ slug: model.slug }));
  } catch {
    // Tables may not exist yet on first deploy before seeding
    return [];
  }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const model = await getModeloBySlug(slug);

  if (!model) {
    notFound();
  }

  const [faqs, relatedModels] = await Promise.all([
    getFAQsForProduct(model.tipo),
    getModelosByTipo(model.tipo),
  ]);

  const related = relatedModels.filter((m) => m.slug !== model.slug).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(model)) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(model)) }}
      />
      <ProductoPageClient model={model} />

      {/* FAQ — rendered at server level */}
      {faqs.length > 0 && (
        <div className="container px-4 mt-12">
          <h2 className="text-xl font-bold font-titles mb-4">Preguntas Frecuentes</h2>
          <FAQAccordion faqs={faqs} />
        </div>
      )}

      {/* Related — rendered at server level */}
      {related.length > 0 && (
        <div className="container px-4 mt-16 pb-6">
          <h2 className="text-xl font-bold font-titles mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {related.map((m) => (
              <ProductCard key={m.slug} model={m} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
