/**
 * Unit tests for lib/payload/queries.ts
 *
 * Strategy: The adapter functions (adaptTela, adaptVariante, adaptModelo) and
 * error-handling functions (isTableMissingError, safeQuery) are private.
 * We test them indirectly through exported query functions by mocking the
 * Payload client returned by getPayload.
 */

// @payload-config is mapped to tests/__mocks__/payload-config.ts via jest moduleNameMapper

// Mock payload module
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

// Mock the static MODELOS import used as image fallback in adaptModelo
jest.mock('@/lib/data/products', () => ({
  MODELOS: [
    {
      slug: 'intuicion',
      nombre: 'Intuicion',
      imagenes: ['/images/models/intuicion/intuicion-1.webp'],
    },
    {
      slug: 'hechizo',
      nombre: 'Hechizo',
      imagenes: ['/images/models/hechizo/hechizo-1.webp', '/images/models/hechizo/hechizo-2.webp'],
    },
  ],
  getModelMinPrice: jest.fn(),
  getModelMaxPrice: jest.fn(),
}));

import { getModeloBySlug, getModelos, getModelosFeatured, getTelas } from '@/lib/payload/queries';
import { getPayload } from 'payload';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

// ─── Helpers: build mock Payload docs ───

function makeTelDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    codigo: 'LinSpanBei',
    tipo: 'Lino',
    subtipo: 'Spandex',
    color: 'Beige',
    colorHex: '#D4B896',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

function makeModeloDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: 'hechizo',
    nombre: 'Hechizo',
    tipo: 'Falda',
    descripcion: 'Test description',
    variantes: [],
    imagenes: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

function makeMockPayload(findResult: { docs: unknown[] }) {
  return {
    find: jest.fn().mockResolvedValue(findResult),
    findGlobal: jest.fn(),
  } as unknown as Awaited<ReturnType<typeof getPayload>>;
}

// ─── Tests ───

describe('Payload query adapters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────────────────────────
  // adaptTela (tested via getTelas)
  // ────────────────────────────────────────────

  describe('adaptTela (via getTelas)', () => {
    it('returns adapted tela record keyed by codigo', async () => {
      const doc = makeTelDoc();
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getTelas();

      expect(result).toEqual({
        LinSpanBei: {
          codigo: 'LinSpanBei',
          tipo: 'Lino',
          subtipo: 'Spandex',
          color: 'Beige',
          colorHex: '#D4B896',
        },
      });
    });

    it('sets subtipo to undefined when source subtipo is falsy', async () => {
      const doc = makeTelDoc({ subtipo: null });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getTelas();

      expect(result.LinSpanBei.subtipo).toBeUndefined();
    });

    it('handles multiple telas keyed correctly', async () => {
      const doc1 = makeTelDoc({ codigo: 'LinSpanBei', color: 'Beige' });
      const doc2 = makeTelDoc({
        codigo: 'RibNegro',
        tipo: 'Rib',
        subtipo: null,
        color: 'Negro',
        colorHex: '#1A1A1A',
      });
      const mockPayload = makeMockPayload({ docs: [doc1, doc2] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getTelas();

      expect(Object.keys(result)).toHaveLength(2);
      expect(result.LinSpanBei.color).toBe('Beige');
      expect(result.RibNegro.color).toBe('Negro');
      expect(result.RibNegro.subtipo).toBeUndefined();
    });
  });

  // ────────────────────────────────────────────
  // adaptModelo + adaptVariante (via getModelos)
  // ────────────────────────────────────────────

  describe('adaptModelo (via getModelos)', () => {
    it('returns adapted model with basic fields', async () => {
      const doc = makeModeloDoc({
        slug: 'hechizo',
        nombre: 'Hechizo',
        tipo: 'Falda',
        descripcion: 'A flowing skirt',
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('hechizo');
      expect(result[0].nombre).toBe('Hechizo');
      expect(result[0].tipo).toBe('Falda');
      expect(result[0].descripcion).toBe('A flowing skirt');
    });

    it('includes optional fields (detalle, badge, featured, bundleId) when present', async () => {
      const doc = makeModeloDoc({
        detalle: 'Reversible',
        badge: 'Nuevo',
        featured: true,
        bundleId: 'bundle-1',
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].detalle).toBe('Reversible');
      expect(result[0].badge).toBe('Nuevo');
      expect(result[0].featured).toBe(true);
      expect(result[0].bundleId).toBe('bundle-1');
    });

    it('omits optional fields when absent in source doc', async () => {
      const doc = makeModeloDoc({
        detalle: undefined,
        badge: undefined,
        featured: undefined,
        bundleId: undefined,
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0]).not.toHaveProperty('detalle');
      expect(result[0]).not.toHaveProperty('badge');
      expect(result[0]).not.toHaveProperty('featured');
      expect(result[0]).not.toHaveProperty('bundleId');
    });

    it('falls back to static MODELOS images when CMS has no images', async () => {
      const doc = makeModeloDoc({ slug: 'hechizo', imagenes: [] });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      // Should fall back to the mocked MODELOS data for slug 'hechizo'
      expect(result[0].imagenes).toEqual([
        '/images/models/hechizo/hechizo-1.webp',
        '/images/models/hechizo/hechizo-2.webp',
      ]);
    });

    it('uses CMS image URLs when available', async () => {
      const doc = makeModeloDoc({
        slug: 'hechizo',
        imagenes: [
          { imagen: { url: '/uploads/hechizo-cms-1.webp' } },
          { imagen: { url: '/uploads/hechizo-cms-2.webp' } },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].imagenes).toEqual([
        '/uploads/hechizo-cms-1.webp',
        '/uploads/hechizo-cms-2.webp',
      ]);
    });

    it('filters out image entries where imagen is a string reference (not populated)', async () => {
      const doc = makeModeloDoc({
        slug: 'hechizo',
        imagenes: [
          { imagen: { url: '/uploads/real.webp' } },
          { imagen: 'some-string-id' }, // not populated, no url
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      // Only the populated image should be included
      expect(result[0].imagenes).toEqual(['/uploads/real.webp']);
    });

    it('returns empty imagenes array when slug not found in static MODELOS and CMS has no images', async () => {
      const doc = makeModeloDoc({ slug: 'unknown-slug', imagenes: [] });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].imagenes).toEqual([]);
    });
  });

  // ────────────────────────────────────────────
  // adaptVariante (via getModelos with variantes)
  // ────────────────────────────────────────────

  describe('adaptVariante (via getModelos)', () => {
    it('adapts variante with populated tela1 object', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'hechizo-linspanbei',
            tela1: {
              codigo: 'LinSpanBei',
              tipo: 'Lino',
              subtipo: 'Spandex',
              color: 'Beige',
              colorHex: '#D4B896',
            },
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();
      const variante = result[0].variantes[0];

      expect(variante.id).toBe('hechizo-linspanbei');
      expect(variante.tela1).toEqual({
        codigo: 'LinSpanBei',
        tipo: 'Lino',
        subtipo: 'Spandex',
        color: 'Beige',
        colorHex: '#D4B896',
      });
    });

    it('handles tela1 as string reference (not populated)', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: 'LinSpanBei', // string reference, not populated
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();
      const variante = result[0].variantes[0];

      expect(variante.tela1.codigo).toBe('LinSpanBei');
    });

    it('includes tela2 when populated as object', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'espejo-v1',
            tela1: {
              codigo: 'LinSpanBei',
              tipo: 'Lino',
              subtipo: 'Spandex',
              color: 'Beige',
              colorHex: '#D4B896',
            },
            tela2: {
              codigo: 'RibNegro',
              tipo: 'Rib',
              subtipo: null,
              color: 'Negro',
              colorHex: '#1A1A1A',
            },
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();
      const variante = result[0].variantes[0];

      expect(variante.tela2).toBeDefined();
      expect(variante.tela2?.codigo).toBe('RibNegro');
      expect(variante.tela2?.subtipo).toBeUndefined();
    });

    it('omits tela2 when null', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000000' },
            tela2: null,
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes[0]).not.toHaveProperty('tela2');
    });

    it('includes precio when present', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000000' },
            precio: 32000,
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes[0].precio).toBe(32000);
    });

    it('omits precio when not present', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000000' },
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes[0]).not.toHaveProperty('precio');
    });

    it('includes precioAnterior and descuento when present', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000000' },
            precio: 28000,
            precioAnterior: 35000,
            descuento: 20,
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();
      const v = result[0].variantes[0];

      expect(v.precio).toBe(28000);
      expect(v.precioAnterior).toBe(35000);
      expect(v.descuento).toBe(20);
    });

    it('includes sinStock when truthy', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000000' },
            sinStock: true,
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes[0].sinStock).toBe(true);
    });

    it('omits sinStock when falsy', async () => {
      const doc = makeModeloDoc({
        variantes: [
          {
            varianteId: 'test-v1',
            tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000000' },
            sinStock: false,
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes[0]).not.toHaveProperty('sinStock');
    });

    it('handles model with no variantes (empty array)', async () => {
      const doc = makeModeloDoc({ variantes: [] });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes).toEqual([]);
    });

    it('handles model with undefined variantes (falls back to empty array)', async () => {
      const doc = makeModeloDoc({ variantes: undefined });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result[0].variantes).toEqual([]);
    });
  });

  // ────────────────────────────────────────────
  // safeQuery + isTableMissingError (via exported functions)
  // ────────────────────────────────────────────

  describe('safeQuery error handling (via getModelos)', () => {
    it('returns fallback (empty array) when error message contains "does not exist"', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(new Error('relation "modelos" does not exist')),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getModelos();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Payload]'),
        expect.any(String)
      );

      warnSpy.mockRestore();
    });

    it('returns fallback when error message contains "relation"', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(new Error('relation "public.modelos" not found')),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getModelos();

      expect(result).toEqual([]);

      warnSpy.mockRestore();
    });

    it('returns fallback when nested cause contains "does not exist"', async () => {
      const pgError = new Error('relation "modelos" does not exist');
      const wrappedError = new Error('Query failed');
      (wrappedError as Error & { cause: Error }).cause = pgError;

      const mockPayload = {
        find: jest.fn().mockRejectedValue(wrappedError),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getModelos();

      expect(result).toEqual([]);

      warnSpy.mockRestore();
    });

    it('returns fallback for deeply nested cause chain', async () => {
      const pgError = new Error('table does not exist');
      const mid = new Error('drizzle error');
      (mid as Error & { cause: Error }).cause = pgError;
      const outer = new Error('Payload error');
      (outer as Error & { cause: Error }).cause = mid;

      const mockPayload = {
        find: jest.fn().mockRejectedValue(outer),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getModelos();

      expect(result).toEqual([]);

      warnSpy.mockRestore();
    });

    it('returns fallback when error is a non-Error string containing "does not exist"', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue('table does not exist'),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getModelos();

      expect(result).toEqual([]);

      warnSpy.mockRestore();
    });

    it('re-throws errors that are NOT table-missing errors', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(new Error('Connection refused')),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      await expect(getModelos()).rejects.toThrow('Connection refused');
    });

    it('re-throws TypeError (non-table-missing)', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(new TypeError('Cannot read properties of undefined')),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      await expect(getModelos()).rejects.toThrow(TypeError);
    });
  });

  // ────────────────────────────────────────────
  // safeQuery fallback types for different functions
  // ────────────────────────────────────────────

  describe('safeQuery fallback per function', () => {
    const tableMissingError = new Error('relation "telas" does not exist');

    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('getTelas returns empty object {} on table-missing', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(tableMissingError),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getTelas();

      expect(result).toEqual({});
    });

    it('getModelos returns empty array [] on table-missing', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(tableMissingError),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result).toEqual([]);
    });

    it('getModeloBySlug returns undefined on table-missing', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(tableMissingError),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModeloBySlug('hechizo');

      expect(result).toBeUndefined();
    });

    it('getModelosFeatured returns empty array [] on table-missing', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(tableMissingError),
      } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelosFeatured();

      expect(result).toEqual([]);
    });
  });

  // ────────────────────────────────────────────
  // getModeloBySlug specific behavior
  // ────────────────────────────────────────────

  describe('getModeloBySlug', () => {
    it('returns undefined when no docs match the slug', async () => {
      const mockPayload = makeMockPayload({ docs: [] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModeloBySlug('nonexistent');

      expect(result).toBeUndefined();
    });

    it('returns adapted model when doc found', async () => {
      const doc = makeModeloDoc({ slug: 'intuicion', nombre: 'Intuicion', tipo: 'Kimono' });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModeloBySlug('intuicion');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('intuicion');
      expect(result?.nombre).toBe('Intuicion');
      expect(result?.tipo).toBe('Kimono');
    });

    it('passes correct where clause to payload.find', async () => {
      const mockFind = jest.fn().mockResolvedValue({ docs: [] });
      const mockPayload = { find: mockFind } as unknown as Awaited<ReturnType<typeof getPayload>>;
      mockGetPayload.mockResolvedValue(mockPayload);

      await getModeloBySlug('intuicion');

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'modelos',
          where: { slug: { equals: 'intuicion' } },
          limit: 1,
          depth: 2,
        })
      );
    });
  });

  // ────────────────────────────────────────────
  // Full round-trip: complex model doc
  // ────────────────────────────────────────────

  describe('full round-trip adaptation', () => {
    it('adapts a complete model doc with all fields and multiple variantes', async () => {
      const doc = makeModeloDoc({
        slug: 'espejo',
        nombre: 'Espejo',
        tipo: 'Top',
        detalle: 'Reversible',
        descripcion: 'Un top reversible',
        featured: true,
        badge: 'Bestseller',
        imagenes: [
          { imagen: { url: '/uploads/espejo-1.webp' } },
          { imagen: { url: '/uploads/espejo-2.webp' } },
        ],
        variantes: [
          {
            varianteId: 'espejo-v1',
            tela1: {
              codigo: 'LinSpanBei',
              tipo: 'Lino',
              subtipo: 'Spandex',
              color: 'Beige',
              colorHex: '#D4B896',
            },
            tela2: {
              codigo: 'RibNegro',
              tipo: 'Rib',
              subtipo: null,
              color: 'Negro',
              colorHex: '#1A1A1A',
            },
            precio: 28000,
            precioAnterior: 35000,
            descuento: 20,
          },
          {
            varianteId: 'espejo-v2',
            tela1: {
              codigo: 'LinMenChoc',
              tipo: 'Lino',
              subtipo: 'Men',
              color: 'Chocolate',
              colorHex: '#5C3A21',
            },
            tela2: null,
            sinStock: true,
          },
        ],
      });
      const mockPayload = makeMockPayload({ docs: [doc] });
      mockGetPayload.mockResolvedValue(mockPayload);

      const result = await getModelos();

      expect(result).toHaveLength(1);
      const model = result[0];

      // Model-level fields
      expect(model.slug).toBe('espejo');
      expect(model.nombre).toBe('Espejo');
      expect(model.tipo).toBe('Top');
      expect(model.detalle).toBe('Reversible');
      expect(model.descripcion).toBe('Un top reversible');
      expect(model.featured).toBe(true);
      expect(model.badge).toBe('Bestseller');
      expect(model.imagenes).toEqual(['/uploads/espejo-1.webp', '/uploads/espejo-2.webp']);

      // First variante: has tela2, pricing, discount
      const v1 = model.variantes[0];
      expect(v1.id).toBe('espejo-v1');
      expect(v1.tela1.codigo).toBe('LinSpanBei');
      expect(v1.tela2).toBeDefined();
      expect(v1.tela2?.codigo).toBe('RibNegro');
      expect(v1.tela2?.subtipo).toBeUndefined();
      expect(v1.precio).toBe(28000);
      expect(v1.precioAnterior).toBe(35000);
      expect(v1.descuento).toBe(20);
      expect(v1).not.toHaveProperty('sinStock');

      // Second variante: no tela2, no precio, sinStock
      const v2 = model.variantes[1];
      expect(v2.id).toBe('espejo-v2');
      expect(v2.tela1.codigo).toBe('LinMenChoc');
      expect(v2).not.toHaveProperty('tela2');
      expect(v2).not.toHaveProperty('precio');
      expect(v2.sinStock).toBe(true);
    });
  });
});
