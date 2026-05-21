/**
 * Resilience test — F-Variante-metrosRequeridos-Modelo-estado / G-16.
 *
 * Payload's `select` field with required:true + a defined options list enforces
 * value membership at validation time. This test verifies that the
 * Modelos.estado field declares ONLY the 5 valid lifecycle values — any future
 * regression that adds a stray option or drops a required one is caught here.
 *
 * State-transition validation (e.g., rejecting nueva→en_stock without passing
 * through en_produccion) is OUT OF SCOPE — that lives in the G-N+1 hook task
 * (AC-5 / AC-6 of the spec). This file pins the *enum membership* guarantee
 * only — the structural floor below the state machine.
 *
 * Mirror of tests/resilience/telas-invalid-estado-rejected.test.ts (G-13).
 */

import { Modelos } from '@/collections/Modelos';
import type { Field, SelectField } from 'payload';

function getEstadoField(): SelectField {
  return (Modelos.fields as Field[]).find(
    (f): f is SelectField =>
      typeof (f as { name?: unknown }).name === 'string' &&
      (f as { name: string }).name === 'estado'
  ) as SelectField;
}

describe('resilience — Modelos.estado enum membership is closed (G-16)', () => {
  it('estado options are exactly the 5 lifecycle values (no stray entry)', () => {
    const estado = getEstadoField();
    const values = (estado.options as Array<{ value: string }>).map((o) => o.value).sort();
    expect(values).toEqual(['descontinuada', 'en_produccion', 'en_stock', 'nueva', 'sin_stock']);
  });

  it('values like "bogus" / "" / "NUEVA" are NOT in the enum (case-sensitive)', () => {
    const estado = getEstadoField();
    const values = (estado.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).not.toContain('bogus');
    expect(values).not.toContain('');
    expect(values).not.toContain('NUEVA');
    expect(values).not.toContain('nueva ');
  });

  it("defaultValue 'nueva' is itself a member of the enum (self-consistency)", () => {
    const estado = getEstadoField();
    const values = (estado.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).toContain(estado.defaultValue);
  });
});
