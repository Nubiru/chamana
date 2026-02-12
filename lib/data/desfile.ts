export interface DesfileImage {
  id: number;
  src: string;
  alt: string;
}

export interface DesfileEvent {
  slug: string;
  title: string;
  displayDate: string;
  location: string;
  description: string;
  images: DesfileImage[];
}

const utopiaImages: DesfileImage[] = Array.from({ length: 19 }, (_, i) => ({
  id: i + 1,
  src: `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`,
  alt: `Desfile CHAMANA en Utopía – foto ${i + 1}`,
}));

export const DESFILE_EVENTS: DesfileEvent[] = [
  {
    slug: 'utopia-capilla-2026',
    title: 'Desfile en Utopía',
    displayDate: 'Enero 2026',
    location: 'Utopía Bar · Capilla del Monte',
    description:
      'Una noche mágica donde la Colección Magia cobró vida. Modelos locales desfilaron entre luces y naturaleza, celebrando la esencia de CHAMANA en el corazón de las sierras cordobesas.',
    images: utopiaImages,
  },
];

export function getDesfileBySlug(slug: string): DesfileEvent | undefined {
  return DESFILE_EVENTS.find((e) => e.slug === slug);
}
