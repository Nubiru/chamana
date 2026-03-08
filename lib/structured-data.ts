import type { ChamanaModel } from '@/lib/data/products';
import { getModelMaxPrice, getModelMinPrice } from '@/lib/data/products';

const BASE_URL = 'https://chamana-ashy.vercel.app';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CHAMANA',
    url: BASE_URL,
    logo: `${BASE_URL}/images/brand/logo-dark.png`,
    description:
      'Ropa femenina artesanal inspirada en la naturaleza. Disenada para la libertad de movimiento y la conexion con tu esencia.',
    sameAs: ['https://www.instagram.com/chamanasomostodas'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: 'https://wa.me/542215475727',
      availableLanguage: 'Spanish',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CHAMANA',
    url: BASE_URL,
  };
}

export function productJsonLd(model: ChamanaModel) {
  const minPrice = getModelMinPrice(model);
  const maxPrice = getModelMaxPrice(model);
  const hasStock = model.variantes.some((v) => !v.sinStock);
  const image = model.imagenes?.[0]
    ? `${BASE_URL}${model.imagenes[0]}`
    : `${BASE_URL}/images/brand/logo-dark.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${model.nombre} - ${model.tipo}`,
    description: model.descripcion,
    image,
    brand: {
      '@type': 'Brand',
      name: 'CHAMANA',
    },
    ...(minPrice != null
      ? {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: minPrice.toString(),
            highPrice: (maxPrice ?? minPrice).toString(),
            priceCurrency: 'ARS',
            availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${BASE_URL}/producto/${model.slug}`,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(model: ChamanaModel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tienda',
        item: `${BASE_URL}/tienda`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: model.nombre,
        item: `${BASE_URL}/producto/${model.slug}`,
      },
    ],
  };
}
