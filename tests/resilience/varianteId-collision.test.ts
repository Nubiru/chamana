/**
 * Resilience test — F3 / G-7 / AC-3.
 *
 * Pins the contract that `autoVarianteId` produces a deterministic and
 * collision-resistant ID. Two distinct variants on the same Modelo
 * (different tela1/tela2 combos) must NEVER produce the same generated ID.
 * Two distinct Modelos that happen to share a (slug, telas) shape SHOULD
 * collide — and that is correct, because that is the cart-lookup key
 * Cintia's catalog promises (one canonical ID per slug+telas tuple).
 *
 * Reads the hook through the wired path on `collections/Modelos.ts` so
 * any future re-wiring (e.g. moving from beforeValidate to beforeChange)
 * is caught.
 */

import { Modelos } from '@/payload/collections/Modelos';
import type { CollectionConfig, Field } from 'payload';

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
  if (!variantes || variantes.type !== 'array') throw new Error('variantes array field not found');
  const varianteId = findField(variantes.fields, 'varianteId');
  if (!varianteId || varianteId.type !== 'text') throw new Error('varianteId text field not found');
  const hook = varianteId.hooks?.beforeValidate?.[0];
  if (!hook) throw new Error('autoVarianteId not wired');
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

async function gen(
  hook: any,
  slug: string,
  siblingData: Record<string, unknown>,
  byId: Record<string, { codigo: string }>
) {
  const req = mockReq(byId);
  return hook({
    value: undefined,
    siblingData,
    data: { slug },
    req,
  });
}

describe('autoVarianteId resilience — AC-3 collision-shape contract', () => {
  it('AC-3: 4 distinct tela1-only variants on one Modelo produce 4 distinct IDs', async () => {
    const hook = getVarianteIdHook(Modelos);
    const byId = {
      t1: { codigo: 'LinMar' },
      t2: { codigo: 'LinChoc' },
      t3: { codigo: 'AlgVer' },
      t4: { codigo: 'RibNeg' },
    };
    const ids = await Promise.all([
      gen(hook, 'hechizo', { tela1: 't1' }, byId),
      gen(hook, 'hechizo', { tela1: 't2' }, byId),
      gen(hook, 'hechizo', { tela1: 't3' }, byId),
      gen(hook, 'hechizo', { tela1: 't4' }, byId),
    ]);
    expect(new Set(ids).size).toBe(4);
  });

  it('AC-3: reversible variants with swapped tela1/tela2 produce DISTINCT IDs (order is semantic — lado A vs lado B)', async () => {
    const hook = getVarianteIdHook(Modelos);
    const byId = {
      a: { codigo: 'LinMar' },
      b: { codigo: 'AlgVer' },
    };
    const ab = await gen(hook, 'espejo', { tela1: 'a', tela2: 'b' }, byId);
    const ba = await gen(hook, 'espejo', { tela1: 'b', tela2: 'a' }, byId);
    expect(ab).toBe('espejo-linmar-algver');
    expect(ba).toBe('espejo-algver-linmar');
    expect(ab).not.toBe(ba);
  });

  it('AC-3: mixing single-tela and two-tela variants on one Modelo: each shape gets a unique ID', async () => {
    const hook = getVarianteIdHook(Modelos);
    const byId = {
      a: { codigo: 'LinMar' },
      b: { codigo: 'AlgVer' },
    };
    const single = await gen(hook, 'hechizo', { tela1: 'a' }, byId);
    const reversible = await gen(hook, 'hechizo', { tela1: 'a', tela2: 'b' }, byId);
    expect(single).toBe('hechizo-linmar');
    expect(reversible).toBe('hechizo-linmar-algver');
    expect(single).not.toBe(reversible);
  });

  it('AC-3: deterministic — identical (slug, tela1, tela2) input across calls yields the same ID', async () => {
    const hook = getVarianteIdHook(Modelos);
    const byId = { a: { codigo: 'LinMar' }, b: { codigo: 'AlgVer' } };
    const first = await gen(hook, 'sabia', { tela1: 'a', tela2: 'b' }, byId);
    const second = await gen(hook, 'sabia', { tela1: 'a', tela2: 'b' }, byId);
    expect(first).toBe(second);
    expect(first).toBe('sabia-linmar-algver');
  });

  it('AC-3: two different Modelos (different slugs) with same tela combo produce DIFFERENT IDs (slug namespaces the cart key)', async () => {
    const hook = getVarianteIdHook(Modelos);
    const byId = { a: { codigo: 'LinMar' } };
    const hechizo = await gen(hook, 'hechizo', { tela1: 'a' }, byId);
    const sabia = await gen(hook, 'sabia', { tela1: 'a' }, byId);
    expect(hechizo).not.toBe(sabia);
    expect(hechizo).toBe('hechizo-linmar');
    expect(sabia).toBe('sabia-linmar');
  });

  it('AC-3: tela codigo with mixed case is normalized to lowercase (case collisions impossible)', async () => {
    const hook = getVarianteIdHook(Modelos);
    const byId = { a: { codigo: 'LinMar' }, b: { codigo: 'linmar' } };
    const upper = await gen(hook, 'hechizo', { tela1: 'a' }, byId);
    const lower = await gen(hook, 'hechizo', { tela1: 'b' }, byId);
    expect(upper).toBe(lower);
    expect(upper).toBe('hechizo-linmar');
  });
});
