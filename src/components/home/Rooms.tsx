'use client'

import { useRef } from 'react'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { formatPrice } from '@/lib/format'
import type { Product, Room } from '@/lib/catalog'
import { BLOBS } from '@/components/brand/Marks'
import { TLink } from '@/components/providers/TransitionProvider'

const TINTS = ['var(--tint-burgundy)', 'var(--tint-sage)', 'var(--tint-blue)']

export function Rooms({ rooms, products }: { rooms: Room[]; products: Product[] }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const blob = el.querySelector<SVGPathElement>('#room-blob path')!
      const imgs = gsap.utils.toArray<HTMLElement>('.rooms__img', el)
      const panels = gsap.utils.toArray<HTMLElement>('.room', el)
      const plate = el.querySelector<HTMLElement>('.rooms__plate span')!

      // The blob never stops breathing.
      const breathe = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 3.2, ease: 'sine.inOut' } })
      BLOBS.slice(1).forEach((b) => breathe.to(blob, { morphSVG: b }))

      let active = -1
      const show = (i: number) => {
        if (i === active) return
        active = i
        imgs.forEach((img, j) =>
          gsap.to(img, {
            opacity: j === i ? 1 : 0,
            scale: j === i ? 1 : 1.12,
            duration: 1.2,
            ease: 'silk',
          }),
        )
        gsap.to(el, { backgroundColor: TINTS[i % TINTS.length], duration: 1.2, ease: 'power2.out' })
        gsap.fromTo(plate, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'back.out(2)' })
        plate.textContent = panels[i]?.dataset.number ?? ''
        gsap.fromTo(
          el.querySelector('.rooms__visual'),
          { rotation: i % 2 ? -3 : 3 },
          { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.5)' },
        )
      }
      show(0)

      panels.forEach((p, i) => {
        ScrollTrigger.create({
          trigger: p,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && show(i),
        })
        gsap.from(p.querySelectorAll('.room__chip'), {
          y: 50,
          opacity: 0,
          rotation: (k) => (k % 2 ? 6 : -6),
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: p, start: 'top 70%' },
        })
      })

      return () => breathe.kill()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="rooms" data-header-tone="dark" id="rooms">
      <svg width="0" height="0" aria-hidden className="sr-only">
        <clipPath id="room-blob" clipPathUnits="objectBoundingBox">
          <path d={BLOBS[0]} />
        </clipPath>
      </svg>

      <div className="rooms__head">
        <p className="t-caps">N° 04 — Walk through the haus</p>
        <h2 className="t-display" data-split="lines">
          every room has a uniform
        </h2>
      </div>

      <div className="rooms__grid">
        <div className="rooms__sticky">
          <div className="rooms__visual">
            {rooms.map((r, i) => (
              <img key={r.key} className="rooms__img" src={r.image} alt="" style={{ opacity: i === 0 ? 1 : 0 }} />
            ))}
          </div>
          <div className="rooms__plate" aria-hidden>
            <em>N°</em>
            <span>01</span>
          </div>
        </div>

        <div className="rooms__panels">
          {rooms.map((r) => {
            const items = products.filter((p) => p.room === r.key).slice(0, 3)
            return (
              <article key={r.key} className="room" data-number={r.number}>
                <img className="room__img-m" src={r.image} alt="" />
                <p className="t-caps room__num">Room {r.number}</p>
                <h3 className="room__name t-display">{r.name}</h3>
                <p className="room__line">{r.line}</p>
                <p className="room__desc">{r.description}</p>
                <div className="room__chips">
                  {items.map((p) => (
                    <TLink key={p.handle} href={`/product/${p.handle}`} className="room__chip" data-cursor="view">
                      <img src={p.images[0]?.src} alt="" />
                      <span>{p.title}</span>
                      <em>{formatPrice(p.price, p.currency)}</em>
                    </TLink>
                  ))}
                </div>
                <TLink href={`/shop?room=${r.key}`} className="btn btn--ghost">
                  <span>Enter the room</span>
                </TLink>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
