/**
 * Unit test — G-41 / F-storefront-freshness AC-6 #3 (wiring).
 *
 * Asserts the on-mutation revalidation hook is wired exactly where ADR-014's
 * trigger map says — and, critically, NOT where it must not be:
 *   - Modelos / Colecciones / Eventos / Telas carry a revalidate hook in BOTH
 *     afterChange and afterDelete;
 *   - the 5 storefront-feeding globals carry one in afterChange (globals have no delete);
 *   - Modelos still has beforeChange: [autoStock, modelosStateMachine] (NO regression —
 *     the new hooks must not have displaced the stock/state-machine wiring);
 *   - Ventas carries NO revalidate hook (cascade-by-design: ventasStockSync updates
 *     Modelos → the Modelos hook fires; a Ventas hook would be redundant).
 *
 * `isRevalidateHook` recognises factory-made hooks by the marker the factory stamps,
 * so "Ventas has none" is a real structural assertion (G26), not a length guess.
 */

import { Colecciones } from '@/payload/collections/Colecciones';
import { Eventos } from '@/payload/collections/Eventos';
import { Modelos } from '@/payload/collections/Modelos';
import { Telas } from '@/payload/collections/Telas';
import { Ventas } from '@/payload/collections/Ventas';
import { ConfiguracionSitio } from '@/payload/globals/ConfiguracionSitio';
import { ContenidoInicio } from '@/payload/globals/ContenidoInicio';
import { Garantias } from '@/payload/globals/Garantias';
import { GuiaTalles } from '@/payload/globals/GuiaTalles';
import { PreguntasFrecuentes } from '@/payload/globals/PreguntasFrecuentes';
import { autoStock } from '@/payload/hooks/auto-stock';
import { modelosStateMachine } from '@/payload/hooks/modelos-state-machine';
import { isRevalidateHook } from '@/payload/hooks/revalidate-storefront';
import type { CollectionConfig, GlobalConfig } from 'payload';

function afterChange(c: CollectionConfig | GlobalConfig): unknown[] {
  return (c.hooks?.afterChange as unknown[]) ?? [];
}
function afterDelete(c: CollectionConfig): unknown[] {
  return (c.hooks?.afterDelete as unknown[]) ?? [];
}

const WIRED_COLLECTIONS: Array<{ name: string; config: CollectionConfig }> = [
  { name: 'Modelos', config: Modelos },
  { name: 'Colecciones', config: Colecciones },
  { name: 'Eventos', config: Eventos },
  { name: 'Telas', config: Telas },
];

const WIRED_GLOBALS: Array<{ name: string; config: GlobalConfig }> = [
  { name: 'ConfiguracionSitio', config: ConfiguracionSitio },
  { name: 'ContenidoInicio', config: ContenidoInicio },
  { name: 'PreguntasFrecuentes', config: PreguntasFrecuentes },
  { name: 'Garantias', config: Garantias },
  { name: 'GuiaTalles', config: GuiaTalles },
];

describe('storefront revalidate wiring — G-41 / F-storefront-freshness AC-3', () => {
  it.each(WIRED_COLLECTIONS)('$name registers a revalidate hook in afterChange', ({ config }) => {
    expect(afterChange(config).some(isRevalidateHook)).toBe(true);
  });

  it.each(WIRED_COLLECTIONS)('$name registers a revalidate hook in afterDelete', ({ config }) => {
    expect(afterDelete(config).some(isRevalidateHook)).toBe(true);
  });
});

describe('storefront revalidate wiring — G-41 / F-storefront-freshness AC-4 (globals)', () => {
  it.each(WIRED_GLOBALS)('$name registers a revalidate hook in afterChange', ({ config }) => {
    expect(afterChange(config).some(isRevalidateHook)).toBe(true);
  });
});

describe('storefront revalidate wiring — G-41 no-regression / cascade-by-design', () => {
  it('Modelos still has beforeChange: [autoStock, modelosStateMachine] (no regression)', () => {
    const beforeChange = (Modelos.hooks?.beforeChange as unknown[]) ?? [];
    expect(beforeChange).toContain(autoStock);
    expect(beforeChange).toContain(modelosStateMachine);
    expect(beforeChange).toHaveLength(2);
  });

  it('Ventas carries NO revalidate hook (cascade-by-design via the Modelos hook)', () => {
    expect(afterChange(Ventas).some(isRevalidateHook)).toBe(false);
    expect(afterDelete(Ventas).some(isRevalidateHook)).toBe(false);
  });

  it('Ventas still has its stock-sync hooks (the cascade source is intact)', () => {
    expect(afterChange(Ventas)).toHaveLength(1);
    expect(afterDelete(Ventas)).toHaveLength(1);
  });
});
