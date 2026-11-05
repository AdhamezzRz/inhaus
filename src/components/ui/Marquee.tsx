'use client'

import { useRef } from 'react'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { ButtonMark } from '@/components/brand/Marks'
import { cx } from '@/lib/format'

/** A ribbon of phrases that speeds up, skews and reverses with the scroll. */
export function Marquee({
  items,
  className,
  tone = 'sage',
}: {
  items: string[]
  className?: string
  tone?: 'sage' | 'cream' | 'burgundy' | 'blue'
}) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = root.current!.querySelector<HTMLElement>('.marquee__track')!
      const loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 38, ease: 'none' })
      let dir = 1
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' })
      const settle = gsap
        .delayedCall(0.25, () => {
          gsap.to(loop, { timeScale: dir, duration: 1.2, overwrite: true })
          skew(0)
        })
        .pause()
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
          const v = self.getVelocity()
          if (self.direction !== dir) dir = self.direction
          gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 280, 6)), duration: 0.3, overwrite: true })
          skew(gsap.utils.clamp(-8, 8, v / -180))
          settle.restart(true)
        },
      })
      return () => {
        settle.kill()
        st.kill()
        loop.kill()
      }
    },
    { scope: root },
  )

  const row = (
    <div className="marquee__row">
      {items.map((t, i) => (
        <span key={i} className="marquee__item">
          <span>{t}</span>
          <ButtonMark className="marquee__btn" color="currentColor" holes="var(--marquee-bg)" ring="transparent" />
        </span>
      ))}
    </div>
  )

  return (
    <div ref={root} className={cx('marquee', `marquee--${tone}`, className)} aria-label={items.join(', ')}>
      <div className="marquee__track" aria-hidden>
        {row}
        {row}
      </div>
    </div>
  )
}
