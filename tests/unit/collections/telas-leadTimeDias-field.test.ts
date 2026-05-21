/**
 * Unit test — F-Telas-state-machine / G-13 / AC-2.
 *
 * Verifies the shape of the `leadTimeDias` field added to collections/Telas.ts:
 *   - type: number
 *   - required: false (only relevant when estado='pedida')
 *   - min: 0, max: 365 (resilience test asserts rejection outside)
 *   - admin.step: 1 (integer days)
 *   - admin.description present (Spanish)
 *
 * Companion: telas-estado-field.test.ts.
 */

import { Telas } from '@/payload/collections/Telas';
import type { Field, NumberField } from 'payload';

function findField(name: string): Field | undefined {
  return (Telas.fields as Field[]).find(
    (f): f is Field & { name?: string } =>
      typeof (f as { name?: unknown }).name === 'string' && (f as { name: string }).name === name
  );
}

describe('Telas.leadTimeDias — F-Telas-state-machine AC-2 field shape', () => {
  it('declares a `leadTimeDias` field on the Telas collection', () => {
    expect(findField('leadTimeDias')).toBeDefined();
  });

  it('leadTimeDias is a number field', () => {
    const f = findField('leadTimeDias') as NumberField;
    expect(f.type).toBe('number');
  });

  it('leadTimeDias is NOT required (only relevant when estado=pedida)', () => {
    const f = findField('leadTimeDias') as NumberField;
    expect(f.required).toBeFalsy();
  });

  it('leadTimeDias enforces non-negative lower bound (min=0)', () => {
    const f = findField('leadTimeDias') as NumberField;
    expect(f.min).toBe(0);
  });

  it('leadTimeDias caps at 365 days (one year supplier max — UX guardrail)', () => {
    const f = findField('leadTimeDias') as NumberField;
    expect(f.max).toBe(365);
  });

  it('leadTimeDias.admin.step is 1 (integer days, no fractions)', () => {
    const f = findField('leadTimeDias') as NumberField;
    expect(f.admin?.step).toBe(1);
  });

  it('leadTimeDias.admin.description explains scope in Spanish for Cintia', () => {
    const f = findField('leadTimeDias') as NumberField;
    expect(typeof f.admin?.description).toBe('string');
    expect((f.admin?.description as string).length).toBeGreaterThan(0);
  });
});
