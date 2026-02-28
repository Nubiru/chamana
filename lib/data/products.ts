import { formatPrice } from '@/lib/utils';
import { TELAS, type Tela } from './fabrics';

export interface Variante {
  id: string;
  tela1: Tela;
  tela2?: Tela;
  precio?: number;
  sinStock?: boolean;
}

export interface ChamanaModel {
  slug: string;
  nombre: string;
  tipo: string;
  detalle?: string;
  descripcion: string;
  variantes: Variante[];
  imagenes?: string[];
}

function v(id: string, tela1Key: string, tela2Key?: string, precio?: number): Variante {
  return {
    id,
    tela1: TELAS[tela1Key],
    ...(tela2Key ? { tela2: TELAS[tela2Key] } : {}),
    ...(precio != null ? { precio } : {}),
  };
}

function vSinStock(id: string, tela1Key: string, tela2Key?: string): Variante {
  return { ...v(id, tela1Key, tela2Key), sinStock: true };
}

export const MODELOS: ChamanaModel[] = [
  {
    slug: 'hechizo',
    nombre: 'Hechizo',
    tipo: 'Falda',
    descripcion:
      'Falda que fluye con cada paso, como un hechizo tejido en tela. Su caida natural acompana el movimiento del cuerpo con gracia y soltura.',
    imagenes: ['/images/models/hechizo/hechizo-1.webp', '/images/models/hechizo/hechizo-2.webp'],
    variantes: [
      vSinStock('hechizo-linmenchoc', 'LinMenChoc'),
      vSinStock('hechizo-linmarcho', 'LinMarCho'),
      v('hechizo-linmarmalv', 'LinMarMalv', undefined, 32000),
      v('hechizo-linatenneg', 'LinAtenNeg', undefined, 32000),
    ],
  },
  {
    slug: 'sagrada',
    nombre: 'Sagrada',
    tipo: 'Vestido',
    descripcion:
      'Vestido que envuelve el cuerpo como un abrazo sagrado. Cada puntada honra la conexion entre la mujer y la naturaleza.',
    imagenes: ['/images/models/sagrada/sagrada-1.webp', '/images/models/sagrada/sagrada-2.webp'],
    variantes: [],
  },
  {
    slug: 'intuicion',
    nombre: 'Intuicion',
    tipo: 'Kimono',
    descripcion:
      'Kimono de corte amplio que sigue el instinto de quien lo lleva. Una pieza envolvente para protegerte del frio con calidez artesanal.',
    imagenes: [
      '/images/models/intuicion/intuicion-1.webp',
      '/images/models/intuicion/intuicion-2.webp',
      '/images/models/intuicion/intuicion-3.webp',
      '/images/models/intuicion/intuicion-4.webp',
      '/images/models/intuicion/intuicion-5.webp',
      '/images/models/intuicion/intuicion-6.webp',
    ],
    variantes: [
      v('intuicion-ribmarino', 'RibMarino', undefined, 42000),
      vSinStock('intuicion-linmengris', 'LinMenGris'),
      vSinStock('intuicion-fibceleste', 'FibCeleste'),
      vSinStock('intuicion-tejmalva', 'TejMalva'),
      v('intuicion-linmarneg', 'LinMarNeg', undefined, 32000),
    ],
  },
  {
    slug: 'sabia',
    nombre: 'Sabia',
    tipo: 'Remeron',
    detalle: 'Oriental',
    descripcion:
      'Remeron oriental amplio y comodo, inspirado en la sabiduria ancestral. Perfecto para esos dias donde la comodidad y el estilo se encuentran.',
    imagenes: [
      '/images/models/sabia/sabia-1.webp',
      '/images/models/sabia/sabia-2.webp',
      '/images/models/sabia/sabia-3.webp',
      '/images/models/sabia/sabia-4.webp',
    ],
    variantes: [
      v('sabia-tejnegro', 'TejNegro', undefined, 33000),
      v('sabia-ribnegro', 'RibNegro', undefined, 28000),
      v('sabia-ribmarino', 'RibMarino', undefined, 28000),
      v('sabia-linmengris', 'LinMenGris', undefined, 25000),
      v('sabia-tejmalva', 'TejMalva', undefined, 33000),
      vSinStock('sabia-tusnegro', 'TusNegro'),
      v('sabia-linmarcho', 'LinMarCho', undefined, 28000),
      v('sabia-linmenverde', 'LinMenVerde', undefined, 25000),
      v('sabia-ribmilitar', 'RibMilitar', undefined, 28000),
      v('sabia-linmarcasc', 'LinMarCasc', undefined, 25000),
      v('sabia-linmarmalv', 'LinMarMalv', undefined, 25000),
    ],
  },
  {
    slug: 'magnetica',
    nombre: 'Magnetica',
    tipo: 'Musculosa',
    detalle: 'Escote V',
    descripcion:
      'Musculosa con escote en V que atrae todas las miradas. Simple, magnetica y perfecta para combinar con cualquier prenda de la coleccion.',
    imagenes: [
      '/images/models/magnetica/magnetica-1.webp',
      '/images/models/magnetica/magnetica-2.webp',
      '/images/models/magnetica/magnetica-3.webp',
      '/images/models/magnetica/magnetica-4.webp',
    ],
    variantes: [
      vSinStock('magnetica-linspanbei', 'LinSpanBei'),
      v('magnetica-linmengris', 'LinMenGris', undefined, 22000),
      vSinStock('magnetica-linmarneg', 'LinMarNeg'),
      v('magnetica-linmarcasc', 'LinMarCasc', undefined, 22000),
      v('magnetica-tejmalva', 'TejMalva', undefined, 22000),
    ],
  },
  {
    slug: 'espejo',
    nombre: 'Espejo',
    tipo: 'Top',
    detalle: 'Reversible',
    descripcion:
      'Top reversible que refleja la dualidad de la naturaleza. Dos caras, dos esencias, una sola prenda que se adapta a tu estado de animo.',
    imagenes: [
      '/images/models/espejo/espejo-1.webp',
      '/images/models/espejo/espejo-2.webp',
      '/images/models/espejo/espejo-3.webp',
      '/images/models/espejo/espejo-4.webp',
      '/images/models/espejo/espejo-5.webp',
    ],
    variantes: [
      v('espejo-ribmilitar-tejnegro', 'RibMilitar', 'TejNegro', 28000),
      v('espejo-ribnegro-ribmarino', 'RibNegro', 'RibMarino', 28000),
      v('espejo-ribmilitar-ribnegro', 'RibMilitar', 'RibNegro', 28000),
      v('espejo-ribmilitar-tejmalva', 'RibMilitar', 'TejMalva', 28000),
      v('espejo-linmarcasc-tejmalva', 'LinMarCasc', 'TejMalva', 25000),
      v('espejo-linspanbei-linmarcasc', 'LinSpanBei', 'LinMarCasc', 25000),
    ],
  },
  {
    slug: 'simbolo',
    nombre: 'Simbolo',
    tipo: 'Top',
    detalle: 'Simple',
    descripcion:
      'Top simple que simboliza la esencia de lo artesanal. Una pieza basica con caracter propio, perfecta para el dia a dia.',
    variantes: [
      v('simbolo-tejnegro', 'TejNegro', undefined, 22000),
      v('simbolo-linmarcasc', 'LinMarCasc', undefined, 22000),
      v('simbolo-ribnegro', 'RibNegro', undefined, 18000),
      v('simbolo-linspancho', 'LinSpanCho', undefined, 18000),
      v('simbolo-ribmilitar', 'RibMilitar', undefined, 18000),
      v('simbolo-ribmarino', 'RibMarino', undefined, 18000),
    ],
  },
  {
    slug: 'reflejo',
    nombre: 'Reflejo',
    tipo: 'Top',
    detalle: 'Reversible',
    descripcion:
      'Top reversible que te ofrece dos looks en una sola prenda. Como el reflejo del agua, cada lado revela una nueva perspectiva.',
    imagenes: [
      '/images/models/reflejo/reflejo-1.webp',
      '/images/models/reflejo/reflejo-2.webp',
      '/images/models/reflejo/reflejo-3.webp',
      '/images/models/reflejo/reflejo-4.webp',
    ],
    variantes: [
      v('reflejo-linspancho-linspancho', 'LinSpanCho', 'LinSpanCho', 22000),
      v('reflejo-tejnegro-tusnegro', 'TejNegro', 'TusNegro', 22000),
      v('reflejo-tejmalva-ribmilitar', 'TejMalva', 'RibMilitar', 22000),
    ],
  },
  {
    slug: 'corazonada',
    nombre: 'Corazonada',
    tipo: 'Camisa',
    descripcion:
      'Camisa liviana como una corazonada certera. Su corte holgado permite que el aire circule libremente, como la naturaleza lo dispone.',
    variantes: [],
  },
  {
    slug: 'guerrera',
    nombre: 'Guerrera',
    tipo: 'Bermuda',
    descripcion:
      'Bermuda de corte relajado para la mujer guerrera. Enraizada en la comodidad, lista para explorar senderos y mercados.',
    imagenes: [
      '/images/models/guerrera/guerrera-1.webp',
      '/images/models/guerrera/guerrera-2.webp',
    ],
    variantes: [
      v('guerrera-gabaereo', 'GabAereo', undefined, 38000),
      v('guerrera-gabverde', 'GabVerde', undefined, 38000),
      v('guerrera-tusnegro', 'TusNegro', undefined, 38000),
      v('guerrera-tusazul', 'TusAzul', undefined, 38000),
    ],
  },
  {
    slug: 'simpleza',
    nombre: 'Simpleza',
    tipo: 'Short',
    detalle: 'Bolsillos',
    descripcion:
      'Short con bolsillos que celebra la belleza de lo simple. Comodo, funcional e ideal para los dias calidos.',
    imagenes: [
      '/images/models/simpleza/simpleza-1.webp',
      '/images/models/simpleza/simpleza-2.webp',
    ],
    variantes: [
      v('simpleza-gagazul', 'GabAzul', undefined, 35000),
      v('simpleza-gabverde', 'GabVerde', undefined, 35000),
    ],
  },
  {
    slug: 'dejavu',
    nombre: 'Dejavu',
    tipo: 'Palazzo',
    detalle: 'Bolsillos',
    descripcion:
      'Palazzo con bolsillos que evoca la sensacion de un dejavu. Su amplitud celebra la libertad de movimiento con funcionalidad.',
    imagenes: [
      '/images/models/dejavu/dejavu-1.webp',
      '/images/models/dejavu/dejavu-2.webp',
      '/images/models/dejavu/dejavu-3.webp',
      '/images/models/dejavu/dejavu-4.webp',
    ],
    variantes: [
      v('dejavu-gabaereo', 'GabAereo', undefined, 35000),
      v('dejavu-gabmilitar', 'GabMilitar', undefined, 45000),
      v('dejavu-gabneg', 'GabNeg', undefined, 45000),
      v('dejavu-tusmarino', 'TusMarino', undefined, 45000),
      v('dejavu-tusmaiz', 'TusMaiz', undefined, 45000),
    ],
  },
  {
    slug: 'luz-y-sombra',
    nombre: 'Luz y Sombra',
    tipo: 'Palazzo',
    detalle: 'Gajos',
    descripcion:
      'Palazzo de gajos que juega con la luz y la sombra. Su diseno unico crea un efecto visual que acompana cada paso con elegancia.',
    imagenes: [
      '/images/models/luz-y-sombra/luz-y-sombra-1.webp',
      '/images/models/luz-y-sombra/luz-y-sombra-2.webp',
      '/images/models/luz-y-sombra/luz-y-sombra-3.webp',
      '/images/models/luz-y-sombra/luz-y-sombra-4.webp',
      '/images/models/luz-y-sombra/luz-y-sombra-5.webp',
    ],
    variantes: [],
  },
  {
    slug: 'mistica',
    nombre: 'Mistica',
    tipo: 'Palazzo',
    detalle: 'Capri',
    descripcion:
      'Palazzo capri con un aire mistico y envolvente. Su largo intermedio es perfecto para transitar entre lo casual y lo elegante.',
    imagenes: [
      '/images/models/mistica/mistica-1.webp',
      '/images/models/mistica/mistica-2.webp',
      '/images/models/mistica/mistica-3.webp',
      '/images/models/mistica/mistica-4.webp',
      '/images/models/mistica/mistica-5.webp',
    ],
    variantes: [
      v('mistica-linmarmalv', 'LinMarMalv', undefined, 38000),
      v('mistica-linatenneg', 'LinAtenNeg', undefined, 38000),
      vSinStock('mistica-ribmarino', 'RibMarino'),
      vSinStock('mistica-ribnegro', 'RibNegro'),
    ],
  },
];

export function getModelBySlug(slug: string): ChamanaModel | undefined {
  return MODELOS.find((m) => m.slug === slug);
}

export function getVarianteById(model: ChamanaModel, varianteId: string): Variante | undefined {
  return model.variantes.find((v) => v.id === varianteId);
}

export function getModelsByTipo(tipo: string): ChamanaModel[] {
  return MODELOS.filter((m) => m.tipo.toLowerCase() === tipo.toLowerCase());
}

export function getAllProductImages(): { src: string; model: ChamanaModel }[] {
  return MODELOS.flatMap((model) => (model.imagenes ?? []).map((src) => ({ src, model })));
}

export function getModelMinPrice(model: ChamanaModel): number | undefined {
  const prices = model.variantes.map((v) => v.precio).filter((p): p is number => p != null);
  return prices.length > 0 ? Math.min(...prices) : undefined;
}

export function getModelMaxPrice(model: ChamanaModel): number | undefined {
  const prices = model.variantes.map((v) => v.precio).filter((p): p is number => p != null);
  return prices.length > 0 ? Math.max(...prices) : undefined;
}

export function getModelPriceDisplay(model: ChamanaModel): string {
  const min = getModelMinPrice(model);
  const max = getModelMaxPrice(model);
  if (min == null) return 'Consultar precio';
  if (min === max) return formatPrice(min);
  return `Desde ${formatPrice(min)}`;
}
