/**
 * CHAMANA — Caption Generator for Coleccion Transmutacion
 *
 * Generates Instagram-ready Spanish captions from garment data + Cintia's vocabulary.
 * Template-based (no AI API calls) — deterministic, $0 cost, instant.
 */

import {
  type CapaName,
  type TransmutacionGarment,
  VOCAB_CLUSTERS,
  getCapa,
  getGarment,
  getGarmentsByCapa,
} from './transmutacion-data';

const WHATSAPP_NUMBER = '542215475727';
const WEBSITE_URL = 'https://chamana-ashy.vercel.app';
const IG_HANDLE = '@chamanasomostodas';

export interface Caption {
  full: string; // Complete caption ready to paste
  hook: string; // First line (scroll-stopper)
  body: string; // Narrative
  cta: string; // Call to action
  whatsappLink: string;
  websiteLink: string;
}

/**
 * Generate a caption for a specific garment
 */
export function generateGarmentCaption(garmentName: string): Caption | null {
  const garment = getGarment(garmentName);
  if (!garment) return null;

  const capa = getCapa(garment.capa);
  if (!capa) return null;

  const vocabWords = VOCAB_CLUSTERS[garment.capa];
  const vocabLine = pickVocabLine(vocabWords, garment.capa);

  const hook = garment.caption;
  const body = [
    '',
    garment.transformationStory,
    '',
    `${garment.fullName} — ${vocabLine}`,
    '',
    `${capa.displayName}: ${capa.subtitle}.`,
  ].join('\n');

  const cta = [
    '',
    `Escribime por WhatsApp para reservar tu ${garment.name}.`,
    `${WEBSITE_URL}/producto/${garment.name.toLowerCase()}`,
    '',
    `${IG_HANDLE}`,
  ].join('\n');

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Me interesa ${garment.fullName} de la Coleccion Transmutacion`
  )}`;

  return {
    full: hook + body + cta,
    hook,
    body: body.trim(),
    cta: cta.trim(),
    whatsappLink,
    websiteLink: `${WEBSITE_URL}/producto/${garment.name.toLowerCase()}`,
  };
}

/**
 * Generate a caption for an entire Capa (wave-level content)
 */
export function generateCapaCaption(capaName: CapaName): Caption | null {
  const capa = getCapa(capaName);
  if (!capa) return null;

  const garments = getGarmentsByCapa(capaName);
  const garmentList = garments.map((g) => `${g.type} ${g.name}`).join(' · ');

  const hook = `${capa.displayName}\n${capa.subtitle}.`;
  const body = [
    '',
    getCapaStory(capaName),
    '',
    `${garments.length} prendas que nacen de la ${capa.element.toLowerCase()}:`,
    garmentList,
    '',
    'Coleccion Transmutacion · Otono-Invierno 2026',
  ].join('\n');

  const cta = [
    '',
    'Escribime por WhatsApp para conocer la coleccion.',
    WEBSITE_URL,
    '',
    IG_HANDLE,
  ].join('\n');

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Quiero conocer la ${capa.displayName} de Transmutacion`
  )}`;

  return {
    full: hook + body + cta,
    hook,
    body: body.trim(),
    cta: cta.trim(),
    whatsappLink,
    websiteLink: WEBSITE_URL,
  };
}

/**
 * Generate a collection-level caption (Transmutacion as a whole)
 */
export function generateCollectionCaption(): Caption {
  const hook = 'COLECCION TRANSMUTACION\nOtono · Invierno 2026';
  const body = [
    '',
    'Todo en la naturaleza se transforma. Vos tambien.',
    '',
    'La obsidiana nace del volcan. La perla nace del dolor. La mariposa nace de la quietud.',
    '18 prendas artesanales inspiradas en la transmutacion de la naturaleza.',
    '',
    '4 capas. 4 elementos. Un viaje de renacer.',
    'Tierra · Fuego · Agua · Aire',
  ].join('\n');

  const cta = [
    '',
    'Escribime por WhatsApp para ser la primera en conocerla.',
    WEBSITE_URL,
    '',
    IG_HANDLE,
  ].join('\n');

  return {
    full: hook + body + cta,
    hook,
    body: body.trim(),
    cta: cta.trim(),
    whatsappLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      'Hola! Quiero conocer la Coleccion Transmutacion'
    )}`,
    websiteLink: WEBSITE_URL,
  };
}

// --- Helpers ---

function pickVocabLine(_words: readonly string[], capa: CapaName): string {
  const lines: Record<CapaName, string[]> = {
    tierra: [
      'Naturaleza que sostiene. Camino que transforma.',
      'Donde hay raiz, hay renacer.',
      'La paz de saber que la tierra siempre te sostiene.',
    ],
    fuego: [
      'Resplandor que nace de adentro.',
      'Transformacion que no pide permiso.',
      'Ceniza que se convierte en semilla.',
    ],
    agua: [
      'Fluir es la forma mas valiente de sanar.',
      'Movimiento que no se detiene.',
      'El viaje del agua siempre llega.',
    ],
    aire: [
      'Constelacion de libertad y renacer.',
      'Universo que se expande en cada respiro.',
      'La orbita de tu vida cambia cuando soltas.',
    ],
  };

  // Deterministic rotation based on date
  const dayIndex = new Date().getDate() % lines[capa].length;
  return lines[capa][dayIndex];
}

function getCapaStory(capa: CapaName): string {
  const stories: Record<CapaName, string> = {
    tierra:
      'La tierra no se resiste al cambio. Se transforma desde adentro. La roca se convierte en cristal, la semilla se rompe para nacer, la obsidiana se forja en el fuego del volcan.',
    fuego:
      'El fuego no destruye — purifica. Quema lo que ya no sirve para dejar espacio a lo nuevo. La ceniza es tierra fertil, la brasa es calor que perdura, la lava crea suelo donde antes no habia nada.',
    agua: 'El agua no lucha contra la piedra — la transforma gota a gota. Fluye, se adapta, encuentra su camino. La cascada cae libre, la perla nace de una herida, todo lo que fluye llega.',
    aire: 'El aire no se ve pero se siente. Eleva, libera, expande. El fenix renace, la libelula cambia de elemento, el condor vuela sin aletear. Soltar es la forma mas valiente de transformarse.',
  };
  return stories[capa];
}
