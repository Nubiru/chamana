import { useCartStore } from '@/lib/stores/cart-store';
import { act } from '@testing-library/react';

beforeEach(() => {
  act(() => {
    useCartStore.getState().clearCart();
  });
});

const baseItem = {
  modelSlug: 'intuicion',
  modelNombre: 'Intuicion',
  modelTipo: 'Vestido',
  varianteId: 'intuicion-gabsalnat',
  tela1Desc: 'Gabardina Salvia Natural',
};

describe('cart store edge cases', () => {
  describe('addItem edge cases', () => {
    it('adding same varianteId 10 times increments quantity to 10', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useCartStore.getState().addItem(baseItem);
        }
      });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(10);
    });

    it('adding item with precio=0 treats zero as valid price', () => {
      act(() => {
        useCartStore.getState().addItem({ ...baseItem, precio: 0 });
      });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].precio).toBe(0);
      expect(items[0].precio).not.toBeUndefined();
    });

    it('adding item with tela2Desc preserves second fabric', () => {
      act(() => {
        useCartStore.getState().addItem({
          ...baseItem,
          varianteId: 'intuicion-gabsal-linmen',
          tela2Desc: 'Lino Men Natural',
        });
      });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].tela1Desc).toBe('Gabardina Salvia Natural');
      expect(items[0].tela2Desc).toBe('Lino Men Natural');
    });

    it('adding item with modelImageUrl preserves it', () => {
      const imageUrl = '/images/models/intuicion/intuicion-gabsalnat.webp';
      act(() => {
        useCartStore.getState().addItem({
          ...baseItem,
          modelImageUrl: imageUrl,
        });
      });

      const { items } = useCartStore.getState();
      expect(items[0].modelImageUrl).toBe(imageUrl);
    });
  });

  describe('removeItem edge cases', () => {
    it('removing from empty cart does not throw', () => {
      expect(() => {
        act(() => {
          useCartStore.getState().removeItem('nonexistent-id');
        });
      }).not.toThrow();
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removing non-existent varianteId from non-empty cart is no-op', () => {
      act(() => {
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().removeItem('does-not-exist');
      });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].varianteId).toBe('intuicion-gabsalnat');
    });

    it('removing one item from multi-item cart leaves others', () => {
      const secondItem = {
        ...baseItem,
        varianteId: 'intuicion-linmenchoc',
        tela1Desc: 'Lino Men Chocolate',
      };
      const thirdItem = {
        ...baseItem,
        varianteId: 'intuicion-gabmarnat',
        tela1Desc: 'Gabardina Marruecos Natural',
      };

      act(() => {
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().addItem(secondItem);
        useCartStore.getState().addItem(thirdItem);
        useCartStore.getState().removeItem('intuicion-linmenchoc');
      });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(items.map((i) => i.varianteId)).toEqual([
        'intuicion-gabsalnat',
        'intuicion-gabmarnat',
      ]);
    });

    it('removing item that was added multiple times removes completely', () => {
      act(() => {
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().addItem(baseItem);
      });

      expect(useCartStore.getState().items[0].quantity).toBe(3);

      act(() => {
        useCartStore.getState().removeItem('intuicion-gabsalnat');
      });

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart edge cases', () => {
    it('clearing empty cart is no-op and does not throw', () => {
      expect(() => {
        act(() => {
          useCartStore.getState().clearCart();
        });
      }).not.toThrow();
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('clearing resets getItemCount to 0', () => {
      act(() => {
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().addItem({
          ...baseItem,
          varianteId: 'intuicion-linmenchoc',
          tela1Desc: 'Lino Men Chocolate',
        });
      });

      expect(useCartStore.getState().getItemCount()).toBe(3);

      act(() => {
        useCartStore.getState().clearCart();
      });

      expect(useCartStore.getState().getItemCount()).toBe(0);
    });

    it('clearing resets getTotal to 0', () => {
      act(() => {
        useCartStore.getState().addItem({ ...baseItem, precio: 35000 });
      });

      expect(useCartStore.getState().getTotal()).toBe(35000);

      act(() => {
        useCartStore.getState().clearCart();
      });

      expect(useCartStore.getState().getTotal()).toBe(0);
    });
  });

  describe('getTotal edge cases', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0);
    });

    it('handles precio=0 as valid price returning 0 not null', () => {
      act(() => {
        useCartStore.getState().addItem({ ...baseItem, precio: 0 });
      });

      const total = useCartStore.getState().getTotal();
      expect(total).toBe(0);
      expect(total).not.toBeNull();
    });

    it('handles large quantities with large prices correctly', () => {
      act(() => {
        useCartStore.getState().addItem({ ...baseItem, precio: 50000 });
        // Add 98 more times to reach quantity 99
        for (let i = 0; i < 98; i++) {
          useCartStore.getState().addItem({ ...baseItem, precio: 50000 });
        }
      });

      expect(useCartStore.getState().items[0].quantity).toBe(99);
      expect(useCartStore.getState().getTotal()).toBe(4950000);
    });
  });

  describe('getItemCount edge cases', () => {
    it('returns correct count with many different items', () => {
      act(() => {
        for (let i = 0; i < 5; i++) {
          useCartStore.getState().addItem({
            ...baseItem,
            varianteId: `intuicion-var${i}`,
            tela1Desc: `Tela Variante ${i}`,
          });
        }
      });

      expect(useCartStore.getState().items).toHaveLength(5);
      expect(useCartStore.getState().getItemCount()).toBe(5);
    });

    it('returns correct count after add + remove + add cycle', () => {
      act(() => {
        useCartStore.getState().addItem(baseItem);
        useCartStore.getState().addItem(baseItem);
      });

      expect(useCartStore.getState().getItemCount()).toBe(2);

      act(() => {
        useCartStore.getState().removeItem('intuicion-gabsalnat');
      });

      expect(useCartStore.getState().getItemCount()).toBe(0);

      act(() => {
        useCartStore.getState().addItem(baseItem);
      });

      expect(useCartStore.getState().getItemCount()).toBe(1);
    });
  });
});
