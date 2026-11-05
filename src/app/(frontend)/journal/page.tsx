import type { Metadata } from 'next'

import { getJournal } from '@/lib/cms'
import { JournalCards } from '@/components/home/JournalTeaser'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes from the sofa — slow living, sleepovers and the matcha-run uniform.',
}

export const revalidate = 60

export default async function JournalPage() {
  const entries = await getJournal()
  return (
    <section className="journal" data-header-tone="dark">
      <header className="pagehead">
        <p className="t-caps" data-reveal>
          Notes from the sofa
        </p>
        <h1 className="t-display pagehead__title" data-split="chars">
          the journal
        </h1>
        <p className="pagehead__lede" data-reveal data-delay="0.2">
          Rituals, recipes and reasons to stay in.
        </p>
      </header>
      <JournalCards entries={entries} />
    </section>
  )
}
