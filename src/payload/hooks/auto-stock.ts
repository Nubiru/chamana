import type { CollectionBeforeChangeHook } from 'payload';

export const autoStock: CollectionBeforeChangeHook = ({ data }) => {
  if (data.variantes && Array.isArray(data.variantes)) {
    data.variantes = data.variantes.map((v: Record<string, unknown>) => ({
      ...v,
      sinStock:
        ((v.stockVendido as number) || 0) >= ((v.stockTotal as number) || 0) &&
        ((v.stockTotal as number) || 0) > 0,
    }));
  }
  return data;
};
