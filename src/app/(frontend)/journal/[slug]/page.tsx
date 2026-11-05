import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { getJournal, getJournalEntry } from '@/lib/cms'
import { roomByKey, type RoomKey } from '@/lib/catalog'
import { JournalCards } from '@/components/home/JournalTeaser'
import { TLink } from '@/components/providers/TransitionProvider'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const e = await getJournalEntry(slug)
  return e ? { title: e.title, description: e.excerpt, openGraph: { images: [e.cover] } } : { title: 'Not found' }
}

export default async function JournalEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [entry, all] = await Promise.all([getJournalEntry(slug), getJournal()])
  if (!entry) notFound()

  const more = all.filter((e) => e.slug !== entry.slug).slice(0, 3)

  return (
    <>
      <article className="entry" data-header-tone="dark">
        <header className="entry__head">
          <p className="t-caps" data-reveal>
            {roomByKey(entry.room as RoomKey).name} ·{' '}
            {new Date(entry.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="t-display entry__title" data-split="lines">
            {entry.title}
          </h1>
          <p className="entry__excerpt" data-reveal data-delay="0.2">
            {entry.excerpt}
          </p>
        </header>
        <figure className="entry__cover" data-img-reveal>
          <img src={entry.cover} alt="" />
        </figure>
        <div className="entry__body">
          {entry.content ? (
            <RichText data={entry.content as SerializedEditorState} />
          ) : (
            entry.paragraphs?.map((p, i) => (
              <p key={i} data-reveal>
                {p}
              </p>
            ))
          )}
          <p className="entry__sign t-display">— the haus</p>
          <TLink href="/journal" className="ulink t-caps">
            ← All journal entries
          </TLink>
        </div>
      </article>
      {more.length > 0 && (
        <section className="journal-teaser" data-header-tone="dark">
          <div className="section-head">
            <p className="t-caps">Keep reading</p>
          </div>
          <JournalCards entries={more} />
        </section>
      )}
    </>
  )
}
