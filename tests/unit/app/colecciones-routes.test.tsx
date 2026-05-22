/**
 * Render + structured-data tests for the Colecciones frontend (G-34 / F-colecciones-frontend §6).
 *
 * Covers the customer journey: the index lists public collections + has an empty state; the
 * detail route renders the meta header + a ProductCard per model, shows "Próximamente" when the
 * collection has no models, and notFound()s on unknown OR archivo slugs; generateStaticParams
 * yields the public slugs; nav surfaces the Colecciones entry; sitemap + JSON-LD include the new
 * surfaces. The async server components are exercised by awaiting them and rendering the result.
 */

// Mock the heavy Payload module so requireActual('@/payload/queries') keeps the real
// isPublicColeccion predicate while we stub the async reads.
jest.mock('payload', () => ({ getPayload: jest.fn() }));

jest.mock('@/payload/queries', () => {
  const actual = jest.requireActual('@/payload/queries');
  return {
    __esModule: true,
    ...actual,
    getColecciones: jest.fn(),
    getColeccionBySlug: jest.fn(),
    getModelosByColeccion: jest.fn(),
    getModelos: jest.fn(),
  };
});

// next/link → a real <a> so we can assert hrefs. requireActual('react') avoids the jest
// out-of-scope-variable restriction on mock factories.
jest.mock('next/link', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ href, children }: { href: unknown; children: unknown }) =>
      React.createElement('a', { href: typeof href === 'string' ? href : '#' }, children),
  };
});

jest.mock('next/image', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ alt, src }: { alt?: string; src?: unknown }) =>
      React.createElement('img', { alt: alt ?? '', src: typeof src === 'string' ? src : '' }),
  };
});

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  usePathname: () => '/colecciones',
}));

jest.mock('@/lib/stores/cart-store', () => ({
  useCartStore: () => 0,
}));

import ColeccionPage, { generateStaticParams } from '@/app/(store)/colecciones/[slug]/page';
import ColeccionesPage from '@/app/(store)/colecciones/page';
import sitemap from '@/app/sitemap';
import { BottomNav } from '@/components/store/BottomNav';
import { StoreNavbar } from '@/components/store/StoreNavbar';
import type { ChamanaModel, CollectionMeta } from '@/domain/catalog';
import {
  coleccionBreadcrumbJsonLd,
  coleccionJsonLd,
  coleccionesIndexJsonLd,
} from '@/lib/structured-data';
import {
  getColeccionBySlug,
  getColecciones,
  getModelos,
  getModelosByColeccion,
} from '@/payload/queries';
import { render, screen } from '@testing-library/react';

const mockGetColecciones = getColecciones as jest.Mock;
const mockGetColeccionBySlug = getColeccionBySlug as jest.Mock;
const mockGetModelosByColeccion = getModelosByColeccion as jest.Mock;
const mockGetModelos = getModelos as jest.Mock;

const magia: CollectionMeta = {
  slug: 'magia',
  nombre: 'Magia',
  nombreCompleto: 'Coleccion Magia',
  temporada: 'primavera-verano',
  anio: 2025,
  estado: 'activa',
  descripcion: 'Primera coleccion de CHAMANA.',
  ejes: ['intuicion', 'magia'],
};

const transmutacion: CollectionMeta = {
  slug: 'transmutacion',
  nombre: 'Transmutacion',
  nombreCompleto: 'Coleccion Transmutacion',
  temporada: 'otono-invierno',
  anio: 2026,
  estado: 'planificacion',
  descripcion: '18 prendas artesanales.',
  ejes: ['transmutacion'],
};

function makeModel(overrides: Partial<ChamanaModel> = {}): ChamanaModel {
  return {
    slug: 'hechizo',
    nombre: 'Hechizo',
    tipo: 'Falda',
    descripcion: 'Una falda',
    variantes: [
      {
        id: 'v1',
        tela1: { codigo: 'X', tipo: 'Lino', color: 'Negro', colorHex: '#000000' },
        precio: 25000,
      },
    ],
    imagenes: ['/images/models/hechizo/hechizo-1.webp'],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── JSON-LD helpers ───

describe('coleccionesIndexJsonLd', () => {
  it('emits a CollectionPage with an ItemList of every collection', () => {
    const result = coleccionesIndexJsonLd([magia, transmutacion]);
    expect(result['@type']).toBe('CollectionPage');
    expect(result.url).toBe('https://chamana.app/colecciones');
    expect(result.mainEntity['@type']).toBe('ItemList');
    expect(result.mainEntity.itemListElement).toHaveLength(2);
    expect(result.mainEntity.itemListElement[0]).toEqual(
      expect.objectContaining({
        position: 1,
        name: 'Coleccion Magia',
        url: 'https://chamana.app/colecciones/magia',
      })
    );
  });
});

describe('coleccionJsonLd', () => {
  it('emits a CollectionPage whose ItemList points at each model product URL', () => {
    const result = coleccionJsonLd(magia, [
      makeModel({ slug: 'hechizo' }),
      makeModel({ slug: 'espejo' }),
    ]);
    expect(result['@type']).toBe('CollectionPage');
    expect(result.name).toBe('Coleccion Magia');
    expect(result.mainEntity.itemListElement).toHaveLength(2);
    expect(result.mainEntity.itemListElement[0].url).toBe('https://chamana.app/producto/hechizo');
    expect(result.mainEntity.itemListElement[1].url).toBe('https://chamana.app/producto/espejo');
  });
});

describe('coleccionBreadcrumbJsonLd', () => {
  it('emits the Inicio → Colecciones → nombre breadcrumb chain', () => {
    const result = coleccionBreadcrumbJsonLd(magia);
    expect(result['@type']).toBe('BreadcrumbList');
    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].name).toBe('Inicio');
    expect(result.itemListElement[1].name).toBe('Colecciones');
    expect(result.itemListElement[1].item).toBe('https://chamana.app/colecciones');
    expect(result.itemListElement[2].name).toBe('Magia');
    expect(result.itemListElement[2].item).toBe('https://chamana.app/colecciones/magia');
  });
});

// ─── Index route ───

describe('/colecciones index', () => {
  it('renders one card per public collection, linked to /colecciones/{slug}', async () => {
    mockGetColecciones.mockResolvedValue([transmutacion, magia]);

    render(await ColeccionesPage());

    expect(screen.getByRole('heading', { name: 'Colecciones', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Coleccion Magia')).toBeInTheDocument();
    expect(screen.getByText('Coleccion Transmutacion')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Coleccion Magia/ })).toHaveAttribute(
      'href',
      '/colecciones/magia'
    );
  });

  it('renders a gentle empty state when there are no collections', async () => {
    mockGetColecciones.mockResolvedValue([]);

    render(await ColeccionesPage());

    expect(screen.getByText(/Pronto vas a poder explorar/)).toBeInTheDocument();
    expect(screen.queryByText('Coleccion Magia')).not.toBeInTheDocument();
  });
});

// ─── Detail route ───

describe('/colecciones/[slug] detail', () => {
  it('renders the meta header (nombreCompleto + temporada/anio + descripcion + ejes) and a card per model', async () => {
    mockGetColeccionBySlug.mockResolvedValue(magia);
    mockGetModelosByColeccion.mockResolvedValue([
      makeModel({ slug: 'hechizo', nombre: 'Hechizo' }),
      makeModel({ slug: 'espejo', nombre: 'Espejo' }),
    ]);

    render(await ColeccionPage({ params: Promise.resolve({ slug: 'magia' }) }));

    expect(screen.getByRole('heading', { name: 'Coleccion Magia', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Primavera-Verano 2025')).toBeInTheDocument();
    expect(screen.getByText('Primera coleccion de CHAMANA.')).toBeInTheDocument();
    expect(screen.getByText('intuicion')).toBeInTheDocument();
    expect(screen.getByText('Hechizo')).toBeInTheDocument();
    expect(screen.getByText('Espejo')).toBeInTheDocument();
  });

  it('shows the "Próximamente" empty-models state (Transmutación, 0 linked models)', async () => {
    mockGetColeccionBySlug.mockResolvedValue(transmutacion);
    mockGetModelosByColeccion.mockResolvedValue([]);

    render(await ColeccionPage({ params: Promise.resolve({ slug: 'transmutacion' }) }));

    expect(screen.getByText('Próximamente')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Coleccion Transmutacion', level: 1 })
    ).toBeInTheDocument();
  });

  it('notFound()s for an unknown slug', async () => {
    mockGetColeccionBySlug.mockResolvedValue(undefined);

    await expect(
      ColeccionPage({ params: Promise.resolve({ slug: 'inexistente' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('notFound()s for an archivo collection (hidden from the storefront)', async () => {
    mockGetColeccionBySlug.mockResolvedValue({ ...magia, slug: 'vieja', estado: 'archivo' });

    await expect(ColeccionPage({ params: Promise.resolve({ slug: 'vieja' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
    // the models query is never reached once the visibility guard fails
    expect(mockGetModelosByColeccion).not.toHaveBeenCalled();
  });
});

describe('generateStaticParams', () => {
  it('returns the slugs getColecciones yields (public-filtered upstream)', async () => {
    mockGetColecciones.mockResolvedValue([magia, transmutacion]);

    const params = await generateStaticParams();

    expect(params).toEqual([{ slug: 'magia' }, { slug: 'transmutacion' }]);
  });
});

// ─── Nav ───

describe('nav surfaces the Colecciones entry', () => {
  it('StoreNavbar renders a Colecciones link to /colecciones', () => {
    render(<StoreNavbar />);
    expect(screen.getByRole('link', { name: 'Colecciones' })).toHaveAttribute(
      'href',
      '/colecciones'
    );
  });

  it('BottomNav renders a Colecciones tab to /colecciones', () => {
    render(<BottomNav />);
    expect(screen.getByRole('link', { name: /Colecciones/ })).toHaveAttribute(
      'href',
      '/colecciones'
    );
  });
});

// ─── Sitemap ───

describe('sitemap', () => {
  it('includes the colecciones index + a per-collection entry', async () => {
    mockGetModelos.mockResolvedValue([{ slug: 'hechizo' }]);
    mockGetColecciones.mockResolvedValue([magia, transmutacion]);

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain('https://chamana.app/colecciones');
    expect(urls).toContain('https://chamana.app/colecciones/magia');
    expect(urls).toContain('https://chamana.app/colecciones/transmutacion');
  });
});
