import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Content comes from Payload CMS (/admin). Everything has a written default so
 * the site looks complete before anyone logs in to the admin.
 */

import {
  DEFAULT_HOME,
  DEFAULT_JOURNAL,
  DEFAULT_SETTINGS,
  type HomeData,
  type JournalEntry,
  type SiteSettingsData,
} from './defaults'

export { DEFAULT_HOME, DEFAULT_JOURNAL, DEFAULT_SETTINGS }
export type { HomeData, JournalEntry, SiteSettingsData }

async function payload() {
  return getPayload({ config })
}

const plain = (arr: unknown, key = 'text'): string[] =>
  Array.isArray(arr) ? arr.map((x) => (x as Record<string, string>)?.[key]).filter(Boolean) : []

export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    const p = await payload()
    const g = (await p.findGlobal({ slug: 'site-settings' })) as unknown as Record<string, unknown>
    const announcements = plain(g.announcements)
    const marquee = plain(g.marquee)
    return {
      announcements: announcements.length ? announcements : DEFAULT_SETTINGS.announcements,
      marquee: marquee.length ? marquee : DEFAULT_SETTINGS.marquee,
      contactEmail: (g.contactEmail as string) || DEFAULT_SETTINGS.contactEmail,
      instagram: (g.instagram as string) || DEFAULT_SETTINGS.instagram,
      tiktok: (g.tiktok as string) || DEFAULT_SETTINGS.tiktok,
      whatsapp: (g.whatsapp as string) || DEFAULT_SETTINGS.whatsapp,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
})

export const getHome = cache(async (): Promise<HomeData> => {
  try {
    const p = await payload()
    const g = (await p.findGlobal({ slug: 'home-page' })) as unknown as Record<string, string>
    const out = { ...DEFAULT_HOME }
    for (const k of Object.keys(out) as (keyof HomeData)[]) if (g?.[k]) out[k] = g[k]
    return out
  } catch {
    return DEFAULT_HOME
  }
})

type JournalDoc = {
  slug: string
  title: string
  room?: string
  publishedAt?: string
  excerpt: string
  cover?: { url?: string } | number | null
  coverPath?: string
  content?: unknown
}

function toEntry(d: JournalDoc): JournalEntry {
  const cover =
    (typeof d.cover === 'object' && d.cover?.url) || d.coverPath || '/img/l-reading.webp'
  return {
    slug: d.slug,
    title: d.title,
    room: d.room ?? 'day-in',
    publishedAt: d.publishedAt ?? new Date().toISOString(),
    excerpt: d.excerpt,
    cover,
    content: d.content ?? null,
  }
}

export const getJournal = cache(async (): Promise<JournalEntry[]> => {
  try {
    const p = await payload()
    const res = await p.find({ collection: 'journal', limit: 50, sort: '-publishedAt', depth: 1 })
    if (res.docs.length) return (res.docs as unknown as JournalDoc[]).map(toEntry)
  } catch {
    /* fall through */
  }
  return DEFAULT_JOURNAL
})

export const getJournalEntry = cache(async (slug: string): Promise<JournalEntry | null> => {
  const all = await getJournal()
  return all.find((e) => e.slug === slug) ?? DEFAULT_JOURNAL.find((e) => e.slug === slug) ?? null
})
