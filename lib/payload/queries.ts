import { getPayload } from 'payload'
import config from '@payload-config'
import type { Tela } from '@/lib/data/fabrics'
import type { ChamanaModel, Variante } from '@/lib/data/products'
import type { FAQ } from '@/lib/data/faqs'
import type { Guarantee } from '@/lib/data/guarantees'
import type { SizeGuideEntry } from '@/lib/data/size-guide'
import type { CollectionMeta } from '@/lib/data/collections'

// ─── Payload instance (cached per request) ───

async function getPayloadClient() {
  return getPayload({ config })
}

// ─── Type adapters: Payload → storefront interfaces ───

function adaptTela(doc: Record<string, unknown>): Tela {
  return {
    codigo: doc.codigo as string,
    tipo: doc.tipo as string,
    subtipo: (doc.subtipo as string) || undefined,
    color: doc.color as string,
    colorHex: doc.colorHex as string,
  }
}

function adaptVariante(v: Record<string, unknown>): Variante {
  const tela1Raw = v.tela1 as Record<string, unknown> | string
  const tela2Raw = v.tela2 as Record<string, unknown> | string | null

  return {
    id: v.varianteId as string,
    tela1: typeof tela1Raw === 'object' ? adaptTela(tela1Raw) : ({ codigo: tela1Raw } as Tela),
    ...(tela2Raw && typeof tela2Raw === 'object' ? { tela2: adaptTela(tela2Raw) } : {}),
    ...(v.precio != null ? { precio: v.precio as number } : {}),
    ...(v.precioAnterior != null ? { precioAnterior: v.precioAnterior as number } : {}),
    ...(v.descuento != null ? { descuento: v.descuento as number } : {}),
    ...(v.sinStock ? { sinStock: true } : {}),
  }
}

function adaptModelo(doc: Record<string, unknown>): ChamanaModel {
  const variantes = (doc.variantes as Record<string, unknown>[]) || []
  const imagenes = (doc.imagenes as Array<{ imagen: Record<string, unknown> | string }>) || []

  // Extract image URLs from Payload upload objects or fall back to static paths
  const imageUrls = imagenes
    .map((img) => {
      if (typeof img.imagen === 'object' && img.imagen?.url) {
        return img.imagen.url as string
      }
      return null
    })
    .filter((url): url is string => url !== null)

  return {
    slug: doc.slug as string,
    nombre: doc.nombre as string,
    tipo: doc.tipo as string,
    ...(doc.detalle ? { detalle: doc.detalle as string } : {}),
    descripcion: doc.descripcion as string,
    variantes: variantes.map(adaptVariante),
    ...(imageUrls.length > 0 ? { imagenes: imageUrls } : {}),
    ...(doc.badge ? { badge: doc.badge as string } : {}),
    ...(doc.featured ? { featured: true } : {}),
    ...(doc.bundleId ? { bundleId: doc.bundleId as string } : {}),
  }
}

// ─── Product queries ───

export async function getModelos(): Promise<ChamanaModel[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'modelos',
    limit: 100,
    depth: 2, // populate tela1/tela2 relationships
    sort: 'nombre',
  })
  return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>))
}

export async function getModeloBySlug(slug: string): Promise<ChamanaModel | undefined> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'modelos',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  if (result.docs.length === 0) return undefined
  return adaptModelo(result.docs[0] as unknown as Record<string, unknown>)
}

export async function getModelosFeatured(): Promise<ChamanaModel[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'modelos',
    where: { featured: { equals: true } },
    limit: 100,
    depth: 2,
  })
  return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>))
}

export async function getModelosByTipo(tipo: string): Promise<ChamanaModel[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'modelos',
    where: { tipo: { equals: tipo } },
    limit: 100,
    depth: 2,
  })
  return result.docs.map((doc) => adaptModelo(doc as unknown as Record<string, unknown>))
}

// ─── Fabric queries ───

export async function getTelas(): Promise<Record<string, Tela>> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'telas',
    limit: 100,
  })
  const record: Record<string, Tela> = {}
  for (const doc of result.docs) {
    const tela = adaptTela(doc as unknown as Record<string, unknown>)
    record[tela.codigo] = tela
  }
  return record
}

// ─── Category helpers (derived from modelos) ───

export async function getCategorias(): Promise<{ slug: string; nombre: string; count: number }[]> {
  const modelos = await getModelos()
  const counts = new Map<string, number>()
  for (const m of modelos) {
    counts.set(m.tipo, (counts.get(m.tipo) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([nombre, count]) => ({
      slug: nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      nombre,
      count,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

// ─── Collection queries ───

export async function getColecciones(): Promise<CollectionMeta[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'colecciones',
    limit: 10,
  })
  return result.docs.map((doc) => ({
    slug: doc.slug,
    nombre: doc.nombre,
    nombreCompleto: doc.nombreCompleto,
    temporada: doc.temporada as CollectionMeta['temporada'],
    anio: doc.anio,
    estado: doc.estado as CollectionMeta['estado'],
    descripcion: doc.descripcion,
    ejes: ((doc.ejes as Array<{ eje: string }>) || []).map((e) => e.eje),
  }))
}

// ─── FAQ queries ───

export async function getFAQsGlobal(): Promise<FAQ[]> {
  const payload = await getPayloadClient()
  const result = await payload.findGlobal({ slug: 'preguntas-frecuentes' })
  const faqs = (result.faqs as Array<Record<string, unknown>>) || []
  return faqs.map((f, i) => ({
    id: `faq-${i}`,
    pregunta: f.pregunta as string,
    respuesta: f.respuesta as string,
    global: f.global as boolean | undefined,
    categorias: f.categorias as string[] | undefined,
  }))
}

export async function getFAQsForProduct(tipo: string): Promise<FAQ[]> {
  const allFaqs = await getFAQsGlobal()
  return allFaqs.filter(
    (faq) =>
      faq.global ||
      (faq.categorias && faq.categorias.some((c) => c.toLowerCase() === tipo.toLowerCase())),
  )
}

// ─── Guarantee queries ───

export async function getGarantias(): Promise<Guarantee[]> {
  const payload = await getPayloadClient()
  const result = await payload.findGlobal({ slug: 'garantias' })
  const garantias = (result.garantias as Array<Record<string, unknown>>) || []
  return garantias.map((g) => ({
    id: (g.nombre as string).toLowerCase().replace(/\s+/g, '-'),
    nombre: g.nombre as string,
    titulo: g.titulo as string,
    descripcion: g.descripcion as string,
    detalle: g.detalle as string,
    iconName: g.iconName as Guarantee['iconName'],
  }))
}

// ─── Size guide queries ───

export async function getSizeGuide(tipo: string): Promise<SizeGuideEntry | undefined> {
  const payload = await getPayloadClient()
  const result = await payload.findGlobal({ slug: 'guia-talles' })
  const entradas = (result.entradas as Array<Record<string, unknown>>) || []
  const entry = entradas.find(
    (e) => (e.tipo as string).toLowerCase() === tipo.toLowerCase(),
  )
  if (!entry) return undefined
  return {
    tipo: entry.tipo as string,
    talleUnico: entry.talleUnico as boolean,
    medidas: (entry.medidas as Array<{ label: string; valor: string }>) || [],
    notas: (entry.notas as string) || undefined,
  }
}

export async function getAllSizeGuides(): Promise<SizeGuideEntry[]> {
  const payload = await getPayloadClient()
  const result = await payload.findGlobal({ slug: 'guia-talles' })
  const entradas = (result.entradas as Array<Record<string, unknown>>) || []
  return entradas.map((entry) => ({
    tipo: entry.tipo as string,
    talleUnico: entry.talleUnico as boolean,
    medidas: (entry.medidas as Array<{ label: string; valor: string }>) || [],
    notas: (entry.notas as string) || undefined,
  }))
}

// ─── Site config ───

export interface SiteConfig {
  nombreMarca: string
  descripcionMarca: string
  whatsappNumero: string
  whatsappMensajeGeneral: string
  instagramHandle: string
  instagramUrl: string
  siteUrl: string
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const payload = await getPayloadClient()
  const result = await payload.findGlobal({ slug: 'configuracion-sitio' })
  return {
    nombreMarca: (result.nombreMarca as string) || 'CHAMANA',
    descripcionMarca: (result.descripcionMarca as string) || '',
    whatsappNumero: (result.whatsappNumero as string) || '542215475727',
    whatsappMensajeGeneral: (result.whatsappMensajeGeneral as string) || '',
    instagramHandle: (result.instagramHandle as string) || '@chamanasomostodas',
    instagramUrl: (result.instagramUrl as string) || 'https://www.instagram.com/chamanasomostodas',
    siteUrl: (result.siteUrl as string) || 'https://chamana-ashy.vercel.app',
  }
}

// ─── Desfile/Event queries ───

export interface DesfileImage {
  id: number
  src: string
  alt: string
}

export interface DesfileEvent {
  slug: string
  title: string
  displayDate: string
  location: string
  description: string
  images: DesfileImage[]
}

export async function getDesfileBySlug(slug: string): Promise<DesfileEvent | undefined> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'eventos',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  if (result.docs.length === 0) return undefined
  const doc = result.docs[0] as unknown as Record<string, unknown>
  const images = (doc.images as Array<Record<string, unknown>>) || []

  const resolvedImages: DesfileImage[] =
    images.length > 0
      ? images.map((img, i) => {
          const imageDoc = img.image as Record<string, unknown> | string
          const src =
            typeof imageDoc === 'object' && imageDoc?.url
              ? (imageDoc.url as string)
              : `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`
          return {
            id: i + 1,
            src,
            alt: (img.alt as string) || `Desfile CHAMANA - foto ${i + 1}`,
          }
        })
      : Array.from({ length: 19 }, (_, i) => ({
          id: i + 1,
          src: `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`,
          alt: `Desfile CHAMANA en Utopía – foto ${i + 1}`,
        }))

  return {
    slug: doc.slug as string,
    title: doc.title as string,
    displayDate: doc.displayDate as string,
    location: doc.location as string,
    description: doc.description as string,
    images: resolvedImages,
  }
}

export async function getDesfileEvents(): Promise<DesfileEvent[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'eventos',
    limit: 100,
    depth: 1,
  })
  return result.docs.map((doc) => {
    const d = doc as unknown as Record<string, unknown>
    const images = (d.images as Array<Record<string, unknown>>) || []

    // If no images uploaded to Payload, fall back to static paths (19 desfile images)
    const resolvedImages: DesfileImage[] =
      images.length > 0
        ? images.map((img, i) => {
            const imageDoc = img.image as Record<string, unknown> | string
            const src =
              typeof imageDoc === 'object' && imageDoc?.url
                ? (imageDoc.url as string)
                : `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`
            return {
              id: i + 1,
              src,
              alt: (img.alt as string) || `Desfile CHAMANA - foto ${i + 1}`,
            }
          })
        : Array.from({ length: 19 }, (_, i) => ({
            id: i + 1,
            src: `/images/desfile/desfile-${String(i + 1).padStart(2, '0')}.webp`,
            alt: `Desfile CHAMANA en Utopía – foto ${i + 1}`,
          }))

    return {
      slug: d.slug as string,
      title: d.title as string,
      displayDate: d.displayDate as string,
      location: d.location as string,
      description: d.description as string,
      images: resolvedImages,
    }
  })
}

// ─── Price helpers (replicate existing utility functions) ───

export function getModelMinPrice(model: ChamanaModel): number | undefined {
  const prices = model.variantes.map((v) => v.precio).filter((p): p is number => p != null)
  return prices.length > 0 ? Math.min(...prices) : undefined
}

export function getModelMaxPrice(model: ChamanaModel): number | undefined {
  const prices = model.variantes.map((v) => v.precio).filter((p): p is number => p != null)
  return prices.length > 0 ? Math.max(...prices) : undefined
}
