/** Written defaults for every piece of CMS content (also used by the seed script). */

export type SiteSettingsData = {
  announcements: string[]
  marquee: string[]
  contactEmail: string
  instagram: string
  tiktok: string
  whatsapp: string
}

export type HomeData = {
  heroEyebrow: string
  heroTitle: string
  heroCaption: string
  manifesto: string
  lineTitle: string
  lineIntro: string
  packagingTitle: string
  packagingText: string
}

export type JournalEntry = {
  slug: string
  title: string
  room: string
  publishedAt: string
  excerpt: string
  cover: string
  /** Either Lexical JSON (from Payload) or plain paragraphs (defaults). */
  content: unknown
  paragraphs?: string[]
}

export const DEFAULT_SETTINGS: SiteSettingsData = {
  announcements: [
    'Complimentary delivery across Egypt on orders over EGP 5,000',
    'Every order arrives wrapped in our signature linen pouch',
    'Fall 2026 — the Day In collection is here',
  ],
  marquee: ['wear it. live in it.', 'made for slow mornings', 'stay in, on purpose', 'soft things only'],
  contactEmail: 'hello@innhaus.com',
  instagram: 'innhaus',
  tiktok: 'innhaus',
  whatsapp: '',
}

export const DEFAULT_HOME: HomeData = {
  heroEyebrow: 'Fall 2026 — Loungewear for living in',
  heroTitle: 'wear it. live in it.',
  heroCaption: 'Come in. Stay a while.',
  manifesto:
    'We make the clothes you live in — for the slow mornings, the friend’s-house evenings and the quick errand in between. Soft enough for the sofa, polished enough for the café on the corner.',
  lineTitle: 'fresh off the line',
  lineIntro: 'Pegged up this morning. Scroll along the line and take one down.',
  packagingTitle: 'wrapped like a gift',
  packagingText:
    'Every order is folded by hand, tucked into a sage linen pouch, tied with a black satin ribbon and finished with a hand-written thank you card. The pouch is yours to keep.',
}

export const DEFAULT_JOURNAL: JournalEntry[] = [
  {
    slug: 'the-art-of-the-slow-sunday',
    title: 'The art of the slow Sunday',
    room: 'day-in',
    publishedAt: '2026-10-19',
    excerpt: 'Curtains half open, a second coffee, nowhere to be. A little guide to doing nothing, beautifully.',
    cover: '/img/l-kitchen.webp',
    content: null,
    paragraphs: [
      'There is a specific kind of light that only exists on a Sunday at 9am. It comes in sideways, through linen, and lands on everything you meant to tidy and didn’t.',
      'The slow Sunday isn’t lazy — it’s deliberate. Pour the second coffee. Put the phone in another room. Wear the set you’d wear if nobody were coming over, because nobody is.',
      'Our Sunday Set was designed around that feeling: crisp poplin that softens as the day does, a shirt you can roll the sleeves of, trousers wide enough to sit cross-legged on the sofa for as long as the film lasts.',
      'Stay in. On purpose.',
    ],
  },
  {
    slug: 'what-to-bring-to-a-sleepover-at-30',
    title: 'What to bring to a sleepover (at thirty)',
    room: 'friends-house',
    publishedAt: '2026-10-05',
    excerpt: 'Strawberries, a face mask, the good pyjamas. A packing list for the grown-up sleepover.',
    cover: '/img/l-friends.webp',
    content: null,
    paragraphs: [
      'The sleepover never really went away — it just got better snacks. Here is what goes in our overnight bag.',
      'One: the matching set. Two: a silk eye mask, because nobody sleeps on time. Three: strawberries, washed. Four: the ribbed socks, slouched.',
      'And one rule: whoever falls asleep first doesn’t get to pick the next film.',
    ],
  },
  {
    slug: 'the-matcha-run-uniform',
    title: 'The matcha-run uniform',
    room: 'quick-errand',
    publishedAt: '2026-09-21',
    excerpt: 'How to leave the house in loungewear and look like you meant it.',
    cover: '/img/l-cafe.webp',
    content: null,
    paragraphs: [
      'It’s ten minutes to the café and back. You are not changing. You are, however, going to look incredible.',
      'Start with knit — a fine rib cardigan buttoned all the way up reads deliberate. Add a wide pant that hits the floor, a slipper you’d never admit is a slipper, and a tote that hides everything else.',
      'Back on the sofa before the ice melts.',
    ],
  },
]
