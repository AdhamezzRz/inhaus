import { roomByKey, type RoomKey } from '@/lib/catalog'
import type { JournalEntry } from '@/lib/cms'
import { TLink } from '@/components/providers/TransitionProvider'

export function JournalCards({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="jcards">
      {entries.map((e, i) => (
        <TLink key={e.slug} href={`/journal/${e.slug}`} className="jcard" data-cursor="read" data-reveal data-delay={i * 0.12}>
          <span className="jcard__img" data-img-reveal>
            <img src={e.cover} alt="" loading="lazy" />
          </span>
          <span className="jcard__meta">
            <span>{roomByKey(e.room as RoomKey).name}</span>
            <span>
              {new Date(e.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </span>
          <span className="jcard__title">{e.title}</span>
          <span className="jcard__excerpt">{e.excerpt}</span>
        </TLink>
      ))}
    </div>
  )
}

export function JournalTeaser({ entries }: { entries: JournalEntry[] }) {
  return (
    <section className="journal-teaser" data-header-tone="dark">
      <div className="section-head">
        <p className="t-caps">N° 08 — Notes from the sofa</p>
        <h2 className="t-display" data-split="lines">
          the journal
        </h2>
        <TLink href="/journal" className="ulink t-caps">
          Read all entries
        </TLink>
      </div>
      <JournalCards entries={entries.slice(0, 3)} />
    </section>
  )
}
