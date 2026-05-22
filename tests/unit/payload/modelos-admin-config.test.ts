/**
 * Unit test — G-35 / O-16 (admin native-config QoL for Daniela).
 *
 * Guards the Payload-NATIVE admin field-config split O-16 §4(a) prescribed for the
 * heavy Modelos form. Two things this test makes structural (not a hope):
 *
 *   1. DATA-TRUTH footgun closure (AC-1, the #1 cheap win): `stockVendido` and
 *      `sinStock` are hook-managed (ventasStockSync writes `current + delta`;
 *      autoStock recomputes sinStock from stockVendido >= stockTotal). They MUST be
 *      `admin.readOnly` so a hand-edit can never become the sync hook's new
 *      arithmetic base → silent stock drift. This test catches a future regression
 *      that re-exposes either field to hand-edits.
 *
 *   2. Form-lightening structure (AC-2): the 23-field form is split into UNNAMED
 *      tabs ("Basico" / "Variantes") + an UNNAMED "Precio avanzado" collapsible.
 *      Unnamed → presentational only → the field names/data shape are unchanged
 *      (no schema change, no migration). The test asserts the grouping is present
 *      AND that it did not nest/rename any data field (the migration-free invariant).
 *
 * Only the two hook-managed fields change editability (AC-1: "No other field's
 * editability changed") — guarded here by asserting stockTotal stays editable.
 */

import { Modelos } from '@/payload/collections/Modelos';
import type { Field } from 'payload';

type NamedField = Field & { name: string; admin?: { readOnly?: boolean; description?: unknown } };

function hasName(f: Field): f is NamedField {
  return typeof (f as { name?: unknown }).name === 'string';
}

/** Recursively collect every field, descending through tabs / collapsible / row / array / group. */
function collectFields(fields: Field[]): Field[] {
  const out: Field[] = [];
  for (const f of fields) {
    out.push(f);
    const tabs = (f as { tabs?: { fields: Field[] }[] }).tabs;
    if (Array.isArray(tabs)) {
      for (const t of tabs) out.push(...collectFields(t.fields));
    }
    const nested = (f as { fields?: Field[] }).fields;
    if (Array.isArray(nested)) out.push(...collectFields(nested));
  }
  return out;
}

const topFields = Modelos.fields as Field[];
const allFields = collectFields(topFields);

function findNamed(name: string): NamedField | undefined {
  return allFields.filter(hasName).find((f) => f.name === name);
}

describe('Modelos admin config — G-35 / O-16 DATA-TRUTH footgun (readOnly hook-managed fields)', () => {
  it('stockVendido is admin.readOnly (hand-edit cannot desync the sync hook arithmetic base)', () => {
    const f = findNamed('stockVendido');
    expect(f).toBeDefined();
    expect(f?.admin?.readOnly).toBe(true);
  });

  it('sinStock is admin.readOnly (cannot be hand-toggled out of sync with the computed truth)', () => {
    const f = findNamed('sinStock');
    expect(f).toBeDefined();
    expect(f?.admin?.readOnly).toBe(true);
  });

  it('stockVendido description names the owning hook (ventasStockSync) so the readOnly is self-explaining', () => {
    const f = findNamed('stockVendido');
    expect(f).toBeDefined();
    expect(String(f?.admin?.description)).toContain('ventasStockSync');
  });

  it('sinStock description names the owning hook (autoStock)', () => {
    const f = findNamed('sinStock');
    expect(f).toBeDefined();
    expect(String(f?.admin?.description)).toContain('autoStock');
  });

  it('only the two hook-managed fields change editability — stockTotal stays editable', () => {
    const f = findNamed('stockTotal');
    expect(f).toBeDefined();
    expect(f?.admin?.readOnly).not.toBe(true);
  });
});

describe('Modelos admin config — G-35 / O-16 form-lightening (native tabs + collapsible)', () => {
  it('the top-level form is split into a tabs field', () => {
    const tabsField = topFields.find((f) => f.type === 'tabs');
    expect(tabsField).toBeDefined();
  });

  it('the tabs are "Basico" and "Variantes"', () => {
    const tabsField = topFields.find((f) => f.type === 'tabs');
    const tabs = (tabsField as { tabs?: { label?: string }[] } | undefined)?.tabs ?? [];
    const labels = tabs.map((t) => t.label);
    expect(labels).toContain('Basico');
    expect(labels).toContain('Variantes');
  });

  it('the tabs are UNNAMED (presentational) so the DB data shape is unchanged (no migration)', () => {
    const tabsField = topFields.find((f) => f.type === 'tabs');
    const tabs = (tabsField as { tabs?: { name?: string }[] } | undefined)?.tabs ?? [];
    expect(tabs.length).toBeGreaterThan(0);
    for (const t of tabs) expect(t.name).toBeUndefined();
  });

  it('a "Precio avanzado" collapsible groups the rarely-touched price/costing fields', () => {
    const collapsible = allFields.find(
      (f) => f.type === 'collapsible' && (f as { label?: string }).label === 'Precio avanzado'
    );
    expect(collapsible).toBeDefined();
  });
});

describe('Modelos admin config — G-35 data-shape invariance (no field added/removed/renamed)', () => {
  // The regroup is pure native config: every named field that existed before MUST
  // still resolve (now nested under tabs/collapsible) — guards AC-2's "no schema change".
  const expectedNamed = [
    'nombre',
    'slug',
    'tipo',
    'detalle',
    'descripcion',
    'imagenes',
    'variantes',
    'varianteId',
    'tela1',
    'tela2',
    'precio',
    'precioAnterior',
    'descuento',
    'metrosRequeridos',
    'stockTotal',
    'stockVendido',
    'sinStock',
    'badge',
    'featured',
    'estado',
    'coleccion',
    'bundleId',
  ];

  it.each(expectedNamed)('field "%s" still resolves after the regroup', (name) => {
    expect(findNamed(name)).toBeDefined();
  });

  it('the sidebar fields stay at the top level (Payload only honors position:sidebar there)', () => {
    const sidebarNames = ['slug', 'badge', 'featured', 'estado', 'coleccion', 'bundleId'];
    const topNamed = topFields.filter(hasName).map((f) => f.name);
    for (const name of sidebarNames) expect(topNamed).toContain(name);
  });
});
