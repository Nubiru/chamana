import type { ChamanaModel, Tela, Variante } from '@/lib/domain/catalog';
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  productJsonLd,
  websiteJsonLd,
} from '@/lib/structured-data';

// ---------------------------------------------------------------------------
// Inline test-data builders (no external dependency)
// ---------------------------------------------------------------------------
const makeTela = (overrides: Partial<Tela> = {}): Tela => ({
  codigo: 'X',
  tipo: 'Lino',
  color: 'Negro',
  colorHex: '#000',
  ...overrides,
});

const makeVariante = (overrides: Partial<Variante> = {}): Variante => ({
  id: 'v1',
  tela1: makeTela(),
  ...overrides,
});

const makeModel = (overrides: Partial<ChamanaModel> = {}): ChamanaModel => ({
  slug: 'hechizo',
  nombre: 'Hechizo',
  tipo: 'Falda',
  descripcion: 'A skirt',
  variantes: [makeVariante()],
  ...overrides,
});

const BASE_URL = 'https://chamana.app';

// ---------------------------------------------------------------------------
// organizationJsonLd
// ---------------------------------------------------------------------------
describe('organizationJsonLd', () => {
  const result = organizationJsonLd();

  it('has @context "https://schema.org" and @type "Organization"', () => {
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Organization');
  });

  it('name is "CHAMANA"', () => {
    expect(result.name).toBe('CHAMANA');
  });

  it('url is "https://chamana.app"', () => {
    expect(result.url).toBe(BASE_URL);
  });

  it('logo URL starts with base URL', () => {
    expect(result.logo).toMatch(new RegExp(`^${BASE_URL}`));
  });

  it('sameAs includes Instagram URL', () => {
    expect(result.sameAs).toContain('https://www.instagram.com/chamanasomostodas');
  });

  it('contactPoint has correct WhatsApp URL', () => {
    expect(result.contactPoint.url).toBe('https://wa.me/542215475727');
  });

  it('contactPoint availableLanguage is "Spanish"', () => {
    expect(result.contactPoint.availableLanguage).toBe('Spanish');
  });
});

// ---------------------------------------------------------------------------
// websiteJsonLd
// ---------------------------------------------------------------------------
describe('websiteJsonLd', () => {
  const result = websiteJsonLd();

  it('has @context and @type "WebSite"', () => {
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('WebSite');
  });

  it('name is "CHAMANA"', () => {
    expect(result.name).toBe('CHAMANA');
  });

  it('url is base URL', () => {
    expect(result.url).toBe(BASE_URL);
  });
});

// ---------------------------------------------------------------------------
// productJsonLd
// ---------------------------------------------------------------------------
describe('productJsonLd', () => {
  it('has @type "Product"', () => {
    const result = productJsonLd(makeModel());
    expect(result['@type']).toBe('Product');
  });

  it('name format is "nombre - tipo"', () => {
    const result = productJsonLd(makeModel({ nombre: 'Hechizo', tipo: 'Falda' }));
    expect(result.name).toBe('Hechizo - Falda');
  });

  it('includes description from model', () => {
    const desc = 'Falda artesanal unica';
    const result = productJsonLd(makeModel({ descripcion: desc }));
    expect(result.description).toBe(desc);
  });

  it('brand name is "CHAMANA"', () => {
    const result = productJsonLd(makeModel());
    expect(result.brand).toEqual({ '@type': 'Brand', name: 'CHAMANA' });
  });

  it('uses first image URL with base URL prefix when images exist', () => {
    const model = makeModel({ imagenes: ['/images/models/hechizo/hechizo-1.webp'] });
    const result = productJsonLd(model);
    expect(result.image).toBe(`${BASE_URL}/images/models/hechizo/hechizo-1.webp`);
  });

  it('falls back to logo when no images', () => {
    const model = makeModel({ imagenes: undefined });
    const result = productJsonLd(model);
    expect(result.image).toBe(`${BASE_URL}/images/brand/logo-dark.png`);
  });

  it('falls back to logo when images array is empty', () => {
    const model = makeModel({ imagenes: [] });
    const result = productJsonLd(model);
    expect(result.image).toBe(`${BASE_URL}/images/brand/logo-dark.png`);
  });

  it('includes AggregateOffer when model has prices', () => {
    const model = makeModel({
      variantes: [makeVariante({ precio: 25000 })],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    expect(result).toHaveProperty('offers');
    expect((result.offers as Record<string, unknown>)['@type']).toBe('AggregateOffer');
  });

  it('AggregateOffer has lowPrice and highPrice as strings', () => {
    const model = makeModel({
      variantes: [
        makeVariante({ id: 'v1', precio: 20000 }),
        makeVariante({ id: 'v2', precio: 35000 }),
      ],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    const offers = result.offers as Record<string, unknown>;
    expect(offers.lowPrice).toBe('20000');
    expect(offers.highPrice).toBe('35000');
  });

  it('priceCurrency is "ARS"', () => {
    const model = makeModel({
      variantes: [makeVariante({ precio: 10000 })],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    const offers = result.offers as Record<string, unknown>;
    expect(offers.priceCurrency).toBe('ARS');
  });

  it('availability is InStock when at least one variante is not sinStock', () => {
    const model = makeModel({
      variantes: [
        makeVariante({ id: 'v1', precio: 10000, sinStock: true }),
        makeVariante({ id: 'v2', precio: 12000, sinStock: false }),
      ],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    const offers = result.offers as Record<string, unknown>;
    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('availability is OutOfStock when all variantes are sinStock', () => {
    const model = makeModel({
      variantes: [
        makeVariante({ id: 'v1', precio: 10000, sinStock: true }),
        makeVariante({ id: 'v2', precio: 12000, sinStock: true }),
      ],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    const offers = result.offers as Record<string, unknown>;
    expect(offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('omits offers entirely when no variante has a price', () => {
    const model = makeModel({
      variantes: [makeVariante({ precio: undefined })],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    expect(result).not.toHaveProperty('offers');
  });

  it('offer URL is /producto/{slug}', () => {
    const model = makeModel({
      slug: 'intuicion',
      variantes: [makeVariante({ precio: 42000 })],
    });
    const result = productJsonLd(model) as Record<string, unknown>;
    const offers = result.offers as Record<string, unknown>;
    expect(offers.url).toBe(`${BASE_URL}/producto/intuicion`);
  });
});

// ---------------------------------------------------------------------------
// breadcrumbJsonLd
// ---------------------------------------------------------------------------
describe('breadcrumbJsonLd', () => {
  const model = makeModel({ slug: 'espejo', nombre: 'Espejo' });
  const result = breadcrumbJsonLd(model);

  it('has @type "BreadcrumbList"', () => {
    expect(result['@type']).toBe('BreadcrumbList');
  });

  it('has 3 items: Inicio, Tienda, model name', () => {
    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].name).toBe('Inicio');
    expect(result.itemListElement[1].name).toBe('Tienda');
    expect(result.itemListElement[2].name).toBe('Espejo');
  });

  it('first item points to base URL', () => {
    expect(result.itemListElement[0].item).toBe(BASE_URL);
  });

  it('second item points to /tienda', () => {
    expect(result.itemListElement[1].item).toBe(`${BASE_URL}/tienda`);
  });

  it('third item has model name and /producto/{slug} URL', () => {
    expect(result.itemListElement[2].name).toBe('Espejo');
    expect(result.itemListElement[2].item).toBe(`${BASE_URL}/producto/espejo`);
  });

  it('positions are 1, 2, 3', () => {
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
    expect(result.itemListElement[2].position).toBe(3);
  });
});
