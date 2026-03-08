'use client';

import { trackWhatsAppClick } from '@/lib/analytics';
import { generateGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="border-t py-10 pb-24 md:pb-10">
      <div className="flex flex-col items-center gap-4 px-6">
        <Link href="/" className="font-titles text-xl font-bold tracking-wider">
          CHAMANA&reg;
        </Link>
        <p className="text-xs text-muted-foreground text-center">
          Colección Magia &middot; Ropa Femenina Artesanal
        </p>
        <div className="flex items-center gap-5">
          <a
            href="https://www.instagram.com/chamanasomostodas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={generateGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackWhatsAppClick('general', 'footer')}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        {/* Location & Contact */}
        <div className="flex flex-col items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Capilla del Monte, Cordoba, Argentina
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            chamanasomostodas@gmail.com
          </span>
        </div>

        {/* Trust */}
        <p className="text-xs text-muted-foreground/80 italic">Hecho a mano en Cordoba</p>
        <p className="text-[11px] text-muted-foreground/50">
          Mercado Pago &middot; Transferencia &middot; Efectivo
        </p>

        <p className="text-xs text-muted-foreground/60 mt-2">
          &copy; 2026 CHAMANA. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
