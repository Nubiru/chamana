/**
 * Unit test — F-Telas-state-machine / G-13 / AC-1.
 *
 * Verifies the shape of the `estado` field added to collections/Telas.ts:
 *   - type: select
 *   - 5 enum values (disponible / por_agotarse / agotada / pedida / discontinuada)
 *   - Spanish labels match AC-3 (admin column renders labels, not values)
 *   - required: true
 *   - defaultValue: 'disponible'
 *   - index: true (admin filter performance)
 *   - admin.position: 'sidebar'
 *   - admin.description present (Spanish)
 *
 * Companion: telas-leadTimeDias-field.test.ts.
 */

import { Telas } from '@/collections/Telas';
import type { Field, SelectField } from 'payload';

function findField(name: string): Field | undefined {
  return (Telas.fields as Field[]).find(
    (f): f is Field & { name?: string } =>
      typeof (f as { name?: unknown }).name === 'string' && (f as { name: string }).name === name
  );
}

describe('Telas.estado — F-Telas-state-machine AC-1 field shape', () => {
  it('declares an `estado` field on the Telas collection', () => {
    const estado = findField('estado');
    expect(estado).toBeDefined();
  });

  it('estado is a select field', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.type).toBe('select');
  });

  it('estado is required (Cintia cannot leave it blank)', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.required).toBe(true);
  });

  it("estado.defaultValue is 'disponible' (legacy rows + new docs default here)", () => {
    const estado = findField('estado') as SelectField;
    expect(estado.defaultValue).toBe('disponible');
  });

  it('estado is indexed for admin filter performance (AC-4)', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.index).toBe(true);
  });

  it('estado.options contains exactly the 5 lifecycle values with Spanish labels', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.options).toEqual([
      { label: 'Disponible', value: 'disponible' },
      { label: 'Por agotarse', value: 'por_agotarse' },
      { label: 'Agotada', value: 'agotada' },
      { label: 'Pedida', value: 'pedida' },
      { label: 'Descontinuada', value: 'discontinuada' },
    ]);
  });

  it('estado.admin.position is sidebar (matches leadTimeDias for visual grouping)', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.admin?.position).toBe('sidebar');
  });

  it('estado.admin.description explains the field in Spanish for Cintia', () => {
    const estado = findField('estado') as SelectField;
    expect(typeof estado.admin?.description).toBe('string');
    expect((estado.admin?.description as string).length).toBeGreaterThan(0);
  });

  it("admin.defaultColumns includes 'estado' (AC-3 admin column shows in list view)", () => {
    expect(Telas.admin?.defaultColumns).toContain('estado');
  });
});
