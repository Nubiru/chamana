'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import { generateGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { Menu, MessageCircle, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function StoreNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  const navLinks = [
    { href: '/tienda', label: 'Tienda' },
    { href: '/desfile', label: 'Desfile' },
    { href: '/carrito', label: 'Carrito' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo: Green CHAMANA logotype */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center -my-px">
            <Image
              src="/images/brand/logotype-green.png"
              alt="CHAMANA"
              width={600}
              height={222}
              className="h-16 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-base flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-foreground/80 ${
                isActive(link.href) ? 'text-foreground font-medium' : 'text-foreground/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a
              href={generateGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/carrito">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="sr-only">Carrito ({itemCount} items)</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Right */}
        <div className="flex md:hidden items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/carrito">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href) ? 'text-foreground font-medium' : 'text-foreground/60'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={generateGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
