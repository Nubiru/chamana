'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'chamana-cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem(CONSENT_KEY, accepted ? 'granted' : 'denied');
    setVisible(false);

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: accepted ? 'granted' : 'denied',
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-lg bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-xs text-muted-foreground text-center sm:text-left flex-1">
          Usamos cookies para mejorar tu experiencia y entender como usas nuestro sitio.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleConsent(false)}
            className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => handleConsent(true)}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
