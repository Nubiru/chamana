'use client';

import type { CartItem } from '@/lib/domain/sales';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type { CartItem } from '@/lib/domain/sales';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (varianteId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.varianteId === item.varianteId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.varianteId === item.varianteId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (varianteId) => {
        set((state) => ({
          items: state.items.filter((item) => item.varianteId !== varianteId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getTotal: () => {
        const { items } = get();
        if (items.length === 0) return 0;
        if (items.some((item) => item.precio == null)) return null;
        return items.reduce((sum, item) => sum + (item.precio ?? 0) * item.quantity, 0);
      },
    }),
    {
      name: 'chamana-cart',
    }
  )
);
