/**
 * Unit test — F-Variante-metrosRequeridos-Modelo-estado / G-16 / AC-3.
 *
 * Verifies the shape of the top-level `estado` field added to
 * collections/Modelos.ts:
 *   - type: select
 *   - 5 enum values (nueva / en_produccion / en_stock / sin_stock / descontinuada)
 *   - Spanish labels match S-7 AC-3 (admin column renders labels, not values)
 *   - required: true
 *   - defaultValue: 'nueva'
 *   - index: true (admin filter performance)
 *   - admin.position: 'sidebar'
 *   - admin.description present (Spanish)
 *   - admin.defaultColumns includes 'estado'
 *
 * Mirror of tests/unit/collections/telas-estado-field.test.ts (G-13). Third
 * manifestation of the collection-state-machine field-shape pattern.
 *
 * Companion: variante-metrosRequeridos-field.test.ts.
 */

import { Modelos } from '@/payload/collections/Modelos';
import type { Field, SelectField } from 'payload';

function findField(name: string): Field | undefined {
  return (Modelos.fields as Field[]).find(
    (f): f is Field & { name?: string } =>
      typeof (f as { name?: unknown }).name === 'string' && (f as { name: string }).name === name
  );
}

describe('Modelos.estado — F-Variante-metrosRequeridos-Modelo-estado AC-3 field shape', () => {
  it('declares an `estado` field on the Modelos collection', () => {
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

  it("estado.defaultValue is 'nueva' (legacy rows + new docs default here)", () => {
    const estado = findField('estado') as SelectField;
    expect(estado.defaultValue).toBe('nueva');
  });

  it('estado is indexed for admin filter performance', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.index).toBe(true);
  });

  it('estado.options contains exactly the 5 lifecycle values with Spanish labels', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.options).toEqual([
      { label: 'Nueva', value: 'nueva' },
      { label: 'En produccion', value: 'en_produccion' },
      { label: 'En stock', value: 'en_stock' },
      { label: 'Sin stock', value: 'sin_stock' },
      { label: 'Descontinuada', value: 'descontinuada' },
    ]);
  });

  it('estado.admin.position is sidebar (visual grouping with other lifecycle metadata)', () => {
    const estado = findField('estado') as SelectField;
    expect(estado.admin?.position).toBe('sidebar');
  });

  it('estado.admin.description explains the field in Spanish for Cintia', () => {
    const estado = findField('estado') as SelectField;
    expect(typeof estado.admin?.description).toBe('string');
    expect((estado.admin?.description as string).length).toBeGreaterThan(0);
  });

  it("admin.defaultColumns includes 'estado' (AC-3 admin column shows in list view)", () => {
    expect(Modelos.admin?.defaultColumns).toContain('estado');
  });
});
