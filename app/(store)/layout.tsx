import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../globals.css';
import { CookieConsent } from '@/components/analytics/CookieConsent';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomNav } from '@/components/store/BottomNav';
import { LeadMagnetPopup } from '@/components/store/LeadMagnetPopup';
import { StoreFooter } from '@/components/store/StoreFooter';
import { StoreNavbar } from '@/components/store/StoreNavbar';
import { WhatsAppFab } from '@/components/store/WhatsAppFab';
import { ToastProvider } from '@/components/ui/toast';
import { organizationJsonLd, websiteJsonLd } from '@/lib/structured-data';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const serifFlowers = localFont({
  src: [
    {
      path: '../../public/fonts/serif-flowers/SerifFlowers-Regular.ttf',
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
    {
      path: '../../public/fonts/cherolina/Cherolina-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-text',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'CHAMANA - Ropa Femenina Artesanal | Coleccion Magia',
  description:
    'Ropa femenina artesanal inspirada en la naturaleza. Faldas, vestidos, kimonos, tops y más. Diseñada para la libertad de movimiento y la conexión con tu esencia.',
  metadataBase: new URL('https://chamana.app'),
  openGraph: {
    title: 'CHAMANA - Coleccion Magia',
    description: 'Ropa femenina artesanal inspirada en la naturaleza.',
    type: 'website',
    url: 'https://chamana.app',
    images: [
      {
        url: '/images/brand/logo-dark.png',
        width: 600,
        height: 600,
        alt: 'CHAMANA - Coleccion Magia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHAMANA - Ropa Femenina Artesanal',
    description: 'Ropa femenina artesanal inspirada en la naturaleza.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function StoreRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${serifFlowers.variable} ${cherolina.variable}`}>
      <body className="antialiased font-sans">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <GoogleAnalytics />
        <ErrorBoundary>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <StoreNavbar />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <StoreFooter />
              <BottomNav />
              <WhatsAppFab />
              <LeadMagnetPopup />
            </div>
          </ToastProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  );
}
