import { formatPrice } from '@/lib/utils';
import { TELAS, type Tela } from './fabrics';

export interface Variante {
  id: string;
  tela1: Tela;
  tela2?: Tela;
  precio?: number;
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

export const MODELOS: ChamanaModel[] = [
  {
    slug: 'hechizo',
    nombre: 'Hechizo',
    tipo: 'Falda',
    descripcion:
      'Falda que fluye con cada paso, como un hechizo tejido en tela. Su caida natural acompana el movimiento del cuerpo con gracia y soltura.',
    variantes: [
      v('hechizo-linmenchoc', 'LinMenChoc'),
      v('hechizo-linmarcho', 'LinMarCho'),
      v('hechizo-linmarmalv', 'LinMarMalv'),
      v('hechizo-linatenneg', 'LinAtenNeg'),
    ],
  },
  {
    slug: 'sagrada',
    nombre: 'Sagrada',
    tipo: 'Vestido',
    descripcion:
      'Vestido que envuelve el cuerpo como un abrazo sagrado. Cada puntada honra la conexion entre la mujer y la naturaleza.',
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
    ],
    variantes: [
      v('intuicion-ribmarino', 'RibMarino'),
      v('intuicion-linmengris', 'LinMenGris'),
      v('intuicion-fibceleste', 'FibCeleste'),
      v('intuicion-tejmalva', 'TejMalva'),
      v('intuicion-linmarneg', 'LinMarNeg'),
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
    ],
    variantes: [
      v('sabia-tejnegro', 'TejNegro'),
      v('sabia-ribnegro', 'RibNegro'),
      v('sabia-ribmarino', 'RibMarino'),
      v('sabia-linmengris', 'LinMenGris'),
      v('sabia-tejmalva', 'TejMalva'),
      v('sabia-tusnegro', 'TusNegro'),
      v('sabia-linmarcho', 'LinMarCho'),
      v('sabia-linmenverde', 'LinMenVerde'),
      v('sabia-ribmilitar', 'RibMilitar'),
      v('sabia-linmarcasc', 'LinMarCasc'),
      v('sabia-linmarmalv', 'LinMarMalv'),
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
      v('magnetica-linspanbei', 'LinSpanBei'),
      v('magnetica-linmengris', 'LinMenGris'),
      v('magnetica-linmarneg', 'LinMarNeg'),
      v('magnetica-linmarcasc', 'LinMarCasc'),
      v('magnetica-tejmalva', 'TejMalva'),
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
    ],
    variantes: [
      v('espejo-ribmilitar-tejnegro', 'RibMilitar', 'TejNegro'),
      v('espejo-ribnegro-ribmarino', 'RibNegro', 'RibMarino'),
      v('espejo-ribmilitar-ribnegro', 'RibMilitar', 'RibNegro'),
      v('espejo-ribmilitar-tejmalva', 'RibMilitar', 'TejMalva'),
      v('espejo-linmarcasc-tejmalva', 'LinMarCasc', 'TejMalva'),
      v('espejo-linspanbei-linmarcasc', 'LinSpanBei', 'LinMarCasc'),
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
      v('simbolo-tejnegro', 'TejNegro'),
      v('simbolo-linmarcasc', 'LinMarCasc'),
      v('simbolo-ribnegro', 'RibNegro'),
      v('simbolo-linspancho', 'LinSpanCho'),
      v('simbolo-ribmilitar', 'RibMilitar'),
      v('simbolo-ribmarino', 'RibMarino'),
    ],
  },
  {
    slug: 'reflejo',
    nombre: 'Reflejo',
    tipo: 'Top',
    detalle: 'Reversible',
    descripcion:
      'Top reversible que te ofrece dos looks en una sola prenda. Como el reflejo del agua, cada lado revela una nueva perspectiva.',
    imagenes: ['/images/models/reflejo/reflejo-1.webp', '/images/models/reflejo/reflejo-2.webp'],
    variantes: [
      v('reflejo-linspancho-linspancho', 'LinSpanCho', 'LinSpanCho'),
      v('reflejo-tejnegro-tusnegro', 'TejNegro', 'TusNegro'),
      v('reflejo-tejmalva-ribmilitar', 'TejMalva', 'RibMilitar'),
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
      v('guerrera-gabaereo', 'GabAereo'),
      v('guerrera-gabverde', 'GabVerde'),
      v('guerrera-tusnegro', 'TusNegro'),
      v('guerrera-tusazul', 'TusAzul'),
    ],
  },
  {
    slug: 'simpleza',
    nombre: 'Simpleza',
    tipo: 'Short',
    detalle: 'Bolsillos',
    descripcion:
      'Short con bolsillos que celebra la belleza de lo simple. Comodo, funcional e ideal para los dias calidos.',
    variantes: [v('simpleza-gagazul', 'GabAzul'), v('simpleza-gabverde', 'GabVerde')],
  },
  {
    slug: 'dejavu',
    nombre: 'Dejavu',
    tipo: 'Palazzo',
    detalle: 'Bolsillos',
    descripcion:
      'Palazzo con bolsillos que evoca la sensacion de un dejavu. Su amplitud celebra la libertad de movimiento con funcionalidad.',
    imagenes: ['/images/models/dejavu/dejavu-1.webp', '/images/models/dejavu/dejavu-2.webp'],
    variantes: [
      v('dejavu-gabaereo', 'GabAereo'),
      v('dejavu-gabmilitar', 'GabMilitar'),
      v('dejavu-gabneg', 'GabNeg'),
      v('dejavu-tusmarino', 'TusMarino'),
      v('dejavu-tusmaiz', 'TusMaiz'),
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
    variantes: [
      v('mistica-linmarmalv', 'LinMarMalv'),
      v('mistica-linatenneg', 'LinAtenNeg'),
      v('mistica-ribmarino', 'RibMarino'),
      v('mistica-ribnegro', 'RibNegro'),
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
