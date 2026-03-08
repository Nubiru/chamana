'use client';

import { GARANTIAS } from '@/lib/data/guarantees';
import { Repeat, Scissors, ShieldCheck } from 'lucide-react';

const ICONS = {
  Repeat,
  ShieldCheck,
  Scissors,
} as const;

export function GuaranteeBadges() {
  return (
    <div className="rounded-lg border border-border/30 bg-muted/20 p-4 space-y-0 divide-y divide-border/20">
      {GARANTIAS.map((g) => {
        const Icon = ICONS[g.iconName];
        return (
          <div key={g.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Icon className="h-5 w-5 text-cta shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{g.nombre}</p>
              <p className="text-xs text-muted-foreground">{g.descripcion}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
