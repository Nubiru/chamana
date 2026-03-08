/**
 * Coleccion Transmutacion — Static Data
 *
 * 18 garments across 4 "Capas" (layers/elements).
 * Source of truth for captions, hashtags, marketing packets.
 *
 * IMPORTANT: "Capa" not "Onda" — renamed by Cintia 2026-03-07.
 */

export type CapaName = 'tierra' | 'fuego' | 'agua' | 'aire';

export interface TransmutacionGarment {
  name: string;
  type: string;
  fullName: string;
  capa: CapaName;
  caption: string;
  transformationStory: string;
  fabrics: string[];
}

export interface Capa {
  name: CapaName;
  displayName: string;
  subtitle: string;
  launchDate: string; // Luna Nueva 2026
  element: string;
  garments: string[]; // garment names
}

// Cintia's vocabulary — infuse into all content
export const VOCABULARIO = [
  'transmutacion', 'renacer', 'naturaleza', 'camino', 'amor', 'vida', 'cielo',
  'obsidiana', 'ceniza', 'fuego', 'mariposa', 'oruga', 'cambiar de piel',
  'versatil', 'movimiento', 'fluir', 'transformacion', 'viaje', 'universo',
  'galaxia', 'constelacion', 'paraiso', 'paz', 'sanar', 'reflejo',
  'semilla', 'flor', 'orbita', 'resplandor', 'ambar',
] as const;

// Vocabulary clustered by theme (for caption generation)
export const VOCAB_CLUSTERS = {
  tierra: ['naturaleza', 'camino', 'obsidiana', 'semilla', 'reflejo', 'ambar', 'paz'],
  fuego: ['fuego', 'ceniza', 'transformacion', 'resplandor', 'renacer', 'cambiar de piel'],
  agua: ['fluir', 'movimiento', 'viaje', 'camino', 'sanar', 'vida'],
  aire: ['cielo', 'universo', 'galaxia', 'constelacion', 'paraiso', 'orbita', 'renacer'],
} as const;

export const CAPAS: Capa[] = [
  {
    name: 'tierra',
    displayName: 'CAPA TIERRA',
    subtitle: 'Lo que nos sostiene',
    launchDate: '2026-04-12',
    element: 'Tierra',
    garments: ['Obsidiana', 'Cuarzo', 'Escama', 'Muda'],
  },
  {
    name: 'fuego',
    displayName: 'CAPA FUEGO',
    subtitle: 'Lo que nos transforma',
    launchDate: '2026-05-12',
    element: 'Fuego',
    garments: ['Brasa', 'Ceniza', 'Lava', 'Semilla'],
  },
  {
    name: 'agua',
    displayName: 'CAPA AGUA',
    subtitle: 'Lo que fluye y nos mueve',
    launchDate: '2026-06-10',
    element: 'Agua',
    garments: ['Cascada', 'Llama', 'Crisalida', 'Perla'],
  },
  {
    name: 'aire',
    displayName: 'CAPA AIRE',
    subtitle: 'Lo que nos libera',
    launchDate: '2026-07-10',
    element: 'Aire',
    garments: ['Fenix', 'Libelula', 'Condor', 'Eclipse', 'Pluma', 'Seda'],
  },
];

export const GARMENTS: TransmutacionGarment[] = [
  // CAPA TIERRA
  {
    name: 'Obsidiana', type: 'Campera', fullName: 'Campera Obsidiana',
    capa: 'tierra',
    caption: 'El volcan te hizo inquebrantable.',
    transformationStory: 'La roca se derrite dentro del volcan y renace como obsidiana — negra, lisa, inquebrantable.',
    fabrics: ['franela', 'algodon grueso'],
  },
  {
    name: 'Cuarzo', type: 'Pantalon', fullName: 'Pantalon Cuarzo',
    capa: 'tierra',
    caption: 'La estructura que te sostiene cuando todo tiembla.',
    transformationStory: 'Bajo presion y calor, la arena comun se convierte en cristal de cuarzo — transparente, fuerte, luminoso.',
    fabrics: ['gabardina', 'algodon crudo'],
  },
  {
    name: 'Escama', type: 'Chaleco', fullName: 'Chaleco Escama',
    capa: 'tierra',
    caption: 'Cada capa que te protege es una que elegiste.',
    transformationStory: 'La escama protege sin rigidez — se mueve con el cuerpo, se renueva con el tiempo.',
    fabrics: ['lana', 'tejido'],
  },
  {
    name: 'Muda', type: 'Camisa', fullName: 'Camisa Muda',
    capa: 'tierra',
    caption: 'Cambiar de piel es un acto de valentia silenciosa.',
    transformationStory: 'La serpiente muda su piel para seguir creciendo — soltar lo viejo es el primer acto de renacer.',
    fabrics: ['lino', 'algodon'],
  },
  // CAPA FUEGO
  {
    name: 'Brasa', type: 'Top', fullName: 'Top Brasa',
    capa: 'fuego',
    caption: 'El calor que importa es el que nace adentro.',
    transformationStory: 'La brasa no es fuego visible — es calor que queda, que transforma desde adentro sin gritar.',
    fabrics: ['jersey', 'algodon'],
  },
  {
    name: 'Ceniza', type: 'Musculosa', fullName: 'Musculosa Ceniza',
    capa: 'fuego',
    caption: 'Lo que queda despues del fuego es lo esencial.',
    transformationStory: 'La ceniza es el residuo del fuego — lo que sobrevive a la quema es lo mas puro.',
    fabrics: ['jersey', 'algodon crudo'],
  },
  {
    name: 'Lava', type: 'Sweater', fullName: 'Sweater Lava',
    capa: 'fuego',
    caption: 'Todo lo que fluye de tu centro transforma lo que toca.',
    transformationStory: 'La lava nace del corazon de la tierra y al enfriarse crea suelo nuevo — destruccion que es creacion.',
    fabrics: ['lana gruesa', 'alpaca'],
  },
  {
    name: 'Semilla', type: 'Remera', fullName: 'Remera Semilla',
    capa: 'fuego',
    caption: 'Tu potencial duerme hasta que decidis despertar.',
    transformationStory: 'La semilla se rompe para que nazca la raiz — el potencial mas grande vive en lo mas pequeno.',
    fabrics: ['algodon', 'jersey'],
  },
  // CAPA AGUA
  {
    name: 'Cascada', type: 'Palazzo', fullName: 'Palazzo Cascada',
    capa: 'agua',
    caption: 'Caer libre es la forma mas valiente de fluir.',
    transformationStory: 'El agua no lucha contra la piedra — la transforma gota a gota, fluyendo siempre hacia abajo.',
    fabrics: ['lino puro', 'algodon crudo'],
  },
  {
    name: 'Llama', type: 'Falda', fullName: 'Falda Llama',
    capa: 'agua',
    caption: 'Danzas mientras ardes. Ese es tu poder.',
    transformationStory: 'La llama es fuego en movimiento — danza mientras transforma, nunca se queda quieta.',
    fabrics: ['lino', 'gasa'],
  },
  {
    name: 'Crisalida', type: 'Vestido', fullName: 'Vestido Crisalida',
    capa: 'agua',
    caption: 'El silencio antes de la transformacion es sagrado.',
    transformationStory: 'La crisalida es el momento entre oruga y mariposa — quietud que esconde la transformacion mas profunda.',
    fabrics: ['algodon envolvente', 'jersey'],
  },
  {
    name: 'Perla', type: 'Vestido', fullName: 'Vestido Perla',
    capa: 'agua',
    caption: 'Tu dolor se convirtio en tu belleza.',
    transformationStory: 'La ostra recibe una herida y la convierte en perla — el dolor es el origen de la belleza.',
    fabrics: ['seda', 'algodon'],
  },
  // CAPA AIRE
  {
    name: 'Fenix', type: 'Vestido largo', fullName: 'Vestido Fenix',
    capa: 'aire',
    caption: 'Naciste para renacer de tus propias cenizas.',
    transformationStory: 'El fenix renace de sus propias cenizas — cada final es un nuevo comienzo mas luminoso.',
    fabrics: ['lino largo', 'gasa'],
  },
  {
    name: 'Libelula', type: 'Kimono', fullName: 'Kimono Libelula',
    capa: 'aire',
    caption: 'Tus alas no necesitan permiso para abrirse.',
    transformationStory: 'La libelula nace en el agua y conquista el aire — cambiar de elemento es su naturaleza.',
    fabrics: ['lino puro', 'algodon liviano'],
  },
  {
    name: 'Condor', type: 'Poncho', fullName: 'Poncho Condor',
    capa: 'aire',
    caption: 'Envolvete en las alas de las alturas.',
    transformationStory: 'El condor vuela sin aletear — se deja llevar por las corrientes, confia en el aire.',
    fabrics: ['alpaca', 'lana'],
  },
  {
    name: 'Eclipse', type: 'Tapado', fullName: 'Tapado Eclipse',
    capa: 'aire',
    caption: 'La luz mas poderosa es la que escondiste adentro.',
    transformationStory: 'El eclipse es oscuridad que revela — cuando se oculta la luz, se ve lo que brilla por cuenta propia.',
    fabrics: ['pano', 'lana gruesa'],
  },
  {
    name: 'Pluma', type: 'Bufanda', fullName: 'Bufanda Pluma',
    capa: 'aire',
    caption: 'Tan liviana como la decision de ser libre.',
    transformationStory: 'La pluma es lo mas liviano del ave — el desprendimiento que permite el vuelo.',
    fabrics: ['alpaca', 'lana baby'],
  },
  {
    name: 'Seda', type: 'Chalina', fullName: 'Chalina Seda',
    capa: 'aire',
    caption: 'De gusano a elegancia. Esa es tu historia.',
    transformationStory: 'El gusano de seda se transforma por completo — lo que produce es pura suavidad.',
    fabrics: ['seda', 'algodon pima'],
  },
];

// Helpers
export function getGarment(name: string): TransmutacionGarment | undefined {
  return GARMENTS.find(g => g.name.toLowerCase() === name.toLowerCase());
}

export function getGarmentsByCapa(capa: CapaName): TransmutacionGarment[] {
  return GARMENTS.filter(g => g.capa === capa);
}

export function getCapa(name: CapaName): Capa | undefined {
  return CAPAS.find(c => c.name === name);
}
