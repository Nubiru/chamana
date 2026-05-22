import type { ChamanaModel, CollectionMeta } from '@/domain/catalog';
import { getModelMaxPrice, getModelMinPrice } from '@/domain/catalog';
import { BRAND_NAME, INSTAGRAM_URL, SITE_URL, WHATSAPP_NUMBER } from '@/lib/config';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-dark.png`,
    description:
      'Ropa femenina artesanal inspirada en la naturaleza. Disenada para la libertad de movimiento y la conexion con tu esencia.',
    sameAs: [INSTAGRAM_URL],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `https://wa.me/${WHATSAPP_NUMBER}`,
      availableLanguage: 'Spanish',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: SITE_URL,
  };
}

export function productJsonLd(model: ChamanaModel) {
  const minPrice = getModelMinPrice(model);
  const maxPrice = getModelMaxPrice(model);
  const hasStock = model.variantes.some((v) => !v.sinStock);
  const image = model.imagenes?.[0]
    ? `${SITE_URL}${model.imagenes[0]}`
    : `${SITE_URL}/images/brand/logo-dark.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${model.nombre} - ${model.tipo}`,
    description: model.descripcion,
    image,
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME,
    },
    ...(minPrice != null
      ? {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: minPrice.toString(),
            highPrice: (maxPrice ?? minPrice).toString(),
            priceCurrency: 'ARS',
            availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${SITE_URL}/producto/${model.slug}`,
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
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tienda',
        item: `${SITE_URL}/tienda`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: model.nombre,
        item: `${SITE_URL}/producto/${model.slug}`,
      },
    ],
  };
}

// ─── Collection structured data ───

export function coleccionesIndexJsonLd(colecciones: CollectionMeta[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Colecciones | CHAMANA',
    url: `${SITE_URL}/colecciones`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: colecciones.map((coleccion, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: coleccion.nombreCompleto,
        url: `${SITE_URL}/colecciones/${coleccion.slug}`,
      })),
    },
  };
}

export function coleccionJsonLd(coleccion: CollectionMeta, modelos: ChamanaModel[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: coleccion.nombreCompleto,
    description: coleccion.descripcion,
    url: `${SITE_URL}/colecciones/${coleccion.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: modelos.map((model, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: model.nombre,
        url: `${SITE_URL}/producto/${model.slug}`,
      })),
    },
  };
}

export function coleccionBreadcrumbJsonLd(coleccion: CollectionMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Colecciones',
        item: `${SITE_URL}/colecciones`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: coleccion.nombre,
        item: `${SITE_URL}/colecciones/${coleccion.slug}`,
      },
    ],
  };
}
