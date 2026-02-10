import { generateGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="border-t py-10 pb-24 md:pb-10">
      <div className="container px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="font-titles text-lg font-bold tracking-wider">
              CHAMANA
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Colección Magia · Ropa Femenina Artesanal
            </p>
          </div>

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
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
