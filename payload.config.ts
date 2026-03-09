import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { resendAdapter } from '@payloadcms/email-resend';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { es } from '@payloadcms/translations/languages/es';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Colecciones } from './collections/Colecciones.ts';
import { Eventos } from './collections/Eventos.ts';
import { Media } from './collections/Media.ts';
import { Modelos } from './collections/Modelos.ts';
import { Prototipos } from './collections/Prototipos.ts';
import { Publicaciones } from './collections/Publicaciones.ts';
import { Telas } from './collections/Telas.ts';
import { Users } from './collections/Users.ts';
import { Ventas } from './collections/Ventas.ts';

import { ConfiguracionSitio } from './globals/ConfiguracionSitio.ts';
import { ContenidoInicio } from './globals/ContenidoInicio.ts';
import { Garantias } from './globals/Garantias.ts';
import { GuiaTalles } from './globals/GuiaTalles.ts';
import { PreguntasFrecuentes } from './globals/PreguntasFrecuentes.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — CHAMANA',
      title: 'CHAMANA Admin',
      description: 'Panel de administracion de CHAMANA',
      icons: [
        {
          type: 'image/png',
          url: '/favicon.ico',
        },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
    },
  },

  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },

  collections: [
    Users,
    Media,
    Telas,
    Modelos,
    Colecciones,
    Prototipos,
    Eventos,
    Ventas,
    Publicaciones,
  ],

  globals: [ConfiguracionSitio, ContenidoInicio, PreguntasFrecuentes, Garantias, GuiaTalles],

  db: process.env.POSTGRES_URL
    ? postgresAdapter({
        pool: {
          connectionString: process.env.POSTGRES_URL.replace(
            /sslmode=(prefer|require|verify-ca)\b/,
            'sslmode=verify-full'
          ),
        },
      })
    : sqliteAdapter({
        client: {
          url: 'file:./chamana.db',
        },
      }),

  editor: lexicalEditor(),

  secret:
    process.env.PAYLOAD_SECRET ??
    (() => {
      throw new Error('PAYLOAD_SECRET env var is required');
    })(),

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  sharp,

  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          defaultFromAddress: 'admin@chamana.app',
          defaultFromName: 'CHAMANA',
          apiKey: process.env.RESEND_API_KEY || '',
        }),
      }
    : {}),

  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
});
