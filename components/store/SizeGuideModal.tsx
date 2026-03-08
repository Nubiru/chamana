'use client';

import { getSizeGuide } from '@/lib/data/size-guide';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SizeGuideModalProps {
  tipo: string;
  onClose: () => void;
}

export function SizeGuideModal({ tipo, onClose }: SizeGuideModalProps) {
  const guide = getSizeGuide(tipo);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h3 className="text-lg font-bold font-titles">Guia de Talles — {tipo}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {guide?.talleUnico && (
            <p className="text-sm text-muted-foreground">
              Nuestras prendas son <strong>talle unico</strong>, disenadas con cortes amplios
              que se adaptan a distintos cuerpos.
            </p>
          )}

          {guide ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 font-medium">Medida</th>
                  <th className="text-right py-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {guide.medidas.map((m) => (
                  <tr key={m.label} className="border-b border-border/10">
                    <td className="py-2 text-muted-foreground">{m.label}</td>
                    <td className="py-2 text-right">{m.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay guia de talles disponible para este tipo de prenda. Consultanos por WhatsApp.
            </p>
          )}

          {guide?.notas && (
            <p className="text-xs text-muted-foreground/70 italic">{guide.notas}</p>
          )}

          <p className="text-xs text-muted-foreground/70">
            Las medidas son aproximadas y pueden variar ligeramente entre prendas artesanales.
            Si tenes dudas, escribinos por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
