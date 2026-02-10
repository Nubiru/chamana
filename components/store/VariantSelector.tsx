'use client';

import { telaDescripcion } from '@/lib/data/fabrics';
import type { Variante } from '@/lib/data/products';
import { cn, formatPrice } from '@/lib/utils';

interface VariantSelectorProps {
  variantes: Variante[];
  selected: Variante;
  onSelect: (variante: Variante) => void;
}

export function VariantSelector({ variantes, selected, onSelect }: VariantSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Variante: <span className="text-foreground">{telaDescripcion(selected.tela1)}</span>
          {selected.tela2 && (
            <span className="text-foreground"> / {telaDescripcion(selected.tela2)}</span>
          )}
        </h3>
        {selected.precio != null && (
          <span className="text-lg font-semibold text-foreground">{formatPrice(selected.precio)}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {variantes.map((v) => {
          const isSelected = v.id === selected.id;
          const isReversible = !!v.tela2;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              className={cn(
                'relative rounded-full transition-all',
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'ring-1 ring-border hover:ring-primary/50'
              )}
              title={
                isReversible
                  ? `${telaDescripcion(v.tela1)} / ${v.tela2 ? telaDescripcion(v.tela2) : ''}`
                  : telaDescripcion(v.tela1)
              }
            >
              {isReversible ? (
                <div className="w-8 h-8 rounded-full overflow-hidden flex">
                  <span className="w-1/2 h-full" style={{ backgroundColor: v.tela1.colorHex }} />
                  <span className="w-1/2 h-full" style={{ backgroundColor: v.tela2?.colorHex }} />
                </div>
              ) : (
                <span
                  className="block w-8 h-8 rounded-full"
                  style={{ backgroundColor: v.tela1.colorHex }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Fabric details */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            {selected.tela2 ? 'Lado A' : 'Tela'}
          </p>
          <p className="text-sm font-medium">{telaDescripcion(selected.tela1)}</p>
        </div>
        {selected.tela2 && (
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Lado B
            </p>
            <p className="text-sm font-medium">{telaDescripcion(selected.tela2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
