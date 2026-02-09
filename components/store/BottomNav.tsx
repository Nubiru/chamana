'use client';

import { useCartStore } from '@/lib/stores/cart-store';
import { generateGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { Home, MessageCircle, ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/tienda', label: 'Tienda', icon: Store },
  { href: '/carrito', label: 'Carrito', icon: ShoppingBag },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          const isCart = tab.href === '/carrito';

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full relative transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}

        {/* WhatsApp tab */}
        <a
          href={generateGeneralWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 w-full h-full text-muted-foreground"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px]">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
