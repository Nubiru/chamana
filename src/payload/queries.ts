import type { ChamanaModel, Variante } from '@/domain/catalog';
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  SITE_URL,
  WHATSAPP_NUMBER,
} from '@/lib/config';
import type { CollectionMeta } from '@/lib/data/collections';
import type { Tela } from '@/lib/data/fabrics';
import type { FAQ } from '@/lib/data/faqs';
import type { Guarantee } from '@/lib/data/guarantees';
import type { SizeGuideEntry } from '@/lib/data/size-guide';
import { STATIC_MODEL_IMAGES } from '@/payload/static-image-fallback';
import config from '@payload-config';
import { getPayload } from 'payload';

// ─── Payload instance (cached per request) ───

async function getPayloadClient() {
  return getPayload({ config });
}

// Safe query wrapper — returns fallback if DB tables don't exist yet (first deploy before seed)
function isTableMissingError(err: unknown): boolean {
  if (!(err instanceof Error)) return String(err).includes('does not exist');
  const msg = err.message;
  // Postgres dialect: relation absent.
  if (msg.includes('does not exist') || msg.includes('relation')) return true;
  // SQLite/libsql dialect: empty/schemaless DB (e.g. CI build with no POSTGRES_URL
  // falls back to sqliteAdapter against a fresh, unmigrated chamana.db). The libsql
  // message is 'SQLITE_ERROR: no such table: <name>'; match the dialect's missing-
  // table signature only — NOT the generic SQLITE_ERROR code (which also covers
  // syntax errors), so genuine errors still surface.
  if (msg.includes('no such table')) return true;
  // Payload wraps PostgreSQL/libsql errors — check the cause chain
  const cause = (err as Error & { cause?: unknown }).cause;
  if (cause) return isTableMissingError(cause);
  return false;
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (isTableMissingError(err)) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[Payload] DB tables not ready, returning fallback:', msg.slice(0, 80));
      return fallback;
    }
    throw err;
  }
}

// ─── Type adapters: Payload → storefront interfaces ───

function adaptTela(doc: Record<string, unknown>): Tela {
  return {
    codigo: doc.codigo as string,
    tipo: doc.tipo as string,
    subtipo: (doc.subtipo as string) || undefined,
    color: doc.color as string,
    colorHex: doc.colorHex as string,
  };
}

function adaptVariante(v: Record<string, unknown>): Variante {
  const tela1Raw = v.tela1 as Record<string, unknown> | string;
  const tela2Raw = v.tela2 as Record<string, unknown> | string | null;

  return {
    id: v.varianteId as string,
    tela1: typeof tela1Raw === 'object' ? adaptTela(tela1Raw) : ({ codigo: tela1Raw } as Tela),
    ...(tela2Raw && typeof tela2Raw === 'object' ? { tela2: adaptTela(tela2Raw) } : {}),
    ...(v.precio != null ? { precio: v.precio as number } : {}),
    ...(v.precioAnterior != null ? { precioAnterior: v.precioAnterior as number } : {}),
    ...(v.descuento != null ? { descuento: v.descuento as number } : {}),
    ...(v.sinStock ? { sinStock: true } : {}),
  };
}

function adaptModelo(doc: Record<string, unknown>): ChamanaModel {
  const variantes = (doc.variantes as Record<string, unknown>[]) || [];
  const imagenes = (doc.imagenes as Array<{ imagen: Record<string, unknown> | string }>) || [];

  // Extract image URLs from Payload upload objects or fall back to static paths
  const imageUrls = imagenes
    .map((img) => {
      if (typeof img.imagen === 'object' && img.imagen?.url) {
        return img.imagen.url as string;
      }
      return null;
    })
    .filter((url): url is string => url !== null);

  return {
    slug: doc.slug as string,
    nombre: doc.nombre as string,
    tipo: doc.tipo as string,
    ...(doc.detalle ? { detalle: doc.detalle as string } : {}),
    descripcion: doc.descripcion as string,
    variantes: variantes.map(adaptVariante),
    ...(imageUrls.length > 0
      ? { imagenes: imageUrls }
      : { imagenes: STATIC_MODEL_IMAGES[doc.slug as string] ?? [] }),
    ...(doc.badge ? { badge: doc.badge as string } : {}),
    ...(doc.featured ? { featured: true } : {}),
    ...(doc.bundleId ? { bundleId: doc.bundleId as string } : {}),
  };
}

// ─── Product queries ───

export async function getModelos(): Promise<ChamanaModel[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'modelos',
      limit: 100,
      depth: 2, // populate tela1/tela2 relationships
      sort: 'nombre',
    });
    return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>));
  }, []);
}

export async function getModeloBySlug(slug: string): Promise<ChamanaModel | undefined> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'modelos',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    if (result.docs.length === 0) return undefined;
    return adaptModelo(result.docs[0] as unknown as Record<string, unknown>);
  }, undefined);
}

export async function getModelosFeatured(): Promise<ChamanaModel[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'modelos',
      where: { featured: { equals: true } },
      limit: 100,
      depth: 2,
    });
    return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>));
  }, []);
}

export async function getModelosByTipo(tipo: string): Promise<ChamanaModel[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'modelos',
      where: { tipo: { equals: tipo } },
      limit: 100,
      depth: 2,
    });
    return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>));
  }, []);
}

// ─── Fabric queries ───

export async function getTelas(): Promise<Record<string, Tela>> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'telas',
      limit: 100,
    });
    const record: Record<string, Tela> = {};
    for (const doc of result.docs) {
      const tela = adaptTela(doc as unknown as Record<string, unknown>);
      record[tela.codigo] = tela;
    }
    return record;
  }, {});
}

// ─── Category helpers (derived from modelos) ───

export async function getCategorias(): Promise<{ slug: string; nombre: string; count: number }[]> {
  const modelos = await getModelos();
  const counts = new Map<string, number>();
  for (const m of modelos) {
    counts.set(m.tipo, (counts.get(m.tipo) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([nombre, count]) => ({
      slug: nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, ''),
      nombre,
      count,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// ─── Collection queries ───

// Collection visibility — single source of truth. `archivo` is hidden from the storefront;
// drafts (planificacion) + produccion + activa all surface.
export const PUBLIC_COLECCION_ESTADOS = ['planificacion', 'produccion', 'activa'] as const;

export function isPublicColeccion(estado: CollectionMeta['estado']): boolean {
  return (PUBLIC_COLECCION_ESTADOS as readonly string[]).includes(estado);
}

// Within-year ordering: otono-invierno (the later season) sorts before primavera-verano so the
// newest collection of a given year leads. Combined with anio-desc this yields newest-first.
const TEMPORADA_ORDINAL: Record<CollectionMeta['temporada'], number> = {
  'primavera-verano': 0,
  'otono-invierno': 1,
};

// Extracted so getColecciones + getColeccionBySlug share one Payload→CollectionMeta mapping.
function adaptColeccion(doc: Record<string, unknown>): CollectionMeta {
  return {
    slug: doc.slug as string,
    nombre: doc.nombre as string,
    nombreCompleto: doc.nombreCompleto as string,
    temporada: doc.temporada as CollectionMeta['temporada'],
    anio: doc.anio as number,
    estado: doc.estado as CollectionMeta['estado'],
    descripcion: doc.descripcion as string,
    ejes: ((doc.ejes as Array<{ eje: string }>) || []).map((e) => e.eje),
  };
}

export async function getColecciones(): Promise<CollectionMeta[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'colecciones',
      where: { estado: { in: [...PUBLIC_COLECCION_ESTADOS] } },
      limit: 50,
    });
    return result.docs
      .map((doc) => adaptColeccion(doc as unknown as Record<string, unknown>))
      .sort(
        (a, b) => b.anio - a.anio || TEMPORADA_ORDINAL[b.temporada] - TEMPORADA_ORDINAL[a.temporada]
      );
  }, []);
}

export async function getColeccionBySlug(slug: string): Promise<CollectionMeta | undefined> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'colecciones',
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (result.docs.length === 0) return undefined;
    return adaptColeccion(result.docs[0] as unknown as Record<string, unknown>);
  }, undefined);
}

// Two-step join (mirrors getModelosByTipo): resolve the coleccion doc id from the slug, then
// read the modelos whose `coleccion` relationship equals that id. The relation stores the id,
// so `equals: id` is the adapter-agnostic filter.
export async function getModelosByColeccion(coleccionSlug: string): Promise<ChamanaModel[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const coleccionResult = await payload.find({
      collection: 'colecciones',
      where: { slug: { equals: coleccionSlug } },
      limit: 1,
    });
    if (coleccionResult.docs.length === 0) return [];
    const coleccionId = (coleccionResult.docs[0] as { id: number | string }).id;
    const result = await payload.find({
      collection: 'modelos',
      where: { coleccion: { equals: coleccionId } },
      depth: 2,
      limit: 100,
      sort: 'nombre',
    });
    return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>));
  }, []);
}

// ─── FAQ queries ───

export async function getFAQsGlobal(): Promise<FAQ[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.findGlobal({ slug: 'preguntas-frecuentes' });
    const faqs = (result.faqs as Array<Record<string, unknown>>) || [];
    return faqs.map((f, i) => ({
      id: `faq-${i}`,
      pregunta: f.pregunta as string,
      respuesta: f.respuesta as string,
      global: f.global as boolean | undefined,
      categorias: f.categorias as string[] | undefined,
    }));
  }, []);
}

export async function getFAQsForProduct(tipo: string): Promise<FAQ[]> {
  const allFaqs = await getFAQsGlobal();
  return allFaqs.filter(
    (faq) => faq.global || faq.categorias?.some((c) => c.toLowerCase() === tipo.toLowerCase())
  );
}

// ─── Guarantee queries ───

export async function getGarantias(): Promise<Guarantee[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.findGlobal({ slug: 'garantias' });
    const garantias = (result.garantias as Array<Record<string, unknown>>) || [];
    return garantias.map((g) => ({
      id: (g.nombre as string).toLowerCase().replace(/\s+/g, '-'),
      nombre: g.nombre as string,
      titulo: g.titulo as string,
      descripcion: g.descripcion as string,
      detalle: g.detalle as string,
      iconName: g.iconName as Guarantee['iconName'],
    }));
  }, []);
}

// ─── Size guide queries ───

export async function getSizeGuide(tipo: string): Promise<SizeGuideEntry | undefined> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.findGlobal({ slug: 'guia-talles' });
    const entradas = (result.entradas as Array<Record<string, unknown>>) || [];
    const entry = entradas.find((e) => (e.tipo as string).toLowerCase() === tipo.toLowerCase());
    if (!entry) return undefined;
    return {
      tipo: entry.tipo as string,
      talleUnico: entry.talleUnico as boolean,
      medidas: (entry.medidas as Array<{ label: string; valor: string }>) || [],
      notas: (entry.notas as string) || undefined,
    };
  }, undefined);
}

export async function getAllSizeGuides(): Promise<SizeGuideEntry[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.findGlobal({ slug: 'guia-talles' });
    const entradas = (result.entradas as Array<Record<string, unknown>>) || [];
    return entradas.map((entry) => ({
      tipo: entry.tipo as string,
      talleUnico: entry.talleUnico as boolean,
      medidas: (entry.medidas as Array<{ label: string; valor: string }>) || [],
      notas: (entry.notas as string) || undefined,
    }));
  }, []);
}

// ─── Site config ───

export interface SiteConfig {
  nombreMarca: string;
  descripcionMarca: string;
  whatsappNumero: string;
  whatsappMensajeGeneral: string;
  instagramHandle: string;
  instagramUrl: string;
  siteUrl: string;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return safeQuery(
    async () => {
      const payload = await getPayloadClient();
      const result = await payload.findGlobal({ slug: 'configuracion-sitio' });
      return {
        nombreMarca: (result.nombreMarca as string) || BRAND_NAME,
        descripcionMarca: (result.descripcionMarca as string) || BRAND_DESCRIPTION,
        whatsappNumero: (result.whatsappNumero as string) || WHATSAPP_NUMBER,
        whatsappMensajeGeneral: (result.whatsappMensajeGeneral as string) || '',
        instagramHandle: (result.instagramHandle as string) || INSTAGRAM_HANDLE,
        instagramUrl: (result.instagramUrl as string) || INSTAGRAM_URL,
        siteUrl: (result.siteUrl as string) || SITE_URL,
      };
    },
    {
      nombreMarca: BRAND_NAME,
      descripcionMarca: BRAND_DESCRIPTION,
      whatsappNumero: WHATSAPP_NUMBER,
      whatsappMensajeGeneral: '',
      instagramHandle: INSTAGRAM_HANDLE,
      instagramUrl: INSTAGRAM_URL,
      siteUrl: SITE_URL,
    }
  );
}

// ─── Homepage content ───

export interface ContenidoInicio {
  subtitulo: string;
}

// The current homepage hero copy. Doubles as the fallback so an unseeded global
// (first deploy before seed) or an empty subtitulo field never renders a blank
// hero — the storefront keeps today's copy until Daniela edits it in admin
// (DATA TRUTH: no blank-on-empty). Mirrors getSiteConfig's constant-fallback shape.
export const HERO_SUBTITULO_FALLBACK =
  'Ropa femenina artesanal inspirada en la naturaleza. Cada prenda es una expresión de sensibilidad, fluidez y fuerza.';

export async function getContenidoInicio(): Promise<ContenidoInicio> {
  return safeQuery(
    async () => {
      const payload = await getPayloadClient();
      const result = await payload.findGlobal({ slug: 'contenido-inicio' });
      return {
        subtitulo: (result.subtitulo as string) || HERO_SUBTITULO_FALLBACK,
      };
    },
    {
      subtitulo: HERO_SUBTITULO_FALLBACK,
    }
  );
}

// ─── Desfile/Event queries ───

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

export async function getDesfileBySlug(slug: string): Promise<DesfileEvent | undefined> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'eventos',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    if (result.docs.length === 0) return undefined;
    const doc = result.docs[0] as unknown as Record<string, unknown>;
    const images = (doc.images as Array<Record<string, unknown>>) || [];

    const resolvedImages: DesfileImage[] =
      images.length > 0
        ? images.map((img, i) => {
            const imageDoc = img.image as Record<string, unknown> | string;
            const src =
              typeof imageDoc === 'object' && imageDoc?.url
                ? (imageDoc.url as string)
                : `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`;
            return {
              id: i + 1,
              src,
              alt: (img.alt as string) || `Desfile CHAMANA - foto ${i + 1}`,
            };
          })
        : Array.from({ length: 19 }, (_, i) => ({
            id: i + 1,
            src: `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`,
            alt: `Desfile CHAMANA en Utopía – foto ${i + 1}`,
          }));

    return {
      slug: doc.slug as string,
      title: doc.title as string,
      displayDate: doc.displayDate as string,
      location: doc.location as string,
      description: doc.description as string,
      images: resolvedImages,
    };
  }, undefined);
}

export async function getDesfileEvents(): Promise<DesfileEvent[]> {
  return safeQuery(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'eventos',
      limit: 100,
      depth: 1,
    });
    return result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>;
      const images = (d.images as Array<Record<string, unknown>>) || [];

      // If no images uploaded to Payload, fall back to static paths (19 desfile images)
      const resolvedImages: DesfileImage[] =
        images.length > 0
          ? images.map((img, i) => {
              const imageDoc = img.image as Record<string, unknown> | string;
              const src =
                typeof imageDoc === 'object' && imageDoc?.url
                  ? (imageDoc.url as string)
                  : `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`;
              return {
                id: i + 1,
                src,
                alt: (img.alt as string) || `Desfile CHAMANA - foto ${i + 1}`,
              };
            })
          : Array.from({ length: 19 }, (_, i) => ({
              id: i + 1,
              src: `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`,
              alt: `Desfile CHAMANA en Utopía – foto ${i + 1}`,
            }));

      return {
        slug: d.slug as string,
        title: d.title as string,
        displayDate: d.displayDate as string,
        location: d.location as string,
        description: d.description as string,
        images: resolvedImages,
      };
    });
  }, []);
}

// ─── Price helpers (re-exported from the catalog domain for server-page convenience) ───

export { getModelMinPrice, getModelMaxPrice } from '@/domain/catalog';
