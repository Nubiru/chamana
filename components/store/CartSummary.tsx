'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getTotal = useCartStore((state) => state.getTotal);

  const itemCount = getItemCount();
  const total = getTotal();

  if (items.length === 0) return null;

  const hasPrices = total != null && total > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Prendas seleccionadas</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">
            {total == null ? 'Consultar' : formatPrice(total)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {hasPrices
            ? 'Enviá tu selección por WhatsApp para consultar disponibilidad.'
            : 'Enviá tu selección por WhatsApp para consultar disponibilidad y precios.'}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full gap-2" size="lg">
          <a href={generateWhatsAppUrl(items)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            {hasPrices ? 'Pedir por WhatsApp' : 'Consultar por WhatsApp'}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
