'use client';

import type { FAQ } from '@/lib/data/faqs';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border/30 bg-muted/20 divide-y divide-border/20">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span>{faq.pregunta}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <p className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
                {faq.respuesta}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
