/**
 * Render test — the homepage hero <p> is BOUND to the CMS, not hardcoded (G-46).
 *
 * Mirrors colecciones-routes.test.tsx: the heavy Payload module + the storefront
 * readers are mocked so @payload-config never loads into jest, the async server
 * component is awaited, and we assert on the rendered output. The heavy client
 * sections (3D carousel / category circles / product cards) are stubbed — this
 * test is about the hero copy, not those sections.
 *
 * The proof of binding: getContenidoInicio resolves a value that is DISTINCT from
 * the old hardcoded literal; the rendered hero must show that CMS value (so a
 * Daniela edit reaches the page) and must NOT show the old hardcoded sentence.
 *
 * G22: no try/catch. G26: a wrong/missing binding flips every assertion.
 */

jest.mock('payload', () => ({ getPayload: jest.fn() }));

jest.mock('@/payload/queries', () => {
  const actual = jest.requireActual('@/payload/queries');
  return {
    __esModule: true,
    ...actual,
    getModelos: jest.fn(),
    getModelosFeatured: jest.fn(),
    getCategorias: jest.fn(),
    getContenidoInicio: jest.fn(),
  };
});

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

// Heavy client sections — out of scope for the hero-copy test.
jest.mock('@/components/store/HeroCarousel3D', () => ({ HeroCarousel3D: () => null }));
jest.mock('@/components/store/CategoryCircles', () => ({ CategoryCircles: () => null }));
jest.mock('@/components/store/ProductCard', () => ({ ProductCard: () => null }));

import HomePage from '@/app/(store)/page';
import {
  getCategorias,
  getContenidoInicio,
  getModelos,
  getModelosFeatured,
} from '@/payload/queries';
import { render, screen } from '@testing-library/react';

const mockGetModelos = getModelos as jest.Mock;
const mockGetModelosFeatured = getModelosFeatured as jest.Mock;
const mockGetCategorias = getCategorias as jest.Mock;
const mockGetContenidoInicio = getContenidoInicio as jest.Mock;

const OLD_HARDCODED_HERO =
  'Ropa femenina artesanal inspirada en la naturaleza. Cada prenda es una expresión de sensibilidad, fluidez y fuerza.';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetModelos.mockResolvedValue([]);
  mockGetModelosFeatured.mockResolvedValue([]);
  mockGetCategorias.mockResolvedValue([]);
});

describe('homepage hero — CMS binding (G-46)', () => {
  it('renders the hero subtitle from getContenidoInicio (a Daniela edit reaches the page)', async () => {
    const cmsHero = 'Mi nueva copy del hero — editada por Daniela en el admin.';
    mockGetContenidoInicio.mockResolvedValue({ subtitulo: cmsHero });

    render(await HomePage());

    expect(screen.getByText(cmsHero)).toBeInTheDocument();
    // The old hardcoded literal must NOT be the hero copy anymore.
    expect(screen.queryByText(OLD_HARDCODED_HERO)).not.toBeInTheDocument();
  });

  it('calls getContenidoInicio when building the homepage', async () => {
    mockGetContenidoInicio.mockResolvedValue({ subtitulo: 'cualquier texto' });

    render(await HomePage());

    expect(mockGetContenidoInicio).toHaveBeenCalledTimes(1);
  });
});
