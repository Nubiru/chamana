/**
 * Integration test — F4 / H3 / AC-1 + AC-2.
 *
 * Composes:
 *   - ventasStockSync (afterChange) — increments variant.stockVendido
 *   - autoStock      (beforeChange on Modelos) — recomputes sinStock
 *
 * Strategy: simulate the Payload pipeline by chaining the two hooks against
 * an in-memory Modelo store. This is integration-level (two production
 * modules composed end-to-end) without booting a real Payload+SQLite
 * instance — see G-10-REPORT.md "Integration test fidelity" for the trade.
 *
 * Acceptance:
 *   AC-1: Create 1 Venta against stockTotal=5 → variant.stockVendido === 1
 *   AC-2: 5 successive Ventas on stockTotal=5 → final variant.sinStock === true
 */

import { autoStock } from '@/lib/payload/hooks/auto-stock';
import { ventasStockSync } from '@/lib/payload/hooks/ventas-stock-sync';

type Variante = {
  varianteId: string;
  stockTotal?: number;
  stockVendido?: number;
  sinStock?: boolean;
};

type Modelo = { id: string; variantes: Variante[] };

function buildEnv() {
  const modelos: Record<string, Modelo> = {
    'modelo-hechizo': {
      id: 'modelo-hechizo',
      variantes: [
        {
          varianteId: 'hechizo-linmarmalv',
          stockTotal: 5,
          stockVendido: 0,
          sinStock: false,
        },
      ],
    },
  };

  // Mock Payload that runs autoStock as part of every Modelo update —
  // mirrors the Modelos collection's beforeChange wiring.
  const payload = {
    findByID: async ({ id }: { id: string }) => modelos[id] ?? null,
    update: async ({ id, data }: { id: string; data: { variantes: Variante[] } }) => {
      const recomputed = (autoStock as (a: Record<string, unknown>) => Record<string, unknown>)({
        data: { variantes: data.variantes },
        collection: {} as unknown,
        context: {} as unknown,
        operation: 'update',
        originalDoc: {} as unknown,
        req: {} as unknown,
      });
      modelos[id] = {
        ...modelos[id],
        variantes: (recomputed.variantes as Variante[]) ?? data.variantes,
      };
      return modelos[id];
    },
  };

  async function createVenta(args: {
    modelo: string;
    variante: string;
    estado?: string;
  }) {
    await (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
      operation: 'create',
      doc: { modelo: args.modelo, variante: args.variante, estado: args.estado ?? 'pendiente' },
      previousDoc: {},
      req: { payload },
      collection: {} as unknown,
      context: {} as unknown,
    });
  }

  return { modelos, payload, createVenta };
}

describe('integration — ventas-stock-decrement (AC-1 + AC-2)', () => {
  it('AC-1: create 1 Venta → variant.stockVendido === 1', async () => {
    const env = buildEnv();
    await env.createVenta({ modelo: 'modelo-hechizo', variante: 'hechizo-linmarmalv' });
    const v = env.modelos['modelo-hechizo'].variantes[0];
    expect(v.stockVendido).toBe(1);
    expect(v.sinStock).toBe(false); // not exhausted yet
  });

  it('AC-2: 5 successive Ventas on stockTotal=5 → sinStock flips to true', async () => {
    const env = buildEnv();
    for (let i = 0; i < 5; i += 1) {
      await env.createVenta({ modelo: 'modelo-hechizo', variante: 'hechizo-linmarmalv' });
    }
    const v = env.modelos['modelo-hechizo'].variantes[0];
    expect(v.stockVendido).toBe(5);
    expect(v.sinStock).toBe(true);
  });

  it('intermediate states: after 3 ventas, stockVendido=3 and sinStock still false', async () => {
    const env = buildEnv();
    for (let i = 0; i < 3; i += 1) {
      await env.createVenta({ modelo: 'modelo-hechizo', variante: 'hechizo-linmarmalv' });
    }
    const v = env.modelos['modelo-hechizo'].variantes[0];
    expect(v.stockVendido).toBe(3);
    expect(v.sinStock).toBe(false);
  });
});
