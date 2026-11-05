'use client'

import { useEffect, useRef, useState } from 'react'

import { gsap, penReset, penStart, prefersReducedMotion } from '@/lib/gsap'
import { Wordmark, PEN_PATHS } from '@/components/brand/Wordmark'
import { LOGO_VIEWBOX } from '@/components/brand/logoPaths'

const KEY = 'innhaus-intro-seen'

export function markReady() {
  ;(window as unknown as { __inhausReady?: boolean }).__inhausReady = true
  window.dispatchEvent(new CustomEvent('inhaus:ready'))
}

/** Run `cb` once the intro has finished (immediately if it already has). */
export function onReady(cb: () => void) {
  if ((window as unknown as { __inhausReady?: boolean }).__inhausReady) {
    cb()
    return () => {}
  }
  const h = () => cb()
  window.addEventListener('inhaus:ready', h, { once: true })
  return () => window.removeEventListener('inhaus:ready', h)
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let seen = false
    try {
      seen = sessionStorage.getItem(KEY) === '1'
    } catch {
      /* ignore */
    }
    if (seen || prefersReducedMotion()) {
      setDone(true)
      markReady()
      return
    }

    type L = { stop(): void; start(): void }
    const lenis = () => (window as unknown as { __lenis?: L }).__lenis
    lenis()?.stop()
    document.documentElement.classList.add('is-loading')

    const pens = Array.from(el.querySelectorAll<SVGPathElement>('.wordmark__pen path'))
    const guides = Array.from(el.querySelectorAll<SVGPathElement>('.preloader__guide'))
    const nib = el.querySelector<SVGCircleElement>('.preloader__nib')
    const counter = el.querySelector<HTMLElement>('.preloader__count')
    const mark = el.querySelector<HTMLElement>('.preloader__mark')
    const lens = guides.map((g) => g.getTotalLength())

    const pen = { line: 0, p: 0 }
    const moveNib = () => {
      const g = guides[pen.line]
      if (!g || !nib) return
      const pt = g.getPointAtLength(lens[pen.line] * pen.p)
      nib.setAttribute('cx', String(pt.x))
      nib.setAttribute('cy', String(pt.y))
    }

    const count = { v: 0 }
    penReset(pens)

    const tl = gsap.timeline({ delay: 0.35 })
    tl.to(count, {
      v: 100,
      duration: 3.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counter) counter.textContent = String(Math.round(count.v)).padStart(3, '0')
      },
    })
      .fromTo(nib, { attr: { r: 0 } }, { attr: { r: 9 }, duration: 0.3, ease: 'back.out(3)' }, 0.2)
      .to(pens[0], { drawSVG: '100%', duration: 1.7, ease: 'power1.inOut', onStart: penStart }, 0.3)
      .to(pen, { p: 1, duration: 1.7, ease: 'power1.inOut', onUpdate: moveNib }, 0.3)
      .set(pen, { line: 1, p: 0 })
      .to(pens[1], { drawSVG: '100%', duration: 1.5, ease: 'power1.inOut', onStart: penStart }, '>')
      .to(pen, { p: 1, duration: 1.5, ease: 'power1.inOut', onUpdate: moveNib }, '<')
      .to(nib, { attr: { r: 0 }, duration: 0.25 }, '>-0.05')
      .from(
        el.querySelectorAll('.preloader__tag span'),
        { opacity: 0, y: 10, filter: 'blur(4px)', stagger: 0.035, duration: 0.6 },
        '-=1.1',
      )
      .add(() => {
        try {
          sessionStorage.setItem(KEY, '1')
        } catch {
          /* ignore */
        }
      })

    // Exit: the wordmark glides into its place in the header as the room is revealed.
    tl.add(() => {
      const target = document.getElementById('header-logo')
      const exit = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove('is-loading')
          lenis()?.start()
          setDone(true)
        },
      })
      exit.to(el.querySelectorAll('.preloader__tag, .preloader__count, .preloader__meta'), {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      })
      if (target && mark) {
        const a = mark.getBoundingClientRect()
        const b = target.getBoundingClientRect()
        exit.to(
          mark,
          {
            x: b.left + b.width / 2 - (a.left + a.width / 2),
            y: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: b.width / a.width,
            duration: 1.25,
            ease: 'haus',
          },
          '<0.1',
        )
      }
      exit
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.25, ease: 'haus' }, '<0.05')
        .add(markReady, '<0.45')
    }, '+=0.35')

    return () => {
      tl.kill()
    }
  }, [])

  if (done) return null

  return (
    <div ref={root} className="preloader" aria-hidden>
      <div className="preloader__pattern" />
      <div className="preloader__meta">
        <span>Brand guidelines</span>
        <span>Fall 2026</span>
      </div>
      <div className="preloader__mark">
        <Wordmark write className="preloader__logo" />
        <svg className="preloader__nibs" viewBox={LOGO_VIEWBOX}>
          {PEN_PATHS.map((d, i) => (
            <path key={i} className="preloader__guide" d={d} fill="none" stroke="none" />
          ))}
          <circle className="preloader__nib" r="0" cx="0" cy="0" />
        </svg>
      </div>
      <p className="preloader__tag">
        {'WEAR IT. LIVE IN IT.'.split('').map((c, i) => (
          <span key={i}>{c === ' ' ? ' ' : c}</span>
        ))}
      </p>
      <div className="preloader__count">000</div>
    </div>
  )
}
