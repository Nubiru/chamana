/**
 * Resilience test — F-Variante-metrosRequeridos-Modelo-estado / G-16 / AC-2 + AC-7.
 *
 * Verifies that the per-Variante `metrosRequeridos` validate hook on
 * collections/Modelos.ts enforces the spec's Spanish-error contract:
 *   - null → true (campo opcional; legacy variantes stay null)
 *   - 0 → true (caso regalo / intercambio)
 *   - 50 → true (boundary OK)
 *   - 1.25 → true (typical fabric estimate)
 *   - -0.1 → 'metros requeridos no puede ser negativo'
 *   - 50.1 → 'metros requeridos no puede superar 50 (limite de seguridad)'
 *
 * Pins the AC-2 acceptance: hazard neutralized is Cintia typing -1.5 (sign
 * error) or 500 (decimal-typo / forgot dot). Payload surfaces the validate
 * return string in Cintia's UI.
 */

import { Modelos } from '@/payload/collections/Modelos';
import type { ArrayField, Field, NumberField } from 'payload';

type ValidateFn = (value: number | null | undefined) => true | string;

function getValidate(): ValidateFn {
  const variantes = (Modelos.fields as Field[]).find(
    (f): f is ArrayField =>
      typeof (f as { name?: unknown }).name === 'string' &&
      (f as { name: string }).name === 'variantes'
  ) as ArrayField;
  const metros = (variantes.fields as Field[]).find(
    (f): f is NumberField =>
      typeof (f as { name?: unknown }).name === 'string' &&
      (f as { name: string }).name === 'metrosRequeridos'
  ) as NumberField;
  return metros.validate as unknown as ValidateFn;
}

describe('resilience — Variante.metrosRequeridos bounds (G-16 AC-2)', () => {
  it('null passes — field is optional for legacy variants', () => {
    expect(getValidate()(null)).toBe(true);
  });

  it('undefined passes — same as null', () => {
    expect(getValidate()(undefined)).toBe(true);
  });

  it('0 passes — caso regalo / intercambio sin consumo de tela', () => {
    expect(getValidate()(0)).toBe(true);
  });

  it('1.25 (typical fabric estimate) passes', () => {
    expect(getValidate()(1.25)).toBe(true);
  });

  it('boundary 50 passes (upper bound inclusive)', () => {
    expect(getValidate()(50)).toBe(true);
  });

  it('-0.1 returns the Spanish negative-error message verbatim', () => {
    expect(getValidate()(-0.1)).toBe('metros requeridos no puede ser negativo');
  });

  it('50.1 returns the Spanish over-50 message verbatim', () => {
    expect(getValidate()(50.1)).toBe('metros requeridos no puede superar 50 (limite de seguridad)');
  });
});
