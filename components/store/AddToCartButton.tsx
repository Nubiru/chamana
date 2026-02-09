'use client';

import { Button } from '@/components/ui/button';
import { telaDescripcion } from '@/lib/data/fabrics';
import type { ChamanaModel, Variante } from '@/lib/data/products';
import { useCartStore } from '@/lib/stores/cart-store';
import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface AddToCartButtonProps {
  model: ChamanaModel;
  variante: Variante;
}

export function AddToCartButton({ model, variante }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      modelSlug: model.slug,
      modelNombre: model.nombre,
      modelTipo: model.tipo,
      varianteId: variante.id,
      tela1Desc: telaDescripcion(variante.tela1),
      tela2Desc: variante.tela2 ? telaDescripcion(variante.tela2) : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAdd}
      className="w-full gap-2"
      size="lg"
      variant={added ? 'outline' : 'default'}
    >
      {added ? (
        <>
          <Check className="h-5 w-5" />
          Agregado al Carrito
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          Agregar al Carrito
        </>
      )}
    </Button>
  );
}
