import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price?: number): string {
  if (price == null) return 'Consultar precio';
  return `$${price.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}
