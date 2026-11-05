'use client'

import { useRef } from 'react'

import { Draggable, gsap, useGSAP } from '@/lib/gsap'

const SHOTS = [
  { src: '/img/l-cafe.webp', cap: 'quick errand', frame: 'var(--burgundy)', x: 4, y: 12, r: -7, mx: 4, my: 0 },
  { src: '/img/l-friends.webp', cap: 'friend’s house', frame: 'var(--sage)', x: 24, y: 2, r: 5, mx: 50, my: 3 },
  { src: '/img/l-stretch.webp', cap: 'day in', frame: 'var(--dusty-blue)', x: 44, y: 16, r: -3, mx: 4, my: 20 },
  { src: '/img/l-reading.webp', cap: 'chapter eleven', frame: 'var(--cream)', x: 63, y: 4, r: 8, mx: 50, my: 23 },
  { src: '/img/l-bordeaux.webp', cap: 'stayed in on purpose', frame: 'var(--dusty-blue)', x: 80, y: 18, r: -6, mx: 4, my: 40 },
  { src: '/img/l-kitchen.webp', cap: 'sunday, 9am', frame: 'var(--sage)', x: 12, y: 50, r: 4, mx: 50, my: 43 },
  { src: '/img/p-boxers.webp', cap: 'the good pyjamas', frame: 'var(--cream)', x: 34, y: 54, r: -9, mx: 4, my: 60 },
  { src: '/img/l-packaging.webp', cap: 'wrapped like a gift', frame: 'var(--burgundy)', x: 56, y: 48, r: 6, mx: 50, my: 63 },
  { src: '/img/p-socks.webp', cap: 'slouched, always', frame: 'var(--sage)', x: 76, y: 56, r: -4, mx: 27, my: 79 },
]

/** The photography direction as a table of polaroids you can push around. */
export function PolaroidWall() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const table = el.querySelector<HTMLElement>('.polaroids__table')!
      const cards = gsap.utils.toArray<HTMLElement>('.polaroid', el)
      let z = 10

      gsap.from(cards, {
        y: () => -window.innerHeight * 0.6,
        rotation: () => gsap.utils.random(-40, 40),
        opacity: 0,
        duration: 1.4,
        ease: 'bounce.out',
        stagger: { each: 0.08, from: 'random' },
        scrollTrigger: { trigger: table, start: 'top 75%' },
      })

      const drags = Draggable.create(cards, {
        type: 'x,y',
        bounds: table,
        inertia: true,
        edgeResistance: 0.6,
        zIndexBoost: false,
        onPress() {
          z += 1
          gsap.set(this.target, { zIndex: z })
          gsap.to(this.target, { scale: 1.06, boxShadow: '0 40px 60px -20px rgba(43,37,34,.45)', duration: 0.3 })
        },
        onDrag() {
          gsap.to(this.target, { rotation: gsap.utils.clamp(-18, 18, this.deltaX * 1.4), duration: 0.4 })
        },
        onRelease() {
          gsap.to(this.target, {
            scale: 1,
            rotation: gsap.utils.random(-9, 9),
            boxShadow: '0 18px 30px -18px rgba(43,37,34,.35)',
            duration: 0.8,
            ease: 'elastic.out(1, 0.6)',
          })
        },
      })

      return () => drags.forEach((d) => d.kill())
    },
    { scope: root },
  )

  return (
    <section ref={root} className="polaroids" data-header-tone="dark">
      <div className="polaroids__head">
        <p className="t-caps">N° 06 — The haus diary</p>
        <h2 className="t-display" data-split="lines">
          quick errand, friend’s house, day in
        </h2>
        <p>Not a photoshoot dump — a camera roll. Pick them up, push them around.</p>
      </div>
      <div className="polaroids__table" data-cursor="drag">
        {SHOTS.map((s, i) => (
          <figure
            key={i}
            className="polaroid"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              rotate: `${s.r}deg`,
              ['--frame' as string]: s.frame,
              ['--mx' as string]: `${s.mx}%`,
              ['--my' as string]: `${s.my}%`,
            }}
          >
            <img src={s.src} alt="" draggable={false} />
            <figcaption>{s.cap}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
