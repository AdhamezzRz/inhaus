'use client'

import { Fragment, useRef } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { ButtonMark } from '@/components/brand/Marks'

const INSERTS: Record<number, string> = {
  5: '/img/l-fabric.webp',
  13: '/img/l-friends.webp',
  22: '/img/l-cafe.webp',
}

/** The statement, read one word at a time as you scroll, with little photos tucked in. */
export function Manifesto({ text }: { text: string }) {
  const root = useRef<HTMLElement>(null)
  const words = text.split(/\s+/)

  useGSAP(
    () => {
      const el = root.current!
      gsap.fromTo(
        el.querySelectorAll('.manifesto__w'),
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: el.querySelector('.manifesto__text'), start: 'top 78%', end: 'bottom 45%', scrub: true },
        },
      )
      gsap.fromTo(
        el.querySelectorAll('.manifesto__pill'),
        { width: 0, opacity: 0 },
        {
          width: (i, t: HTMLElement) => t.dataset.w + 'em',
          opacity: 1,
          ease: 'power2.out',
          stagger: 0.3,
          scrollTrigger: { trigger: el.querySelector('.manifesto__text'), start: 'top 75%', end: 'bottom 55%', scrub: true },
        },
      )
      gsap.to(el.querySelector('.manifesto__spin'), {
        rotation: 720,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="manifesto" data-header-tone="dark">
      <p className="t-caps manifesto__label">
        <ButtonMark className="manifesto__spin" color="var(--sage)" />
        N° 02 — A house, not a brand
      </p>
      <p className="manifesto__text">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="manifesto__w">{w}</span>{' '}
            {INSERTS[i] && (
              <>
                <span className="manifesto__pill" data-w={i % 2 ? 2.4 : 1.8} aria-hidden>
                  <img src={INSERTS[i]} alt="" />
                </span>{' '}
              </>
            )}
          </Fragment>
        ))}
      </p>
      <p className="manifesto__sign t-display">— with love, from the haus</p>
    </section>
  )
}
