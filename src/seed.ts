/**
 * Seed Payload with the INN HAUS launch content so everything is editable in /admin.
 *   pnpm seed
 * Safe to run more than once: globals are overwritten, journal entries are upserted by slug.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { DEFAULT_HOME, DEFAULT_JOURNAL, DEFAULT_SETTINGS } from './lib/defaults'

const paragraph = (text: string) => ({
  type: 'paragraph',
  format: '' as const,
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  textStyle: '',
  children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
})

const toLexical = (paras: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paras.map(paragraph),
  },
})

async function seed() {
  const payload = await getPayload({ config })

  await payload.updateGlobal({ slug: 'home-page', data: DEFAULT_HOME })
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      announcements: DEFAULT_SETTINGS.announcements.map((text) => ({ text })),
      marquee: DEFAULT_SETTINGS.marquee.map((text) => ({ text })),
      contactEmail: DEFAULT_SETTINGS.contactEmail,
      instagram: DEFAULT_SETTINGS.instagram,
      tiktok: DEFAULT_SETTINGS.tiktok,
      whatsapp: DEFAULT_SETTINGS.whatsapp,
    },
  })

  for (const e of DEFAULT_JOURNAL) {
    const data = {
      title: e.title,
      slug: e.slug,
      room: e.room as 'day-in' | 'friends-house' | 'quick-errand' | 'little-things',
      publishedAt: e.publishedAt,
      excerpt: e.excerpt,
      coverPath: e.cover,
      content: toLexical(e.paragraphs ?? []),
    }
    const existing = await payload.find({ collection: 'journal', where: { slug: { equals: e.slug } }, limit: 1 })
    if (existing.docs[0]) await payload.update({ collection: 'journal', id: existing.docs[0].id, data })
    else await payload.create({ collection: 'journal', data })
  }

  console.log('INN HAUS content seeded ✓')
}

// `payload run` exits once the module has loaded, so wait for the seed here.
await seed()
