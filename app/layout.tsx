import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';

const serifFlowers = localFont({
  src: [
    {
      path: '../public/fonts/serif-flowers/SerifFlowers-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-titles',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const cherolina = localFont({
  src: [
    { path: '../public/fonts/cherolina/Cherolina-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-text',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'CHAMANA - Ropa Femenina Artesanal | Coleccion Magia',
  description:
    'Ropa femenina artesanal inspirada en la naturaleza. Faldas, vestidos, kimonos, tops y más. Diseñada para la libertad de movimiento y la conexión con tu esencia.',
  openGraph: {
    title: 'CHAMANA - Coleccion Magia',
    description: 'Ropa femenina artesanal inspirada en la naturaleza.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${serifFlowers.variable} ${cherolina.variable}`}>
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
