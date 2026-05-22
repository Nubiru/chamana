/**
 * Unit tests for getContenidoInicio() — the homepage hero CMS reader (G-46).
 *
 * Strategy mirrors query-adapters.test.ts: getContenidoInicio + safeQuery are
 * exercised through the public export while the Payload client (findGlobal) is
 * mocked. Covers:
 *   - the global supplies subtitulo → it is returned verbatim;
 *   - the global exists but subtitulo is empty/undefined → the hero fallback
 *     (the CURRENT hardcoded hero copy) is returned, never a blank;
 *   - the DB table is missing (first deploy before seed) → safeQuery returns the
 *     fallback object, so the build/storefront stays resilient (G-39).
 *
 * G22: no try/catch in bodies. G26: every expect can fail.
 */

// @payload-config is mapped to tests/__mocks__/payload-config.ts via jest moduleNameMapper

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

import { HERO_SUBTITULO_FALLBACK, getContenidoInicio } from '@/payload/queries';
import { getPayload } from 'payload';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

function makeMockPayload(findGlobalImpl: () => unknown) {
  return {
    find: jest.fn(),
    findGlobal: jest.fn().mockImplementation(findGlobalImpl),
  } as unknown as Awaited<ReturnType<typeof getPayload>>;
}

describe('getContenidoInicio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the subtitulo authored in the CMS global', async () => {
    const cmsValue = 'Texto del hero editado por Daniela en el admin.';
    mockGetPayload.mockResolvedValue(makeMockPayload(() => ({ subtitulo: cmsValue })));

    const result = await getContenidoInicio();

    expect(result.subtitulo).toBe(cmsValue);
    // Distinct from the fallback — proves the CMS value actually flowed through.
    expect(result.subtitulo).not.toBe(HERO_SUBTITULO_FALLBACK);
  });

  it('falls back to the current hero copy when the global subtitulo is empty', async () => {
    mockGetPayload.mockResolvedValue(makeMockPayload(() => ({ subtitulo: '' })));

    const result = await getContenidoInicio();

    expect(result.subtitulo).toBe(HERO_SUBTITULO_FALLBACK);
  });

  it('falls back when the global subtitulo is undefined', async () => {
    mockGetPayload.mockResolvedValue(makeMockPayload(() => ({})));

    const result = await getContenidoInicio();

    expect(result.subtitulo).toBe(HERO_SUBTITULO_FALLBACK);
  });

  it('returns the fallback object when the DB table is missing (unseeded deploy)', async () => {
    mockGetPayload.mockResolvedValue(
      makeMockPayload(() => {
        throw new Error('SQLITE_ERROR: no such table: contenido_inicio');
      })
    );

    const result = await getContenidoInicio();

    expect(result.subtitulo).toBe(HERO_SUBTITULO_FALLBACK);
  });

  it('the hero fallback equals the current hardcoded homepage copy (data-truth: no blank, no drift)', () => {
    // This literal MUST match the hero <p> that page.tsx rendered before the binding.
    expect(HERO_SUBTITULO_FALLBACK).toBe(
      'Ropa femenina artesanal inspirada en la naturaleza. Cada prenda es una expresión de sensibilidad, fluidez y fuerza.'
    );
  });

  it('re-throws non-table-missing errors (genuine failures must surface, not silently fall back)', async () => {
    mockGetPayload.mockResolvedValue(
      makeMockPayload(() => {
        throw new Error('boom: connection reset');
      })
    );

    await expect(getContenidoInicio()).rejects.toThrow('boom: connection reset');
  });
});
