'use client';

import { generateGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';

export function WhatsAppFab() {
  return (
    <a
      href={generateGeneralWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
