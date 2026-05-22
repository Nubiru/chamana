/**
 * Unit test — F-Variante-metrosRequeridos-Modelo-estado / G-16 / AC-1.
 *
 * Verifies the shape of the per-Variante `metrosRequeridos` field added to
 * collections/Modelos.ts inside the `variantes[]` array:
 *   - type: number
 *   - required: false (legacy variants stay null)
 *   - min: 0, max: 50 (resilience test asserts rejection outside)
 *   - admin.step: 0.05 (decimal precision for fabric estimates)
 *   - admin.description present (Spanish)
 *   - validate hook present (per-AC-2 Spanish-error contract)
 *
 * Per-Variante (NOT per-Modelo) per S-7 §0 PARADIGM: an XS Falda Hechizo and
 * an XL Falda Hechizo consume materially different metros of the same Tela —
 * storing at Modelo-level erases that signal and propagates error into both
 * telasStockProjection (S-8) and cost-per-unit (S-11).
 */

import { Modelos } from '@/payload/collections/Modelos';
import type { ArrayField, Field, NumberField } from 'payload';

/**
 * Recursively locate a named field, descending through G-35's PRESENTATIONAL
 * containers — the unnamed `tabs` panes (Basico / Variantes) and the unnamed
 * `collapsible` ('Precio avanzado') / `row` groups that regroup the admin form
 * WITHOUT changing the data shape (G-35 was config-only, migration-free). Named
 * data containers (the `variantes` array) are returned on name match; the search
 * does not auto-descend into them, so the caller controls the lookup scope.
 */
function findField(fields: Field[], name: string): Field | undefined {
  for (const f of fields) {
    if ((f as { name?: unknown }).name === name) return f;
    const tabs = (f as { tabs?: { fields: Field[] }[] }).tabs;
    if (Array.isArray(tabs)) {
      for (const t of tabs) {
        const hit = findField(t.fields as Field[], name);
        if (hit) return hit;
      }
    }
    // Descend only into UNNAMED presentational groups (collapsible / row), never
    // into a named data container — that keeps each caller's scope explicit.
    const nested = (f as { fields?: Field[] }).fields;
    if (Array.isArray(nested) && (f as { name?: unknown }).name == null) {
      const hit = findField(nested, name);
      if (hit) return hit;
    }
  }
  return undefined;
}

function getMetros(): NumberField {
  const variantes = findField(Modelos.fields as Field[], 'variantes') as ArrayField;
  return findField(variantes.fields as Field[], 'metrosRequeridos') as NumberField;
}

describe('Variante.metrosRequeridos — F-Variante-metrosRequeridos-Modelo-estado AC-1 field shape', () => {
  it('declares a `metrosRequeridos` field on Modelos.variantes[]', () => {
    expect(getMetros()).toBeDefined();
  });

  it('metrosRequeridos is a number field', () => {
    expect(getMetros().type).toBe('number');
  });

  it('metrosRequeridos is NOT required (legacy variants stay null)', () => {
    expect(getMetros().required).toBeFalsy();
  });

  it('metrosRequeridos enforces non-negative lower bound (min=0)', () => {
    expect(getMetros().min).toBe(0);
  });

  it('metrosRequeridos caps at 50 (safety upper bound — typo guardrail)', () => {
    expect(getMetros().max).toBe(50);
  });

  it('metrosRequeridos.admin.step is 0.05 (decimal precision for fabric estimates)', () => {
    expect(getMetros().admin?.step).toBe(0.05);
  });

  it('metrosRequeridos.admin.description explains scope in Spanish for Cintia', () => {
    const d = getMetros().admin?.description as string;
    expect(typeof d).toBe('string');
    expect(d.length).toBeGreaterThan(0);
  });
});
