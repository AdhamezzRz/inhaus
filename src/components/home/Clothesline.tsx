'use client'

import { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { formatPrice } from '@/lib/format'
import { roomByKey, type Product } from '@/lib/catalog'
import { TLink } from '@/components/providers/TransitionProvider'

function Peg() {
  return (
    <svg className="peg" viewBox="0 0 22 60" aria-hidden>
      <rect x="3" y="0" width="7" height="58" rx="3" className="peg__wood" />
      <rect x="12" y="0" width="7" height="58" rx="3" className="peg__wood peg__wood--b" />
      <rect x="1.5" y="22" width="19" height="7" rx="2" className="peg__spring" />
    </svg>
  )
}

/**
 * The product rail as a laundry line: pieces are pegged to a rope that sags and
 * swings with the speed of your scroll.
 */
export function Clothesline({ products, title, intro }: { products: Product[]; title: string; intro: string }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const track = el.querySelector<HTMLElement>('.line__track')!
      const rope = el.querySelector<SVGPathElement>('.line__rope path')!
      const ropeSvg = el.querySelector<SVGSVGElement>('.line__rope')!
      const cards = gsap.utils.toArray<HTMLElement>('.peg-card', el)
      const thread = el.querySelector<HTMLElement>('.line__thread span')!

      const ROPE_Y = 36
      let pegs: number[] = []
      const measure = () => {
        pegs = cards.map((c) => c.offsetLeft + c.offsetWidth / 2)
        ropeSvg.setAttribute('width', String(track.scrollWidth))
        ropeSvg.setAttribute('viewBox', `0 0 ${track.scrollWidth} 160`)
      }
      measure()

      const springs = cards.map((_, i) => ({ a: 0, v: 0, k: 0.035 + (i % 3) * 0.006, impulse: 0 }))
      const rot = cards.map((c) => gsap.quickSetter(c, 'rotation', 'deg'))
      const lift = cards.map((c) => gsap.quickSetter(c, 'y', 'px'))
      let velocity = 0
      let sag = 18

      const drawRope = () => {
        const total = track.scrollWidth
        let d = `M 0 ${ROPE_Y - 8}`
        let prevX = 0
        let prevY = ROPE_Y - 8
        pegs.forEach((x) => {
          const mid = (prevX + x) / 2
          d += ` Q ${mid} ${Math.max(prevY, ROPE_Y) + sag} ${x} ${ROPE_Y}`
          prevX = x
          prevY = ROPE_Y
        })
        d += ` Q ${(prevX + total) / 2} ${ROPE_Y + sag} ${total} ${ROPE_Y - 8}`
        rope.setAttribute('d', d)
      }

      const tick = () => {
        const maxA = window.innerWidth < 760 ? 7 : 14
        const target = gsap.utils.clamp(-maxA, maxA, -velocity * 0.005)
        sag += (18 + Math.min(Math.abs(velocity) * 0.012, 26) - sag) * 0.08
        springs.forEach((s, i) => {
          s.v += (target + s.impulse - s.a) * s.k
          s.v *= 0.92
          s.a += s.v
          s.impulse *= 0.9
          rot[i](s.a)
          lift[i](Math.abs(s.a) * 0.25 + (sag - 18) * 0.4)
        })
        velocity *= 0.9
        drawRope()
      }
      gsap.ticker.add(tick)

      const distance = () => track.scrollWidth - window.innerWidth + 40
      const st = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: el.querySelector('.line__pin'),
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate(self) {
            velocity = self.getVelocity()
            thread.style.transform = `scaleX(${self.progress})`
          },
        },
      })

      const onMove = (e: PointerEvent) => {
        const card = (e.target as HTMLElement).closest<HTMLElement>('.peg-card')
        if (!card) return
        const i = cards.indexOf(card)
        if (i >= 0) springs[i].impulse = gsap.utils.clamp(-10, 10, springs[i].impulse + e.movementX * 0.35)
      }
      el.addEventListener('pointermove', onMove)

      return () => {
        gsap.ticker.remove(tick)
        el.removeEventListener('pointermove', onMove)
        st.scrollTrigger?.kill()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="line" data-header-tone="dark">
      <div className="line__pin">
        <header className="line__head">
          <p className="t-caps">N° 03 — The line</p>
          <h2 className="t-display" data-split="chars">
            {title}
          </h2>
          <p className="line__intro">{intro}</p>
        </header>
        <div className="line__viewport">
          <div className="line__track">
            <svg className="line__rope" height="160" aria-hidden>
              <path />
            </svg>
            {products.map((p, i) => (
              <article key={p.handle} className="peg-card" style={{ ['--i' as string]: i }}>
                <Peg />
                <TLink href={`/product/${p.handle}`} className="peg-card__body" data-cursor="view">
                  <span className="peg-card__frame">
                    <img src={p.images[0]?.src} alt={p.images[0]?.alt ?? p.title} loading="lazy" />
                    {p.lifestyle && <img className="peg-card__alt" src={p.lifestyle} alt="" loading="lazy" />}
                  </span>
                  <span className="peg-card__room">{roomByKey(p.room).name}</span>
                  <span className="peg-card__title">{p.title}</span>
                  <span className="peg-card__price">{formatPrice(p.price, p.currency)}</span>
                  {p.badge && <span className="peg-card__badge">{p.badge}</span>}
                </TLink>
              </article>
            ))}
            <article className="peg-card peg-card--end">
              <Peg />
              <TLink href="/shop" className="peg-card__body peg-card__body--end" data-cursor="open">
                <span className="t-display">the whole wardrobe</span>
                <span className="t-caps">Shop all {products.length}+ pieces →</span>
              </TLink>
            </article>
          </div>
        </div>
        <div className="line__thread" aria-hidden>
          <span />
        </div>
      </div>
    </section>
  )
}
