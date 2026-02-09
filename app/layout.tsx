import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';

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
    <html lang="es">
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
