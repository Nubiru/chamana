/**
 * Resilience test — F-Telas-state-machine / G-13.
 *
 * Payload's `select` field with required:true + a defined options list enforces
 * value membership at validation time. This test verifies that the Telas.estado
 * field declares ONLY the 5 valid lifecycle values — any future regression that
 * adds a stray option or drops a required one is caught here.
 *
 * State-transition validation (e.g., rejecting agotada→disponible without
 * passing through pedida) is OUT OF SCOPE — that lives in the G-14 hook spec
 * (AC-5 / AC-6 of F-Telas-state-machine). This file pins the *enum membership*
 * guarantee only — the structural floor below the state machine.
 */

import { Telas } from '@/collections/Telas';
import type { Field, SelectField } from 'payload';

function getEstadoField(): SelectField {
  return (Telas.fields as Field[]).find(
    (f): f is SelectField =>
      typeof (f as { name?: unknown }).name === 'string' &&
      (f as { name: string }).name === 'estado'
  ) as SelectField;
}

describe('resilience — Telas.estado enum membership is closed (G-13)', () => {
  it('estado options are exactly the 5 lifecycle values (no stray entry)', () => {
    const estado = getEstadoField();
    const values = (estado.options as Array<{ value: string }>).map((o) => o.value).sort();
    expect(values).toEqual(['agotada', 'discontinuada', 'disponible', 'pedida', 'por_agotarse']);
  });

  it('values like "bogus" / "" / "DISPONIBLE" are NOT in the enum (case-sensitive)', () => {
    const estado = getEstadoField();
    const values = (estado.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).not.toContain('bogus');
    expect(values).not.toContain('');
    expect(values).not.toContain('DISPONIBLE');
    expect(values).not.toContain('disponible ');
  });

  it("defaultValue 'disponible' is itself a member of the enum (self-consistency)", () => {
    const estado = getEstadoField();
    const values = (estado.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).toContain(estado.defaultValue);
  });
});
