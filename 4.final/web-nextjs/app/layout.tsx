import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';

/**
 * CHAMANA Brand Fonts
 *
 * Serif Flowers: Used for titles/headings (Títulos)
 * Cherolina: Used for phrases and body text (Frases, Texto)
 *
 * Note: Font files should be placed in public/fonts/ directory
 * If fonts are not available, fallback to system serif/sans-serif fonts
 */

// Serif Flowers - Titles font
// Font files should be placed in: public/fonts/serif-flowers/
// Note: If fonts are not available, fallback fonts will be used
const serifFlowers = localFont({
  src: [
    {
      path: '../../public/fonts/serif-flowers/SerifFlowers-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../public/fonts/serif-flowers/SerifFlowers-Regular.woff',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-titles',
  display: 'swap',
  fallback: ['Georgia', 'serif'] // Fallback to system serif
});

// Cherolina - Text and phrases font
// Font files should be placed in: public/fonts/cherolina/
// Note: If fonts are not available, fallback fonts will be used
const cherolina = localFont({
  src: [
    {
      path: '../../public/fonts/cherolina/Cherolina-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../public/fonts/cherolina/Cherolina-Regular.woff',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-text',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'] // Fallback to system sans
});

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
      <body
        className={`${serifFlowers.variable} ${cherolina.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
