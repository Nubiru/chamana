/**
 * Unit tests for the Colecciones read layer in src/payload/queries.ts (G-34 / F-colecciones-frontend §6).
 *
 * Strategy mirrors tests/unit/lib/payload/query-adapters.test.ts: mock the `payload` module
 * (and @payload-config via jest moduleNameMapper) so the private adapter (adaptColeccion) and
 * safeQuery wrapper are exercised through the exported read fns. We assert the Payload-SoT
 * contract: the public-estado filter, newest-first sort, the two-step coleccion→modelos join,
 * the visibility predicate, and the safeQuery fallbacks.
 */

// @payload-config is mapped to tests/__mocks__/payload-config.ts via jest moduleNameMapper

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

import { formatTemporada } from '@/lib/utils';
import {
  getColeccionBySlug,
  getColecciones,
  getModelosByColeccion,
  isPublicColeccion,
} from '@/payload/queries';
import { getPayload } from 'payload';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

// ─── Helpers ───

function makeColeccionDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: 'magia',
    nombre: 'Magia',
    nombreCompleto: 'Coleccion Magia',
    temporada: 'primavera-verano',
    anio: 2025,
    estado: 'activa',
    descripcion: 'Primera coleccion de CHAMANA.',
    ejes: [{ eje: 'intuicion' }, { eje: 'magia' }],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

function makeModeloDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    slug: 'hechizo',
    nombre: 'Hechizo',
    tipo: 'Falda',
    descripcion: 'Una falda',
    variantes: [],
    imagenes: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

// Returns a mock payload whose `find` resolves to the queued results in call order.
function makeSeqPayload(...results: Array<{ docs: unknown[] }>) {
  const find = jest.fn();
  for (const r of results) {
    find.mockResolvedValueOnce(r);
  }
  return { find, findGlobal: jest.fn() } as unknown as Awaited<ReturnType<typeof getPayload>>;
}

describe('isPublicColeccion', () => {
  it('returns false for archivo (hidden from storefront)', () => {
    expect(isPublicColeccion('archivo')).toBe(false);
  });

  it('returns true for planificacion, produccion, activa', () => {
    expect(isPublicColeccion('planificacion')).toBe(true);
    expect(isPublicColeccion('produccion')).toBe(true);
    expect(isPublicColeccion('activa')).toBe(true);
  });
});

describe('formatTemporada', () => {
  it('maps primavera-verano to the accented Spanish label', () => {
    expect(formatTemporada('primavera-verano')).toBe('Primavera-Verano');
  });

  it('maps otono-invierno to Otoño-Invierno (with ñ)', () => {
    expect(formatTemporada('otono-invierno')).toBe('Otoño-Invierno');
  });
});

describe('getColecciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps Payload doc fields and flattens ejes to string[]', async () => {
    const payload = makeSeqPayload({ docs: [makeColeccionDoc()] });
    mockGetPayload.mockResolvedValue(payload);

    const result = await getColecciones();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      slug: 'magia',
      nombre: 'Magia',
      nombreCompleto: 'Coleccion Magia',
      temporada: 'primavera-verano',
      anio: 2025,
      estado: 'activa',
      descripcion: 'Primera coleccion de CHAMANA.',
      ejes: ['intuicion', 'magia'],
    });
  });

  it('queries only public estados (archivo excluded via where.estado.in)', async () => {
    const payload = makeSeqPayload({ docs: [] });
    mockGetPayload.mockResolvedValue(payload);

    await getColecciones();

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'colecciones',
        where: { estado: { in: ['planificacion', 'produccion', 'activa'] } },
        limit: 50,
      })
    );
  });

  it('sorts newest year first (anio descending)', async () => {
    const payload = makeSeqPayload({
      docs: [
        makeColeccionDoc({ slug: 'magia', anio: 2025, temporada: 'primavera-verano' }),
        makeColeccionDoc({ slug: 'transmutacion', anio: 2026, temporada: 'otono-invierno' }),
      ],
    });
    mockGetPayload.mockResolvedValue(payload);

    const result = await getColecciones();

    expect(result.map((c) => c.slug)).toEqual(['transmutacion', 'magia']);
  });

  it('within the same year sorts otono-invierno (later season) before primavera-verano', async () => {
    const payload = makeSeqPayload({
      docs: [
        makeColeccionDoc({ slug: 'pv', anio: 2025, temporada: 'primavera-verano' }),
        makeColeccionDoc({ slug: 'oi', anio: 2025, temporada: 'otono-invierno' }),
      ],
    });
    mockGetPayload.mockResolvedValue(payload);

    const result = await getColecciones();

    expect(result.map((c) => c.slug)).toEqual(['oi', 'pv']);
  });

  it('returns [] when the table does not exist yet (safeQuery fallback)', async () => {
    const payload = {
      find: jest.fn().mockRejectedValue(new Error('relation "colecciones" does not exist')),
    } as unknown as Awaited<ReturnType<typeof getPayload>>;
    mockGetPayload.mockResolvedValue(payload);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getColecciones();

    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });
});

describe('getColeccionBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the mapped collection on match', async () => {
    const payload = makeSeqPayload({ docs: [makeColeccionDoc({ slug: 'magia' })] });
    mockGetPayload.mockResolvedValue(payload);

    const result = await getColeccionBySlug('magia');

    expect(result).toBeDefined();
    expect(result?.slug).toBe('magia');
    expect(result?.nombreCompleto).toBe('Coleccion Magia');
  });

  it('returns undefined when no doc matches', async () => {
    const payload = makeSeqPayload({ docs: [] });
    mockGetPayload.mockResolvedValue(payload);

    const result = await getColeccionBySlug('nope');

    expect(result).toBeUndefined();
  });

  it('passes where:{slug:{equals}} with limit 1 and does NOT filter estado', async () => {
    const payload = makeSeqPayload({ docs: [] });
    mockGetPayload.mockResolvedValue(payload);

    await getColeccionBySlug('transmutacion');

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'colecciones',
        where: { slug: { equals: 'transmutacion' } },
        limit: 1,
      })
    );
    const args = (payload.find as jest.Mock).mock.calls[0][0];
    expect(args.where).not.toHaveProperty('estado');
  });

  it('returns undefined on table-missing (safeQuery fallback)', async () => {
    const payload = {
      find: jest.fn().mockRejectedValue(new Error('relation "colecciones" does not exist')),
    } as unknown as Awaited<ReturnType<typeof getPayload>>;
    mockGetPayload.mockResolvedValue(payload);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getColeccionBySlug('magia');

    expect(result).toBeUndefined();
    warnSpy.mockRestore();
  });
});

describe('getModelosByColeccion (two-step join)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns [] when the collection slug resolves to no doc', async () => {
    const payload = makeSeqPayload({ docs: [] });
    mockGetPayload.mockResolvedValue(payload);

    const result = await getModelosByColeccion('nope');

    expect(result).toEqual([]);
    // only the coleccion lookup runs; no modelos query
    expect(payload.find).toHaveBeenCalledTimes(1);
  });

  it('returns [] when the collection has no linked models', async () => {
    const payload = makeSeqPayload(
      { docs: [makeColeccionDoc({ id: 7, slug: 'transmutacion' })] },
      { docs: [] }
    );
    mockGetPayload.mockResolvedValue(payload);

    const result = await getModelosByColeccion('transmutacion');

    expect(result).toEqual([]);
  });

  it('queries modelos filtered by the resolved coleccion id and returns adapted models', async () => {
    const payload = makeSeqPayload(
      { docs: [makeColeccionDoc({ id: 7, slug: 'magia' })] },
      { docs: [makeModeloDoc({ slug: 'hechizo', nombre: 'Hechizo' })] }
    );
    mockGetPayload.mockResolvedValue(payload);

    const result = await getModelosByColeccion('magia');

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('hechizo');
    expect(result[0].nombre).toBe('Hechizo');

    // second find call targets modelos where coleccion equals the resolved id (7)
    const secondCallArgs = (payload.find as jest.Mock).mock.calls[1][0];
    expect(secondCallArgs).toEqual(
      expect.objectContaining({
        collection: 'modelos',
        where: { coleccion: { equals: 7 } },
        sort: 'nombre',
      })
    );
  });

  it('returns [] on table-missing (safeQuery fallback)', async () => {
    const payload = {
      find: jest.fn().mockRejectedValue(new Error('relation "modelos" does not exist')),
    } as unknown as Awaited<ReturnType<typeof getPayload>>;
    mockGetPayload.mockResolvedValue(payload);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getModelosByColeccion('magia');

    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });
});
