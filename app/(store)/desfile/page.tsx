import { DesfileGallery } from '@/components/store/DesfileGallery';
import { getDesfileEvents } from '@/lib/payload/queries';
import { Calendar, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Desfile en Utopia - CHAMANA',
  description:
    'Galeria de fotos del desfile de CHAMANA en Utopia, Capilla del Monte. Coleccion Magia - Ropa femenina artesanal.',
  openGraph: {
    title: 'Desfile CHAMANA - Coleccion Magia',
    description: 'Galeria de fotos del desfile de CHAMANA en Utopia, Capilla del Monte.',
    type: 'website',
  },
};

const fadeEdges = {
  maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
} as React.CSSProperties;

export default async function DesfilePage() {
  const events = await getDesfileEvents();
  const event = events[0];
  if (!event) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" style={fadeEdges}>
          <Image
            src="/images/brand/bg-thread.jpg"
            alt=""
            width={1920}
            height={1920}
            className="w-full h-auto opacity-20 absolute top-0 left-0"
            priority
            aria-hidden="true"
          />
        </div>

        <div className="container py-12 md:py-16 px-4">
          {/* Header */}
          <div className="text-center mb-10 space-y-4 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-titles">{event.title}</h1>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {event.displayDate}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-foreground/70">
              {event.description}
            </p>
          </div>

          {/* Gallery */}
          <DesfileGallery images={event.images} />
        </div>
      </section>
    </div>
  );
}
