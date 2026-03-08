'use client';

import { trackLeadCapture, trackLeadDismiss } from '@/lib/analytics';
import { useLeadStore } from '@/lib/stores/lead-store';
import { Mail, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export function LeadMagnetPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const triggered = useRef(false);
  const pathname = usePathname();

  const shouldShowPopup = useLeadStore((s) => s.shouldShowPopup);
  const storeSetEmail = useLeadStore((s) => s.setEmail);
  const dismiss = useLeadStore((s) => s.dismiss);

  const show = useCallback(() => {
    if (triggered.current) return;
    if (!shouldShowPopup()) return;
    triggered.current = true;
    setVisible(true);
  }, [shouldShowPopup]);

  useEffect(() => {
    if (pathname === '/carrito') return;

    const timer = setTimeout(show, 30000);

    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) show();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresa un email valido');
      return;
    }
    storeSetEmail(trimmed);
    setSubmitted(true);
    setError('');
    trackLeadCapture('popup');
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
    trackLeadDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
      <div className="bg-background rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
        <div className="flex justify-end p-3 pb-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 text-center space-y-4">
          {submitted ? (
            <>
              <Mail className="h-10 w-10 mx-auto text-cta" />
              <h3 className="text-xl font-bold font-titles">Bienvenida!</h3>
              <p className="text-sm text-muted-foreground">
                Pronto recibiras tu guia de estilo y cuidado de telas, junto con un codigo de
                descuento exclusivo.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold font-titles">Sumate a la Transformacion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Recibe una guia de estilo artesanal, tips de cuidado de telas y un
                <strong> codigo de descuento exclusivo</strong> para la proxima coleccion.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Tu email"
                  className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cta/30"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-cta text-cta-foreground font-medium text-sm hover:bg-cta/85 transition-colors"
                >
                  Quiero mi guia + descuento
                </button>
              </form>
              <p className="text-[11px] text-muted-foreground/60">No spam. Solo magia.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
