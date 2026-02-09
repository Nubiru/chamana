'use client';

import { CartItem } from '@/components/store/CartItem';
import { CartSummary } from '@/components/store/CartSummary';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const isEmpty = items.length === 0;

  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <Link href="/tienda">
          <Button variant="ghost" size="sm" className="mb-2 gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Seguir Viendo
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold font-titles">Tu Selección</h1>
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-medium mb-2">Tu carrito está vacío</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Explorá la colección y elegí las prendas que más te gusten.
          </p>
          <Link href="/tienda">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              Explorar Colección
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-0">
              {items.map((item) => (
                <CartItem key={item.varianteId} item={item} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CartSummary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
