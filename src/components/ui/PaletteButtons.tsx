'use client'

import { useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { ButtonMark } from '@/components/brand/Marks'
import { cx } from '@/lib/format'

const PALETTE = [
  { name: 'Cream', hex: '#F3F0E9', ink: '#473C38', note: 'Linen, morning light, the first coffee.' },
  { name: 'Dusty Blue', hex: '#AAB7C4', ink: '#2B2522', note: '7am through the curtains.' },
  { name: 'Sage Green', hex: '#737B5B', ink: '#F3F0E9', note: 'Our pouch, our piping, our signature.' },
  { name: 'Burgundy', hex: '#743F46', ink: '#F3F0E9', note: 'Staying in on purpose.' },
  { name: 'Espresso', hex: '#473C38', ink: '#F3F0E9', note: 'The second coffee. And the third.' },
]

/** The brand palette as sewing buttons — press one to dye the whole section. */
export function PaletteButtons() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(2)

  useGSAP(
    () => {
      const st = { trigger: root.current, start: 'top 70%' }
      gsap.from(root.current!.querySelectorAll('.palette__btn'), {
        y: 120,
        opacity: 0,
        stagger: 0.1,
        duration: 1.4,
        ease: 'back.out(1.6)',
        scrollTrigger: st,
      })
      gsap.from(root.current!.querySelectorAll('.palette__btn svg'), {
        rotation: -280,
        stagger: 0.1,
        duration: 1.8,
        ease: 'back.out(1.2)',
        scrollTrigger: st,
      })
    },
    { scope: root },
  )

  const pick = (i: number, el: HTMLElement) => {
    setActive(i)
    gsap.fromTo(el.querySelector('svg'), { rotation: 0 }, { rotation: 360, duration: 1.2, ease: 'back.out(1.4)' })
    gsap.to(root.current, { backgroundColor: PALETTE[i].hex, color: PALETTE[i].ink, duration: 0.9, ease: 'power2.out' })
  }

  const a = PALETTE[active]

  return (
    <section ref={root} className="palette" style={{ backgroundColor: a.hex, color: a.ink }} data-header-tone={a.ink === '#F3F0E9' ? 'light' : 'dark'}>
      <p className="t-caps">The colour palette</p>
      <h2 className="t-display">{a.name.toLowerCase()}</h2>
      <p className="palette__note">{a.note}</p>
      <div className="palette__row">
        {PALETTE.map((p, i) => (
          <button
            key={p.name}
            className={cx('palette__btn', i === active && 'is-on')}
            onClick={(e) => pick(i, e.currentTarget)}
            aria-pressed={i === active}
          >
            <ButtonMark color={p.hex} holes={i === 0 ? '#D9D0C0' : '#F3F0E9'} ring="rgba(0,0,0,.18)" />
            <span className="t-caps">
              {String(i + 1).padStart(2, '0')} {p.name}
            </span>
            <code>{p.hex}</code>
          </button>
        ))}
      </div>
    </section>
  )
}
