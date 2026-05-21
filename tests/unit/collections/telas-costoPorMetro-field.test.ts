/**
 * Unit test — G-20 / ADR-003 §12 ERRATA-1 §7.1 (cost-source RENAME).
 *
 * Verifies the value-preserving RENAME of the Telas cost-source field
 * `precioPorMetro` → `costoPorMetro` on collections/Telas.ts:
 *   - `costoPorMetro` exists, type number, optional, min 0.
 *   - label is the cost-not-price relabel 'Costo por metro (ARS)'.
 *   - admin.description carries cost-not-price semantics (mentions "costo").
 *   - the OLD name `precioPorMetro` is fully gone (AC-4: zero dangling refs —
 *     the schema is the single referent per the CAND-10 §0 grep).
 *
 * Mirror of telas-leadTimeDias-field.test.ts (G-13) field-shape pattern.
 */

import { Telas } from '@/collections/Telas';
import type { Field, NumberField } from 'payload';

function findField(name: string): Field | undefined {
  // Inventory fields live inside a `row` group; flatten one level so the
  // row-nested `costoPorMetro` is reachable (mirrors the admin layout).
  const top = Telas.fields as Field[];
  const flat: Field[] = [];
  for (const f of top) {
    flat.push(f);
    const nested = (f as { fields?: Field[] }).fields;
    if (Array.isArray(nested)) flat.push(...nested);
  }
  return flat.find(
    (f): f is Field & { name?: string } =>
      typeof (f as { name?: unknown }).name === 'string' && (f as { name: string }).name === name
  );
}

describe('Telas.costoPorMetro — G-20 cost-source RENAME field shape', () => {
  it('declares a `costoPorMetro` field on the Telas collection', () => {
    expect(findField('costoPorMetro')).toBeDefined();
  });

  it('costoPorMetro is a number field', () => {
    const f = findField('costoPorMetro') as NumberField;
    expect(f.type).toBe('number');
  });

  it('costoPorMetro is optional (Cintia fills as she sources telas)', () => {
    const f = findField('costoPorMetro') as NumberField;
    expect(f.required).toBeFalsy();
  });

  it('costoPorMetro enforces non-negative lower bound (min=0)', () => {
    const f = findField('costoPorMetro') as NumberField;
    expect(f.min).toBe(0);
  });

  it("relabels to cost-not-price 'Costo por metro (ARS)' (ADR-003 §0)", () => {
    const f = findField('costoPorMetro') as NumberField;
    expect(f.label).toBe('Costo por metro (ARS)');
  });

  it('admin.description carries cost-not-price semantics in Spanish', () => {
    const f = findField('costoPorMetro') as NumberField;
    const desc = f.admin?.description;
    expect(typeof desc).toBe('string');
    expect((desc as string).toLowerCase()).toContain('costo');
  });

  it('the OLD `precioPorMetro` name is fully removed (AC-4 zero dangling)', () => {
    expect(findField('precioPorMetro')).toBeUndefined();
  });
});
