/**
 * Unit tests for lib/payload/hooks/auto-slug.ts
 *
 * autoSlug is a higher-order function: autoSlug(sourceField) returns a FieldHook.
 * We call the returned hook with mock { data, value } objects.
 */

import { autoSlug } from '@/lib/payload/hooks/auto-slug';

describe('autoSlug hook', () => {
  const hook = autoSlug('nombre');

  // Helper to invoke the hook with mock args
  function callHook(value: unknown, data: Record<string, unknown> | undefined) {
    return (hook as (args: Record<string, unknown>) => unknown)({ value, data });
  }

  // ── Returns existing value unchanged ──

  it('returns existing value unchanged when value is a non-empty string', () => {
    const result = callHook('existing-slug', { nombre: 'Intuicion' });
    expect(result).toBe('existing-slug');
  });

  it('returns existing value unchanged when value is truthy (number)', () => {
    const result = callHook(42, { nombre: 'Something' });
    expect(result).toBe(42);
  });

  // ── Generates slug from source field ──

  it('generates slug from source field when value is falsy (undefined)', () => {
    const result = callHook(undefined, { nombre: 'Mi Nombre' });
    expect(result).toBe('mi-nombre');
  });

  it('generates slug from source field when value is empty string', () => {
    const result = callHook('', { nombre: 'Hola Mundo' });
    expect(result).toBe('hola-mundo');
  });

  it('generates slug from source field when value is null', () => {
    const result = callHook(null, { nombre: 'Test Name' });
    expect(result).toBe('test-name');
  });

  // ── Handles accented characters ──

  it('removes accents from Spanish characters (Intuicion)', () => {
    const result = callHook(undefined, { nombre: 'Intuición' });
    expect(result).toBe('intuicion');
  });

  it('removes accents from multiple accented characters', () => {
    const result = callHook(undefined, { nombre: 'Día de Señoría' });
    expect(result).toBe('dia-de-senoria');
  });

  it('handles ñ character', () => {
    const result = callHook(undefined, { nombre: 'Año Nuevo' });
    expect(result).toBe('ano-nuevo');
  });

  it('handles umlauts and other diacritics', () => {
    const result = callHook(undefined, { nombre: 'Über Café' });
    expect(result).toBe('uber-cafe');
  });

  // ── Slug formatting ──

  it('replaces spaces and special characters with hyphens', () => {
    const result = callHook(undefined, { nombre: 'Luz & Sombra!' });
    expect(result).toBe('luz-sombra');
  });

  it('trims leading and trailing hyphens', () => {
    const result = callHook(undefined, { nombre: '---Test---' });
    expect(result).toBe('test');
  });

  it('collapses multiple consecutive special characters into single hyphen', () => {
    const result = callHook(undefined, { nombre: 'A   B   C' });
    expect(result).toBe('a-b-c');
  });

  it('converts uppercase to lowercase', () => {
    const result = callHook(undefined, { nombre: 'CHAMANA' });
    expect(result).toBe('chamana');
  });

  // ── Returns value when source field is missing/empty/non-string ──

  it('returns undefined when source field is empty string', () => {
    const result = callHook(undefined, { nombre: '' });
    expect(result).toBeUndefined();
  });

  it('returns undefined when source field is missing from data', () => {
    const result = callHook(undefined, { otherField: 'value' });
    expect(result).toBeUndefined();
  });

  it('returns undefined when data is undefined', () => {
    const result = callHook(undefined, undefined);
    expect(result).toBeUndefined();
  });

  it('returns value when source field is a number (non-string)', () => {
    const result = callHook(undefined, { nombre: 123 });
    expect(result).toBeUndefined();
  });

  it('returns value when source field is null', () => {
    const result = callHook(undefined, { nombre: null });
    expect(result).toBeUndefined();
  });

  // ── Uses correct sourceField parameter ──

  it('uses the correct sourceField parameter (titulo instead of nombre)', () => {
    const hookTitulo = autoSlug('titulo');
    const result = (hookTitulo as (args: Record<string, unknown>) => unknown)({
      value: undefined,
      data: { titulo: 'Mi Titulo', nombre: 'Should Not Use This' },
    });
    expect(result).toBe('mi-titulo');
  });

  it('ignores other fields when sourceField is specified', () => {
    const result = callHook(undefined, { titulo: 'Should Not Use This' });
    expect(result).toBeUndefined();
  });
});
