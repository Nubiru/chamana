/**
 * CHAMANA — Marketing Packet Generator
 *
 * Assembles a COMPLETE Instagram marketing packet from:
 * - Garment/Capa data
 * - Caption generator
 * - Hashtag rotator
 * - Posting recommendations
 * - SEO metadata
 *
 * The packet is everything Cintia needs to publish:
 * image + caption + hashtags + CTA + timing + alt text.
 */

import type { CapaName } from './transmutacion-data';
import { getGarment, getCapa, getGarmentsByCapa } from './transmutacion-data';
import { generateGarmentCaption, generateCapaCaption, generateCollectionCaption } from './caption-generator';
import { getHashtagSet, getTodayRotationIndex } from './hashtag-rotator';

export interface MarketingPacket {
  version: '1.0';
  generatedAt: string;
  collection: 'transmutacion';
  capa: CapaName;
  garment?: {
    name: string;
    type: string;
    fullName: string;
  };

  caption: {
    full: string;
    hook: string;
    body: string;
    cta: string;
    whatsappLink: string;
    websiteLink: string;
  };

  hashtags: {
    setName: string;
    tags: string[];
    formatted: string;
    firstComment: string;
    count: number;
  };

  posting: {
    recommendedTime: string;
    recommendedDay: string;
    platform: string;
    aspectRatio: string;
    notes: string;
  };

  story: {
    suggestion: string;
  };

  seo: {
    altText: string;
    keywords: string[];
    pinterestDescription: string;
  };

  images: {
    cleanFilename: string;
    textFilename: string;
  };

  state: 'pending-review' | 'approved' | 'rejected' | 'published';
}

// Best posting times for Argentina Instagram (fashion/lifestyle)
const POSTING_SCHEDULE = [
  { day: 'lunes', time: '10:00', note: 'Inicio de semana, alta actividad' },
  { day: 'martes', time: '11:00', note: 'Pico de engagement' },
  { day: 'miercoles', time: '10:00', note: 'Mitad de semana' },
  { day: 'jueves', time: '19:00', note: 'Post-trabajo, scrolleo' },
  { day: 'viernes', time: '12:00', note: 'Pre-fin de semana' },
  { day: 'sabado', time: '11:00', note: 'Fin de semana relajado' },
];

/**
 * Generate a complete marketing packet for a specific garment
 */
export function generateGarmentPacket(
  garmentName: string,
  imageBaseName: string,
): MarketingPacket | null {
  const garment = getGarment(garmentName);
  if (!garment) return null;

  const caption = generateGarmentCaption(garmentName);
  if (!caption) return null;

  const rotationIdx = getTodayRotationIndex();
  const hashtags = getHashtagSet(rotationIdx, garment.capa, garment.name);

  const schedule = POSTING_SCHEDULE[rotationIdx % POSTING_SCHEDULE.length];

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    collection: 'transmutacion',
    capa: garment.capa,
    garment: {
      name: garment.name,
      type: garment.type,
      fullName: garment.fullName,
    },

    caption,
    hashtags: {
      setName: hashtags.name,
      tags: hashtags.tags,
      formatted: hashtags.formatted,
      firstComment: hashtags.firstComment,
      count: hashtags.count,
    },

    posting: {
      recommendedTime: schedule.time,
      recommendedDay: schedule.day,
      platform: 'instagram-feed',
      aspectRatio: '4:5',
      notes: schedule.note,
    },

    story: {
      suggestion: `Story 9:16: Recortar la imagen al centro, agregar sticker de pregunta "Cual es tu ${garment.type.toLowerCase()} ideal?" o encuesta "Te gusta ${garment.name}? Si/Me encanta". Incluir link de WhatsApp.`,
    },

    seo: {
      altText: `${garment.fullName} de la Coleccion Transmutacion de CHAMANA — ropa artesanal hecha a mano en Capilla del Monte, Argentina. Tela de ${garment.fabrics[0]}.`,
      keywords: [
        garment.name.toLowerCase(),
        garment.type.toLowerCase(),
        'chamana',
        'transmutacion',
        'ropa artesanal',
        'moda argentina',
        garment.capa,
        ...garment.fabrics,
      ],
      pinterestDescription: `${garment.fullName} | ${garment.caption} | Coleccion Transmutacion — ropa artesanal de telas naturales, hecha a mano en las Sierras de Cordoba. ${garment.type} de ${garment.fabrics[0]}. #chamana #transmutacion #${garment.name.toLowerCase()}`,
    },

    images: {
      cleanFilename: `${imageBaseName}-clean.webp`,
      textFilename: `${imageBaseName}-TEXT.webp`,
    },

    state: 'pending-review',
  };
}

/**
 * Generate a complete marketing packet for a Capa (wave-level post)
 */
export function generateCapaPacket(
  capaName: CapaName,
  imageBaseName: string,
): MarketingPacket | null {
  const capa = getCapa(capaName);
  if (!capa) return null;

  const caption = generateCapaCaption(capaName);
  if (!caption) return null;

  const rotationIdx = getTodayRotationIndex();
  const hashtags = getHashtagSet(rotationIdx, capaName);

  const schedule = POSTING_SCHEDULE[rotationIdx % POSTING_SCHEDULE.length];
  const garments = getGarmentsByCapa(capaName);

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    collection: 'transmutacion',
    capa: capaName,

    caption,
    hashtags: {
      setName: hashtags.name,
      tags: hashtags.tags,
      formatted: hashtags.formatted,
      firstComment: hashtags.firstComment,
      count: hashtags.count,
    },

    posting: {
      recommendedTime: schedule.time,
      recommendedDay: schedule.day,
      platform: 'instagram-feed',
      aspectRatio: '4:5',
      notes: `Lanzamiento ${capa.displayName} — Luna Nueva ${capa.launchDate}`,
    },

    story: {
      suggestion: `Story 9:16: Encuesta "Que elemento te representa? ${capa.element}" con opciones Tierra/Fuego/Agua/Aire. Mostrar las ${garments.length} prendas en secuencia de stories.`,
    },

    seo: {
      altText: `${capa.displayName} — ${capa.subtitle}. ${garments.length} prendas artesanales de la Coleccion Transmutacion de CHAMANA, inspiradas en el elemento ${capa.element.toLowerCase()}.`,
      keywords: [
        capaName,
        capa.element.toLowerCase(),
        'chamana',
        'transmutacion',
        'coleccion transmutacion',
        'ropa artesanal',
        ...garments.map(g => g.name.toLowerCase()),
      ],
      pinterestDescription: `${capa.displayName}: ${capa.subtitle} | ${garments.length} prendas artesanales inspiradas en la ${capa.element.toLowerCase()}. Coleccion Transmutacion de CHAMANA — hecha a mano en Capilla del Monte. #chamana #transmutacion`,
    },

    images: {
      cleanFilename: `${imageBaseName}-clean.webp`,
      textFilename: `${imageBaseName}-TEXT.webp`,
    },

    state: 'pending-review',
  };
}
