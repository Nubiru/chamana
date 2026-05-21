import type { ChamanaModel, Variante } from './types';

export function getMinPrice(variantes: Variante[]): number | null {
  const prices = variantes.map((v) => v.precio).filter((p): p is number => p != null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getMaxPrice(variantes: Variante[]): number | null {
  const prices = variantes.map((v) => v.precio).filter((p): p is number => p != null);
  return prices.length > 0 ? Math.max(...prices) : null;
}

export function hasPricing(model: ChamanaModel): boolean {
  return model.variantes.some((v) => v.precio != null);
}

export function calculateDiscount(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}
