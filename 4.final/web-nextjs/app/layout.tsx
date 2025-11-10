import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';

/**
 * CHAMANA Brand Fonts
 *
 * TODO: Add custom fonts when available:
 * - Serif Flowers: Used for titles/headings (Títulos)
 * - Cherolina: Used for phrases and body text (Frases, Texto)
 *
 * Currently using system fonts as placeholder
 */

export const metadata: Metadata = {
  title: 'CHAMANA - Sistema de Gestión E-commerce',
  description: 'Sistema de gestión e-commerce de ropa femenina artesanal'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
