'use client';

import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType } from '@/lib/stores/cart-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);

  const telaInfo = item.tela2Desc ? `${item.tela1Desc} / ${item.tela2Desc}` : item.tela1Desc;

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {/* Placeholder Image */}
      <div className="w-16 h-20 bg-gradient-to-br from-secondary/30 to-muted/50 rounded-md flex items-center justify-center shrink-0">
        <span className="text-xl font-titles text-primary/20">{item.modelNombre.charAt(0)}</span>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-sm">{item.modelNombre}</h3>
        <p className="text-xs text-muted-foreground">{item.modelTipo}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{telaInfo}</p>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => removeItem(item.varianteId)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Eliminar</span>
      </Button>
    </div>
  );
}
