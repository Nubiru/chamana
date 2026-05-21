import { CreditCard, Scissors, ShieldCheck } from 'lucide-react';

export function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Scissors className="h-3.5 w-3.5" />
        Hecho a mano
      </span>
      <span className="flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" />
        Satisfaccion garantizada
      </span>
      <span className="flex items-center gap-1.5">
        <CreditCard className="h-3.5 w-3.5" />
        Mercado Pago
      </span>
    </div>
  );
}
