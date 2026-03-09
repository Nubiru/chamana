'use client';

import { getSizeGuide } from '@/lib/data/size-guide';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SizeGuideModalProps {
  tipo: string;
  onClose: () => void;
}

export function SizeGuideModal({ tipo, onClose }: SizeGuideModalProps) {
  const guide = getSizeGuide(tipo);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-background rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h3 id="size-guide-title" className="text-lg font-bold font-titles">
            Guia de Talles — {tipo}
          </h3>
          <button
            ref={closeButtonRef}
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
              Nuestras prendas son <strong>talle unico</strong>, disenadas con cortes amplios que se
              adaptan a distintos cuerpos.
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

          {guide?.notas && <p className="text-xs text-muted-foreground/70 italic">{guide.notas}</p>}

          <p className="text-xs text-muted-foreground/70">
            Las medidas son aproximadas y pueden variar ligeramente entre prendas artesanales. Si
            tenes dudas, escribinos por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
