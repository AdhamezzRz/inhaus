import type { Metadata } from 'next'

import { Wordmark } from '@/components/brand/Wordmark'
import { HouseMark } from '@/components/brand/Marks'
import { PaletteButtons } from '@/components/ui/PaletteButtons'
import { Marquee } from '@/components/ui/Marquee'
import { TLink } from '@/components/providers/TransitionProvider'

export const metadata: Metadata = {
  title: 'The Haus — our story',
  description: 'Inn: to stay in. Haus: the place you never want to leave. The story behind INN HAUS loungewear.',
}

const SIZES = [
  ['XS', '6', '80–84', '60–64', '86–90'],
  ['S', '8', '84–88', '64–68', '90–94'],
  ['M', '10', '88–94', '68–74', '94–100'],
  ['L', '12', '94–100', '74–80', '100–106'],
  ['XL', '14', '100–106', '80–86', '106–112'],
]

export default function TheHausPage() {
  return (
    <>
      <section className="haus-hero" data-header-tone="dark">
        <HouseMark className="haus-hero__house" />
        <p className="t-caps" data-reveal>
          Our story
        </p>
        <h1 className="t-display pagehead__title" data-split="chars">
          a house, not a brand
        </h1>
        <p className="pagehead__lede" data-reveal data-delay="0.3">
          <em>Inn</em> — to stay in. <em>Haus</em> — the place you never want to leave. We started INN HAUS in Cairo for
          the hours nobody photographs: the slow breakfast, the sofa, the friend who stays over.
        </p>
      </section>

      <section className="story" data-header-tone="dark">
        <figure className="story__img" data-img-reveal>
          <img src="/img/l-kitchen.webp" alt="A slow breakfast in the Cloud Waffle Robe" />
        </figure>
        <div className="story__text">
          <p className="t-caps">01 — Why loungewear</p>
          <h2 className="t-display" data-split="lines">
            the clothes you actually live in
          </h2>
          <p data-reveal>
            Most wardrobes are built for the outside world. Ours is built for the inside one — the clothes you change into
            the second you get home, the ones you’d happily answer the door in.
          </p>
          <p data-reveal>
            So we design them like everything else that matters: long-staple cotton, piping you can feel, buttons that
            look like they came from your grandmother’s tin, and fits that move with you from the bed to the bakery.
          </p>
        </div>
      </section>

      <Marquee items={['consistent, never repetitive', 'graphics with photography', 'lifestyle + product', 'trends, worn naturally']} tone="cream" />

      <PaletteButtons />

      <section className="type" data-header-tone="dark">
        <p className="t-caps">The typography</p>
        <div className="type__grid">
          <div>
            <Wordmark className="type__mark" />
            <p className="t-caps">01 — Custom inn haus wordmark</p>
          </div>
          <div>
            <p className="type__specimen">Aa Bb Cc</p>
            <p className="t-caps">02 — Bauer Bodoni (Bodoni Moda on the web)</p>
          </div>
          <div>
            <p className="type__rule t-display">always centred.</p>
            <p className="t-caps">03 — Text, titles, logo — always centre aligned</p>
          </div>
        </div>
      </section>

      <section className="care" id="care" data-header-tone="dark">
        <div className="section-head">
          <p className="t-caps">Good to know</p>
          <h2 className="t-display">delivery, exchanges &amp; sizing</h2>
        </div>
        <div className="care__grid">
          <article data-reveal>
            <h3>Delivery</h3>
            <p>Same-day in Cairo for orders before 1pm. 2–4 working days everywhere else in Egypt. Complimentary over EGP 5,000.</p>
          </article>
          <article data-reveal data-delay="0.1">
            <h3>Exchanges</h3>
            <p>Changed your mind? Exchange within 14 days — unworn, tags on, folded back into the pouch.</p>
          </article>
          <article data-reveal data-delay="0.2">
            <h3>Care</h3>
            <p>Cold wash, line dry, a warm iron if you must. Everything gets softer with time — that’s the point.</p>
          </article>
        </div>
        <div className="sizes" data-reveal>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>UK</th>
                <th>Bust (cm)</th>
                <th>Waist (cm)</th>
                <th>Hip (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p>Between sizes? Our sets are cut relaxed — take your usual size, or size down for a neater fit.</p>
        </div>
        <div className="care__cta">
          <TLink href="/shop" className="btn btn--sage">
            <span>Shop the collection</span>
          </TLink>
        </div>
      </section>
    </>
  )
}
