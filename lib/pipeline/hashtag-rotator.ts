/**
 * CHAMANA — Hashtag Rotator for Instagram
 *
 * Rotates through hashtag sets to avoid shadowbanning.
 * Reads from HASHTAG_LIBRARY.json structure.
 * Returns 20-25 hashtags per post + formatted for first comment.
 */

import type { CapaName } from './transmutacion-data';

// Hashtag pools (matches HASHTAG_LIBRARY.json, with ONDA→CAPA fix)
const POOLS = {
  brand: ['#chamana', '#chamanasomostodas', '#somosnaturaleza', '#colecciontransmutacion'],
  transmutacion: ['#transmutacion', '#otonoinvierno2026', '#chamana2026', '#naturalezaquesetransforma'],
  product_general: ['#ropaartesanal', '#modaartesanal', '#ropafemenina', '#ropadediseno', '#prendaartesanal'],
  fabric: ['#linopuro', '#telasnaturales', '#fibranatura', '#telaartesanal', '#ropadelin'],
  location: ['#capilladelmonte', '#cordobaargentina', '#sierrasdecordoba', '#disenoargentino', '#modaargentina', '#hechoenargentina'],
  lifestyle: ['#modaconsciente', '#slowfashion', '#modasustentable', '#mujeresreales', '#mujeresautenticas', '#feminidadsagrada'],
  process: ['#hechoamano', '#handmade', '#procesocreativo', '#artesanal', '#mujeresemprendedoras'],
  engagement: ['#outfitdeldia', '#looknatural', '#estilofemenino', '#inspiracionmoda'],
  seasonal: ['#otonoinvierno', '#modainvierno', '#abrigartesanal', '#calideznatural'],
  ugc: ['#MiTransmutacion', '#ChamanasReales', '#EstiloTransmutacion', '#4elementos'],
  capa: {
    tierra: ['#tierra', '#elementotierra', '#capatierra', '#loquenossostiene'],
    fuego: ['#fuego', '#elementofuego', '#capafuego', '#loquennostransforma'],
    agua: ['#agua', '#elementoagua', '#capaagua', '#loquefluye'],
    aire: ['#aire', '#elementoaire', '#capaaire', '#loquenoslibera'],
  },
  garments: {
    Obsidiana: '#CamperaObsidiana', Cuarzo: '#PantalonCuarzo',
    Escama: '#ChalecoEscama', Muda: '#CamisaMuda',
    Brasa: '#TopBrasa', Ceniza: '#MusculosaCeniza',
    Lava: '#SweaterLava', Semilla: '#RemeraSemilla',
    Cascada: '#PalazzoCascada', Llama: '#FaldaLlama',
    Crisalida: '#VestidoCrisalida', Perla: '#VestidoPerla',
    Fenix: '#VestidoFenix', Libelula: '#KimonoLibelula',
    Condor: '#PonchoCondor', Eclipse: '#TapadoEclipse',
    Pluma: '#BufandaPluma', Seda: '#ChalinaSeda',
  } as Record<string, string>,
};

export interface HashtagSet {
  name: string;
  tags: string[];
  formatted: string;       // Space-separated for caption
  firstComment: string;    // Dot-separated for first comment strategy
  count: number;
}

// 6 rotation sets — use a different one each post
const ROTATION_SETS = [
  { name: 'Set A', pools: ['brand', 'product_general', 'location', 'fabric', 'lifestyle'] },
  { name: 'Set B', pools: ['brand', 'process', 'engagement', 'seasonal', 'product_general'] },
  { name: 'Set C', pools: ['brand', 'lifestyle', 'location', 'engagement', 'fabric'] },
  { name: 'Set D', pools: ['brand', 'fabric', 'process', 'seasonal', 'lifestyle'] },
  { name: 'Set E', pools: ['brand', 'transmutacion', 'lifestyle', 'location'] },
  { name: 'Set F', pools: ['brand', 'transmutacion', 'ugc', 'engagement'] },
];

/**
 * Get a hashtag set for a Transmutacion post.
 *
 * @param rotationIndex — which set to use (0-5, cycles)
 * @param capa — optional, adds element-specific tags
 * @param garmentName — optional, adds garment-specific tag
 */
export function getHashtagSet(
  rotationIndex: number,
  capa?: CapaName,
  garmentName?: string,
): HashtagSet {
  const setDef = ROTATION_SETS[rotationIndex % ROTATION_SETS.length];
  const tags: string[] = [];

  // Add from each pool in the set
  for (const poolName of setDef.pools) {
    const pool = POOLS[poolName as keyof typeof POOLS];
    if (Array.isArray(pool)) {
      tags.push(...pool.slice(0, 4));
    }
  }

  // Add capa-specific tags
  if (capa) {
    tags.push(...POOLS.capa[capa]);
  }

  // Add garment-specific tag
  if (garmentName && POOLS.garments[garmentName]) {
    tags.push(POOLS.garments[garmentName]);
  }

  // Deduplicate and cap at 25
  const unique = [...new Set(tags)].slice(0, 25);

  return {
    name: setDef.name,
    tags: unique,
    formatted: unique.join(' '),
    firstComment: '.\n.\n.\n' + unique.join(' '),
    count: unique.length,
  };
}

/**
 * Get the recommended rotation index for today.
 * Cycles through sets daily so each post gets a different set.
 */
export function getTodayRotationIndex(): number {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(2026, 0, 1).getTime()) / (24 * 60 * 60 * 1000)
  );
  return dayOfYear % ROTATION_SETS.length;
}
