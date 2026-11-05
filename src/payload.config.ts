import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Journal } from './collections/Journal'
import { Subscribers } from './collections/Subscribers'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — INN HAUS',
    },
  },
  collections: [Journal, Subscribers, Media, Users],
  globals: [HomePage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./inhaus.db',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    // Schema changes go through migrations (src/migrations): `pnpm payload migrate:create <name>`.
    // `pnpm dev` applies pending ones first; production applies them on boot.
    push: false,
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
})
