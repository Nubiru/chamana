/**
 * Integration test — F3 / G-7 / AC-1.
 *
 * Exercises the wiring of `autoVarianteId` into `collections/Modelos.ts`
 * at `fields.variantes.fields.varianteId.hooks.beforeValidate`. Strategy
 * mirrors `telas-state-machine-hook.test.ts` (G-14): pull the hook function
 * out of the SanitizedCollectionConfig and call it with mocked Payload args
 * to pin the wired adapter contract (correct field path, correct hook phase,
 * correct invocation per array row).
 *
 * AC-1: Cintia creates a Modelo with BLANK varianteId fields → save → all
 * variants have populated IDs.
 *
 * Companion of `tests/unit/lib/payload/hooks/auto-variante-id.test.ts`
 * (pure hook logic) — this file pins the *wiring* contract.
 */

import { Modelos } from '@/collections/Modelos';
import type { CollectionConfig, Field } from 'payload';

// ── Helpers to walk the sanitized collection field tree ──────────────────

function findField(fields: Field[], name: string): Field | undefined {
  for (const f of fields) {
    if ('name' in f && f.name === name) return f;
    if (f.type === 'row' && 'fields' in f) {
      const inner = findField(f.fields, name);
      if (inner) return inner;
    }
  }
  return undefined;
}

function getVarianteIdHook(collection: CollectionConfig) {
  const variantes = findField(collection.fields as Field[], 'variantes');
  if (!variantes || variantes.type !== 'array')
    throw new Error('variantes array field not found on Modelos');
  const varianteId = findField(variantes.fields, 'varianteId');
  if (!varianteId || varianteId.type !== 'text')
    throw new Error('varianteId text field not found on variantes');
  const hook = varianteId.hooks?.beforeValidate?.[0];
  if (!hook) throw new Error('autoVarianteId not wired on varianteId.hooks.beforeValidate');
  return hook;
}

function mockReq(byId: Record<string, { codigo: string }>) {
  return {
    payload: {
      findByID: jest.fn(async ({ id }: { id: string | number }) => {
        const row = byId[String(id)];
        if (!row) throw new Error(`tela not found: ${id}`);
        return row;
      }),
    },
  } as any;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('Modelos wiring — autoVarianteId on variantes.varianteId (F3 G-7 AC-1/2)', () => {
  it('AC-2 (grep-equivalent): autoVarianteId is registered as a beforeValidate hook on varianteId', () => {
    const hook = getVarianteIdHook(Modelos);
    expect(typeof hook).toBe('function');
  });

  it('AC-1: populates blank varianteId for a single-tela variant using data.slug', async () => {
    const hook = getVarianteIdHook(Modelos);
    const req = mockReq({ 'tela-A': { codigo: 'LinMenChoc' } });

    const result = await (hook as any)({
      value: undefined,
      siblingData: { tela1: 'tela-A' },
      data: { slug: 'hechizo' },
      req,
    });

    expect(result).toBe('hechizo-linmenchoc');
  });

  it('AC-1: populates blank varianteId for a reversible (two-tela) variant', async () => {
    const hook = getVarianteIdHook(Modelos);
    const req = mockReq({
      'tela-A': { codigo: 'LinMar' },
      'tela-B': { codigo: 'AlgVer' },
    });

    const result = await (hook as any)({
      value: undefined,
      siblingData: { tela1: 'tela-A', tela2: 'tela-B' },
      data: { slug: 'espejo' },
      req,
    });

    expect(result).toBe('espejo-linmar-algver');
  });

  it('AC-1: leaves an existing varianteId unchanged (no overwrite on update)', async () => {
    const hook = getVarianteIdHook(Modelos);
    const req = mockReq({ 'tela-A': { codigo: 'LinMar' } });

    const result = await (hook as any)({
      value: 'hechizo-linmarmalv',
      siblingData: { tela1: 'tela-A' },
      data: { slug: 'hechizo' },
      req,
    });

    expect(result).toBe('hechizo-linmarmalv');
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it('AC-1: simulates Cintia saving 3 blank variants in one Modelo → all IDs populated', async () => {
    const hook = getVarianteIdHook(Modelos);
    const req = mockReq({
      t1: { codigo: 'LinMar' },
      t2: { codigo: 'LinChoc' },
      t3: { codigo: 'AlgVer' },
    });

    const data = { slug: 'hechizo' };
    const variants = [{ tela1: 't1' }, { tela1: 't2' }, { tela1: 't3' }];

    const ids = await Promise.all(
      variants.map((siblingData) => (hook as any)({ value: undefined, siblingData, data, req }))
    );

    expect(ids).toEqual(['hechizo-linmar', 'hechizo-linchoc', 'hechizo-algver']);
    expect(new Set(ids).size).toBe(3);
  });
});
