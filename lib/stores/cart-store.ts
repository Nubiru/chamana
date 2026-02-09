'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  modelSlug: string;
  modelNombre: string;
  modelTipo: string;
  varianteId: string;
  tela1Desc: string;
  tela2Desc?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (varianteId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
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
    }),
    {
      name: 'chamana-cart',
    }
  )
);
