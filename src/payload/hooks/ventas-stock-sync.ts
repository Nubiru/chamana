import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import type { VentaEstado } from '../../domain/sales/types.ts';

/**
 * F4 / H3 — atomic stock invariant.
 *
 * A Venta record represents a unit decrement on the linked Modelo's matching
 * variant. The hooks below enforce that invariant in code so Daniela performs
 * ONE write (saving the Venta), not two (Venta + manual Modelo edit).
 *
 * Semantics:
 *   consumesStock(estado) === estado !== 'cancelada'
 *   create  → if consumesStock, +1 on the new variant.
 *   update  → diff-aware: handles state flips AND variant/modelo swaps.
 *   delete  → if doc consumed stock, -1.
 *
 * The variant's `sinStock` flag is recomputed downstream by the
 * `autoStock` beforeChange hook on Modelos when this hook calls
 * `payload.update({ collection: 'modelos', ... })`.
 */

type VarianteShape = {
  varianteId?: string | null;
  stockTotal?: number | null;
  stockVendido?: number | null;
  [key: string]: unknown;
};

type ModeloRef = string | number | { id: string | number } | null | undefined;

/**
 * Minimal structural view of the Payload instance this hook touches.
 * Method syntax (bivariant params) keeps the `as` casts from the real Payload
 * type valid while still giving explicit argument/return shapes — the actual
 * purpose of biome's noBannedTypes rule (vs the opaque `Function` type).
 */
type PayloadLike = {
  findByID(args: { collection: string; id: string | number; depth?: number }): Promise<unknown>;
  update(args: {
    collection: string;
    id: string | number;
    data: Record<string, unknown>;
    depth?: number;
  }): Promise<unknown>;
};

function consumesStock(estado: unknown): boolean {
  return estado !== 'cancelada' && typeof estado === 'string' && estado.length > 0;
}

function extractModeloId(ref: ModeloRef): string | number | null {
  if (ref == null) return null;
  if (typeof ref === 'string' || typeof ref === 'number') return ref;
  if (typeof ref === 'object' && 'id' in ref && ref.id != null) return ref.id;
  return null;
}

function applyDelta(
  variantes: VarianteShape[],
  varianteId: string,
  delta: number
): VarianteShape[] {
  let found = false;
  const next = variantes.map((v) => {
    if (v && v.varianteId === varianteId) {
      found = true;
      const current = typeof v.stockVendido === 'number' ? v.stockVendido : 0;
      return { ...v, stockVendido: Math.max(0, current + delta) };
    }
    return v;
  });
  if (!found) {
    throw new Error(
      `Variante "${varianteId}" no encontrada en modelo. Verifica el ID de la variante (debe coincidir con una varianteId del Modelo).`
    );
  }
  return next;
}

async function adjustModeloVariant(
  payload: PayloadLike,
  modeloId: string | number,
  varianteId: string,
  delta: number
): Promise<void> {
  if (delta === 0) return;
  const modelo = (await payload.findByID({
    collection: 'modelos',
    id: modeloId,
    depth: 0,
  })) as { variantes?: VarianteShape[] } | null;
  if (!modelo) {
    throw new Error(`Modelo con id "${modeloId}" no encontrado.`);
  }
  const variantes = Array.isArray(modelo.variantes) ? modelo.variantes : [];
  const nextVariantes = applyDelta(variantes, varianteId, delta);
  await payload.update({
    collection: 'modelos',
    id: modeloId,
    data: { variantes: nextVariantes },
    depth: 0,
  });
}

export const ventasStockSync: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const payload = req?.payload as PayloadLike | undefined;
  if (!payload) return doc;

  const newModeloId = extractModeloId(doc?.modelo as ModeloRef);
  const newVarianteId = typeof doc?.variante === 'string' ? doc.variante : null;
  const newEstado = doc?.estado as VentaEstado | undefined;
  const newConsumes = consumesStock(newEstado);

  if (operation === 'create') {
    if (newConsumes && newModeloId != null && newVarianteId) {
      await adjustModeloVariant(payload, newModeloId, newVarianteId, +1);
    }
    return doc;
  }

  // operation === 'update'
  const oldModeloId = extractModeloId(previousDoc?.modelo as ModeloRef);
  const oldVarianteId = typeof previousDoc?.variante === 'string' ? previousDoc.variante : null;
  const oldEstado = previousDoc?.estado as VentaEstado | undefined;
  const oldConsumes = consumesStock(oldEstado);

  const sameTarget =
    oldModeloId != null &&
    newModeloId != null &&
    String(oldModeloId) === String(newModeloId) &&
    oldVarianteId === newVarianteId;

  if (sameTarget) {
    if (newModeloId == null || !newVarianteId) return doc;
    const delta = (newConsumes ? 1 : 0) - (oldConsumes ? 1 : 0);
    if (delta !== 0) {
      await adjustModeloVariant(payload, newModeloId, newVarianteId, delta);
    }
    return doc;
  }

  // Variant swap or modelo swap: restore old, charge new.
  if (oldConsumes && oldModeloId != null && oldVarianteId) {
    await adjustModeloVariant(payload, oldModeloId, oldVarianteId, -1);
  }
  if (newConsumes && newModeloId != null && newVarianteId) {
    await adjustModeloVariant(payload, newModeloId, newVarianteId, +1);
  }
  return doc;
};

export const ventasStockSyncDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const payload = req?.payload as PayloadLike | undefined;
  if (!payload) return;
  const modeloId = extractModeloId(doc?.modelo as ModeloRef);
  const varianteId = typeof doc?.variante === 'string' ? doc.variante : null;
  const estado = doc?.estado as VentaEstado | undefined;
  if (!consumesStock(estado)) return;
  if (modeloId == null || !varianteId) return;
  await adjustModeloVariant(payload, modeloId, varianteId, -1);
};
