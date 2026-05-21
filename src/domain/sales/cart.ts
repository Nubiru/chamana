import type { CartItem } from './types';

export function computeCartTotal(items: CartItem[]): number | null {
  if (items.length === 0) return 0;
  if (items.some((item) => item.precio == null)) return null;
  return items.reduce((sum, item) => sum + (item.precio ?? 0) * item.quantity, 0);
}

export function computeItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
