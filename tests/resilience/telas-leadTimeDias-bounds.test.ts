/**
 * Resilience test — F-Telas-state-machine / G-13 / AC-2 bounds.
 *
 * Verifies Payload's number-field min/max guardrails are configured on
 * Telas.leadTimeDias so writes outside [0, 365] are rejected at validation
 * time. The hazard neutralized here is Cintia typing -5 or 5000 by accident
 * (decimal-typo, off-by-zero); Payload surfaces the violation in Spanish via
 * the field-label translation.
 */

import { Telas } from '@/payload/collections/Telas';
import type { Field, NumberField } from 'payload';

function getLead(): NumberField {
  return (Telas.fields as Field[]).find(
    (f): f is NumberField =>
      typeof (f as { name?: unknown }).name === 'string' &&
      (f as { name: string }).name === 'leadTimeDias'
  ) as NumberField;
}

describe('resilience — Telas.leadTimeDias bounds (G-13 AC-2)', () => {
  it('rejects negative lead times via min=0 constraint', () => {
    const f = getLead();
    expect(f.min).toBe(0);
    expect(f.min).toBeLessThanOrEqual(0);
  });

  it('caps at 365 days (Cintia-supplier reality + UX guardrail)', () => {
    const f = getLead();
    expect(f.max).toBe(365);
  });

  it('bounds are mutually consistent: min <= max', () => {
    const f = getLead();
    expect(f.min as number).toBeLessThanOrEqual(f.max as number);
  });
});
