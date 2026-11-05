'use client'

import { useEffect, useRef } from 'react'

import { Draggable, gsap, isTouch } from '@/lib/gsap'
import { useTheme } from '@/components/providers/ThemeProvider'

/**
 * A pull-cord light switch hanging from the top of the page, with the ceramic
 * heart tag from the brand book. Pull it (or click it) to turn the lights off.
 */
export function LampCord() {
  const { toggle, theme } = useTheme()
  const wrap = useRef<HTMLDivElement>(null)
  const handle = useRef<HTMLButtonElement>(null)
  const cord = useRef<SVGLineElement>(null)
  const toggleRef = useRef(toggle)
  useEffect(() => {
    toggleRef.current = toggle
  }, [toggle])

  useEffect(() => {
    if (isTouch()) return
    const h = handle.current
    const line = cord.current
    if (!h || !line) return
    const base = 0
    const sync = () => {
      const y = Number(gsap.getProperty(h, 'y'))
      const x = Number(gsap.getProperty(h, 'x'))
      line.setAttribute('y2', String(120 + y))
      line.setAttribute('x2', String(20 + x))
    }
    const swing = () =>
      gsap.fromTo(
        h,
        { x: gsap.utils.random(-14, 14) },
        { x: 0, duration: 2.2, ease: 'elastic.out(1, 0.2)', onUpdate: sync },
      )

    const [d] = Draggable.create(h, {
      type: 'x,y',
      bounds: { minX: -40, maxX: 40, minY: -10, maxY: 110 },
      edgeResistance: 0.75,
      onDrag: sync,
      onRelease() {
        const pulled = this.y > 55
        gsap.to(h, {
          x: 0,
          y: base,
          duration: 1.4,
          ease: 'elastic.out(1.1, 0.25)',
          onUpdate: sync,
        })
        if (pulled) {
          toggleRef.current()
          document.dispatchEvent(new CustomEvent('inhaus:click-sound'))
        }
      },
      onClick() {
        gsap
          .timeline({ onUpdate: sync })
          .to(h, { y: 70, duration: 0.18, ease: 'power2.in' })
          .add(() => toggleRef.current())
          .to(h, { y: base, duration: 1.3, ease: 'elastic.out(1.1, 0.25)' })
      },
    })
    const idle = window.setInterval(swing, 9000)
    swing()
    return () => {
      d.kill()
      window.clearInterval(idle)
    }
  }, [])

  return (
    <div ref={wrap} className="lampcord" data-cursor={theme === 'day' ? 'pull' : 'pull'}>
      <svg className="lampcord__svg" width="40" height="260" viewBox="0 0 40 260" aria-hidden>
        <line ref={cord} x1="20" y1="0" x2="20" y2="120" />
      </svg>
      <button
        ref={handle}
        className="lampcord__tag"
        aria-label={theme === 'day' ? 'Pull to turn the lights off' : 'Pull to turn the lights on'}
      >
        <svg viewBox="0 0 40 44" aria-hidden>
          <path d="M20 42 C 9 33, 2 26, 2 16 A 9.5 9.5 0 0 1 20 10 A 9.5 9.5 0 0 1 38 16 C 38 26, 31 33, 20 42 Z" />
          <circle cx="20" cy="7" r="2.2" className="lampcord__hole" />
          <text x="20" y="27" textAnchor="middle">
            ih
          </text>
        </svg>
      </button>
    </div>
  )
}
