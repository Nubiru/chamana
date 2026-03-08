/**
 * Seed script: migrates all static data from lib/data/ into Payload CMS.
 *
 * Usage:
 *   npx tsx scripts/seed-payload.ts
 *
 * Requires a running database (SQLite by default, or POSTGRES_URL).
 * Uses Payload Local API — no REST server needed.
 */

import { getPayload } from 'payload'
import config from '../payload.config'

import { TELAS } from '../lib/data/fabrics'
import { MODELOS } from '../lib/data/products'
import { COLECCIONES } from '../lib/data/collections'
import { FAQS } from '../lib/data/faqs'
import { GARANTIAS } from '../lib/data/guarantees'
import { SIZE_GUIDE } from '../lib/data/size-guide'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a human-readable name from a Tela's fields: "Lino Spandex Beige" */
function buildTelaName(tela: { tipo: string; subtipo?: string; color: string }): string {
  return [tela.tipo, tela.subtipo, tela.color].filter(Boolean).join(' ')
}

// ---------------------------------------------------------------------------
// Summary counters
// ---------------------------------------------------------------------------

const summary = {
  users: 0,
  telas: 0,
  colecciones: 0,
  modelos: 0,
  variantes: 0,
  globals: [] as string[],
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('\n========================================')
  console.log('  CHAMANA — Seed Payload CMS')
  console.log('========================================\n')

  const payload = await getPayload({ config })

  // ------------------------------------------------------------------
  // 1. Admin users
  // ------------------------------------------------------------------
  console.log('[1/5] Creating admin users...')

  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'chamanasomostodas@gmail.com',
        password: 'chamana2026',
        nombre: 'Cintia',
        role: 'admin',
      },
    })
    summary.users++
    console.log('  ✓ Cintia (chamanasomostodas@gmail.com)')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists') || msg.includes('UNIQUE')) {
      console.log('  ⊘ Cintia already exists, skipping')
    } else {
      console.error('  ✗ Error creating Cintia:', msg)
    }
  }

  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'osemberg.gabi@gmail.com',
        password: 'chamana-dev-2026',
        nombre: 'Gabriel',
        role: 'admin',
      },
    })
    summary.users++
    console.log('  ✓ Gabriel (osemberg.gabi@gmail.com)')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists') || msg.includes('UNIQUE')) {
      console.log('  ⊘ Gabriel already exists, skipping')
    } else {
      console.error('  ✗ Error creating Gabriel:', msg)
    }
  }

  // ------------------------------------------------------------------
  // 2. Telas — build a Map<codigo, payloadId>
  // ------------------------------------------------------------------
  console.log('\n[2/5] Creating telas...')

  const telaIdMap = new Map<string, number | string>()
  const telasArray = Object.values(TELAS)

  for (const tela of telasArray) {
    try {
      const created = await payload.create({
        collection: 'telas',
        data: {
          codigo: tela.codigo,
          nombre: buildTelaName(tela),
          tipo: tela.tipo,
          subtipo: tela.subtipo || undefined,
          color: tela.color,
          colorHex: tela.colorHex,
        },
      })
      telaIdMap.set(tela.codigo, created.id)
      summary.telas++
      console.log(`  ✓ ${tela.codigo} → ID ${created.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('UNIQUE')) {
        // If it already exists, look it up so we can still use the ID
        console.log(`  ⊘ ${tela.codigo} already exists, looking up ID...`)
        try {
          const existing = await payload.find({
            collection: 'telas',
            where: { codigo: { equals: tela.codigo } },
            limit: 1,
          })
          if (existing.docs.length > 0) {
            telaIdMap.set(tela.codigo, existing.docs[0].id)
            console.log(`     Found ID ${existing.docs[0].id}`)
          }
        } catch (lookupErr) {
          console.error(`     Could not look up existing tela ${tela.codigo}`)
        }
      } else {
        console.error(`  ✗ Error creating tela ${tela.codigo}:`, msg)
      }
    }
  }

  console.log(`  Total telas in map: ${telaIdMap.size}/${telasArray.length}`)

  // ------------------------------------------------------------------
  // 3. Colecciones — build a Map<slug, payloadId>
  // ------------------------------------------------------------------
  console.log('\n[3/5] Creating colecciones...')

  const coleccionIdMap = new Map<string, number | string>()

  for (const col of COLECCIONES) {
    try {
      const created = await payload.create({
        collection: 'colecciones',
        data: {
          slug: col.slug,
          nombre: col.nombre,
          nombreCompleto: col.nombreCompleto,
          temporada: col.temporada,
          anio: col.anio,
          estado: col.estado,
          descripcion: col.descripcion,
          ejes: col.ejes.map((eje) => ({ eje })),
        },
      })
      coleccionIdMap.set(col.slug, created.id)
      summary.colecciones++
      console.log(`  ✓ ${col.nombreCompleto} → ID ${created.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('UNIQUE')) {
        console.log(`  ⊘ ${col.nombreCompleto} already exists, looking up ID...`)
        try {
          const existing = await payload.find({
            collection: 'colecciones',
            where: { slug: { equals: col.slug } },
            limit: 1,
          })
          if (existing.docs.length > 0) {
            coleccionIdMap.set(col.slug, existing.docs[0].id)
            console.log(`     Found ID ${existing.docs[0].id}`)
          }
        } catch (lookupErr) {
          console.error(`     Could not look up existing coleccion ${col.slug}`)
        }
      } else {
        console.error(`  ✗ Error creating coleccion ${col.nombreCompleto}:`, msg)
      }
    }
  }

  // ------------------------------------------------------------------
  // 4. Modelos with variantes
  // ------------------------------------------------------------------
  console.log('\n[4/5] Creating modelos with variantes...')

  // All current static models belong to Coleccion Magia
  const magiaId = coleccionIdMap.get('magia')

  for (const modelo of MODELOS) {
    // Build the variantes array with tela IDs resolved from the map
    const payloadVariantes = modelo.variantes.map((variante) => {
      const tela1Id = variante.tela1 ? telaIdMap.get(variante.tela1.codigo) : undefined
      const tela2Id = variante.tela2 ? telaIdMap.get(variante.tela2.codigo) : undefined

      if (!tela1Id && variante.tela1) {
        console.warn(`    ⚠ Variante ${variante.id}: tela1 "${variante.tela1.codigo}" not found in map`)
      }
      if (variante.tela2 && !tela2Id) {
        console.warn(`    ⚠ Variante ${variante.id}: tela2 "${variante.tela2.codigo}" not found in map`)
      }

      const payloadVariante: Record<string, unknown> = {
        varianteId: variante.id,
        tela1: tela1Id,
        sinStock: variante.sinStock ?? false,
      }

      if (tela2Id) {
        payloadVariante.tela2 = tela2Id
      }
      if (variante.precio != null) {
        payloadVariante.precio = variante.precio
      }
      if (variante.precioAnterior != null) {
        payloadVariante.precioAnterior = variante.precioAnterior
      }
      if (variante.descuento != null) {
        payloadVariante.descuento = variante.descuento
      }

      return payloadVariante
    })

    try {
      const modeloData: Record<string, unknown> = {
        nombre: modelo.nombre,
        slug: modelo.slug,
        tipo: modelo.tipo,
        descripcion: modelo.descripcion,
        variantes: payloadVariantes,
        featured: modelo.featured ?? false,
      }

      if (modelo.detalle) {
        modeloData.detalle = modelo.detalle
      }
      if (modelo.badge) {
        modeloData.badge = modelo.badge
      }
      if (modelo.bundleId) {
        modeloData.bundleId = modelo.bundleId
      }
      if (magiaId) {
        modeloData.coleccion = magiaId
      }

      // Skip imagenes — we keep using public/ images for now

      await payload.create({
        collection: 'modelos',
        data: modeloData,
      })
      summary.modelos++
      summary.variantes += modelo.variantes.length
      console.log(`  ✓ ${modelo.nombre} (${modelo.tipo}) — ${modelo.variantes.length} variantes`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('UNIQUE')) {
        console.log(`  ⊘ ${modelo.nombre} already exists, skipping`)
      } else {
        console.error(`  ✗ Error creating modelo ${modelo.nombre}:`, msg)
      }
    }
  }

  // ------------------------------------------------------------------
  // 5. Evento (Desfile)
  // ------------------------------------------------------------------
  console.log('\n[5/6] Creating evento...')

  try {
    const existingEvento = await payload.find({
      collection: 'eventos',
      where: { slug: { equals: 'utopia-capilla-2026' } },
      limit: 1,
    })
    if (existingEvento.docs.length > 0) {
      console.log('  ⊘ Desfile en Utopía already exists, skipping')
    } else {
      await payload.create({
        collection: 'eventos',
        data: {
          slug: 'utopia-capilla-2026',
          title: 'Desfile en Utopía',
          displayDate: 'Enero 2026',
          location: 'Utopía Bar · Capilla del Monte',
          description:
            'Una noche mágica donde la Colección Magia cobró vida. Modelos locales desfilaron entre luces y naturaleza, celebrando la esencia de CHAMANA en el corazón de las sierras cordobesas.',
          images: [],
        },
      })
      console.log('  ✓ Desfile en Utopía')
    }
  } catch (err: unknown) {
    console.error('  ✗ Error creating evento:', err instanceof Error ? err.message : err)
  }

  // ------------------------------------------------------------------
  // 6. Globals
  // ------------------------------------------------------------------
  console.log('\n[6/6] Setting globals...')

  // 5a. Preguntas Frecuentes
  try {
    await payload.updateGlobal({
      slug: 'preguntas-frecuentes',
      data: {
        faqs: FAQS.map((faq) => ({
          pregunta: faq.pregunta,
          respuesta: faq.respuesta,
          global: faq.global ?? false,
          ...(faq.categorias && !faq.global ? { categorias: faq.categorias } : {}),
        })),
      },
    })
    summary.globals.push('preguntas-frecuentes')
    console.log(`  ✓ Preguntas Frecuentes (${FAQS.length} FAQs)`)
  } catch (err: unknown) {
    console.error('  ✗ Error setting Preguntas Frecuentes:', err instanceof Error ? err.message : err)
  }

  // 5b. Garantias
  try {
    await payload.updateGlobal({
      slug: 'garantias',
      data: {
        garantias: GARANTIAS.map((g) => ({
          nombre: g.nombre,
          titulo: g.titulo,
          descripcion: g.descripcion,
          detalle: g.detalle,
          iconName: g.iconName,
        })),
      },
    })
    summary.globals.push('garantias')
    console.log(`  ✓ Garantias (${GARANTIAS.length} entries)`)
  } catch (err: unknown) {
    console.error('  ✗ Error setting Garantias:', err instanceof Error ? err.message : err)
  }

  // 5c. Guia de Talles
  try {
    await payload.updateGlobal({
      slug: 'guia-talles',
      data: {
        entradas: SIZE_GUIDE.map((entry) => ({
          tipo: entry.tipo,
          talleUnico: entry.talleUnico,
          medidas: entry.medidas.map((m) => ({
            label: m.label,
            valor: m.valor,
          })),
          ...(entry.notas ? { notas: entry.notas } : {}),
        })),
      },
    })
    summary.globals.push('guia-talles')
    console.log(`  ✓ Guia de Talles (${SIZE_GUIDE.length} tipos)`)
  } catch (err: unknown) {
    console.error('  ✗ Error setting Guia de Talles:', err instanceof Error ? err.message : err)
  }

  // 5d. Configuracion del Sitio
  try {
    await payload.updateGlobal({
      slug: 'configuracion-sitio',
      data: {
        nombreMarca: 'CHAMANA',
        descripcionMarca:
          'Ropa femenina artesanal inspirada en la naturaleza. Prendas unicas confeccionadas a mano con telas nobles.',
        whatsappNumero: '542215475727',
        whatsappMensajeGeneral:
          'Hola! Quiero consultar sobre la Coleccion Magia de CHAMANA 🌿',
        instagramHandle: '@chamanasomostodas',
        instagramUrl: 'https://www.instagram.com/chamanasomostodas',
        siteUrl: 'https://chamana.app',
      },
    })
    summary.globals.push('configuracion-sitio')
    console.log('  ✓ Configuracion del Sitio')
  } catch (err: unknown) {
    console.error('  ✗ Error setting Configuracion del Sitio:', err instanceof Error ? err.message : err)
  }

  // 5e. Contenido de Inicio
  try {
    await payload.updateGlobal({
      slug: 'contenido-inicio',
      data: {
        subtitulo:
          'Ropa femenina artesanal inspirada en la naturaleza. Prendas unicas confeccionadas a mano con telas nobles.',
        seccionEsencia: {
          titulo: 'Nuestra Esencia',
        },
        seccionDestacados: {
          titulo: 'Destacados',
        },
        seccionColeccion: {
          titulo: 'Coleccion Magia',
        },
      },
    })
    summary.globals.push('contenido-inicio')
    console.log('  ✓ Contenido de Inicio')
  } catch (err: unknown) {
    console.error('  ✗ Error setting Contenido de Inicio:', err instanceof Error ? err.message : err)
  }

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log('\n========================================')
  console.log('  Seed complete!')
  console.log('========================================')
  console.log(`  Users created:       ${summary.users}`)
  console.log(`  Telas created:       ${summary.telas}`)
  console.log(`  Colecciones created: ${summary.colecciones}`)
  console.log(`  Modelos created:     ${summary.modelos}`)
  console.log(`  Variantes total:     ${summary.variantes}`)
  console.log(`  Globals updated:     ${summary.globals.join(', ') || 'none'}`)
  console.log('========================================\n')

  process.exit(0)
}

seed().catch((err) => {
  console.error('\n✗ Fatal error during seed:', err)
  process.exit(1)
})
