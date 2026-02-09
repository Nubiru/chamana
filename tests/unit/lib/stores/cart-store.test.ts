import { useCartStore } from '@/lib/stores/cart-store';
import { act } from '@testing-library/react';

// Reset store between tests
beforeEach(() => {
  act(() => {
    useCartStore.getState().clearCart();
  });
});

const sampleItem = {
  modelSlug: 'hechizo',
  modelNombre: 'Hechizo',
  modelTipo: 'Falda',
  varianteId: 'hechizo-linmenchoc',
  tela1Desc: 'Lino Men Chocolate',
};

describe('cart store', () => {
  it('starts empty', () => {
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getItemCount()).toBe(0);
  });

  it('adds an item', () => {
    act(() => {
      useCartStore.getState().addItem(sampleItem);
    });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].modelNombre).toBe('Hechizo');
    expect(items[0].quantity).toBe(1);
  });

  it('increments quantity when adding same variante', () => {
    act(() => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem);
    });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('adds different variantes as separate items', () => {
    act(() => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem({
        ...sampleItem,
        varianteId: 'hechizo-linmenneg',
        tela1Desc: 'Lino Men Negro',
      });
    });

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('removes an item', () => {
    act(() => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().removeItem('hechizo-linmenchoc');
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears the cart', () => {
    act(() => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem({
        ...sampleItem,
        varianteId: 'hechizo-linmenneg',
        tela1Desc: 'Lino Men Negro',
      });
      useCartStore.getState().clearCart();
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('counts items including quantity', () => {
    act(() => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem({
        ...sampleItem,
        varianteId: 'hechizo-linmenneg',
        tela1Desc: 'Lino Men Negro',
      });
    });

    expect(useCartStore.getState().getItemCount()).toBe(3);
  });
});
