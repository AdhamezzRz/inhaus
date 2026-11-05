'use client'

import { useRef } from 'react'

import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { onReady } from '@/components/ui/Preloader'

type Pt = [number, number]

/** The brand-book house (chimney on the left slope) as 11 points, morphing to the full frame. */
function housePoints(w: number, h: number, p: number): Pt[] {
  const mobile = w < 760
  const hw = mobile ? w * 0.66 : gsap.utils.clamp(320, 560, w * 0.32)
  const wallH = hw * (mobile ? 0.78 : 0.6)
  const roofH = hw * 0.4
  const cx = w / 2
  const base = h * (mobile ? 0.86 : 0.88)
  const L = cx - hw / 2
  const R = cx + hw / 2
  const E = base - wallH
  const P = E - roofH
  const o = hw * 0.07
  const slope = (t: number): Pt => [L - o + (cx - (L - o)) * t, E + (P - E) * t]
  const c1 = slope(0.3)
  const c2 = slope(0.47)
  const chimTop = c1[1] - roofH * 0.34

  const house: Pt[] = [
    [L, base],
    [L, E],
    [L - o, E],
    c1,
    [c1[0], chimTop],
    [c2[0], chimTop],
    c2,
    [cx, P],
    [R + o, E],
    [R, E],
    [R, base],
  ]
  const full: Pt[] = [
    [-2, h + 2],
    [-2, -2],
    [-2, -2],
    [w * 0.14, -2],
    [w * 0.14, -2],
    [w * 0.3, -2],
    [w * 0.3, -2],
    [w * 0.5, -2],
    [w + 2, -2],
    [w + 2, -2],
    [w + 2, h + 2],
  ]
  return house.map(([x, y], i) => [x + (full[i][0] - x) * p, y + (full[i][1] - y) * p])
}

const toPolygon = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`

const toPath = (pts: Pt[], w: number) => {
  const [first, ...rest] = pts
  // Ground line runs from the left edge into the house, like the brand-book mark.
  return `M ${-w} ${first[1].toFixed(1)} L ${first[0].toFixed(1)} ${first[1].toFixed(1)} ${rest
    .map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')} L ${(pts[10][0] + w * 0.08).toFixed(1)} ${pts[10][1].toFixed(1)}`
}

export function HeroHaus({ eyebrow, title, caption }: { eyebrow: string; title: string; caption: string }) {
  const root = useRef<HTMLElement>(null)
  const [left, right] = (() => {
    const m = title.match(/^(.*?\.)\s*(.*)$/)
    return m ? [m[1], m[2]] : [title, '']
  })()

  useGSAP(
    () => {
      const section = root.current!
      const stage = section.querySelector<HTMLElement>('.hero__stage')!
      const media = section.querySelector<HTMLElement>('.hero__media')!
      const video = section.querySelector<HTMLVideoElement>('video')
      const outline = section.querySelector<SVGSVGElement>('.hero__outline')!
      const path = outline.querySelector('path')!
      const wordsL = section.querySelector<HTMLElement>('.hero__word--l')!
      const wordsR = section.querySelector<HTMLElement>('.hero__word--r')!
      const cap = section.querySelector<HTMLElement>('.hero__caption')!

      let w = stage.clientWidth
      let h = stage.clientHeight
      const state = { p: 0 }

      const paint = () => {
        const pts = housePoints(w, h, state.p)
        media.style.clipPath = toPolygon(pts)
        outline.setAttribute('viewBox', `0 0 ${w} ${h}`)
        path.setAttribute('d', toPath(housePoints(w, h, 0), w))
      }
      const measure = () => {
        w = stage.clientWidth
        h = stage.clientHeight
        paint()
      }
      measure()
      ScrollTrigger.addEventListener('refreshInit', measure)

      const splitL = SplitText.create(wordsL, { type: 'chars', mask: 'chars' })
      const splitR = SplitText.create(wordsR, { type: 'chars', mask: 'chars' })
      const splitC = SplitText.create(cap, { type: 'words', mask: 'words' })

      gsap.set(section.querySelectorAll('.hero__meta > *, .hero__cue'), { opacity: 0, y: 12 })
      gsap.set([...splitL.chars, ...splitR.chars], { yPercent: 115 })
      gsap.set(splitC.words, { yPercent: 115 })
      gsap.set(path, { drawSVG: '0%' })
      gsap.set(media, { opacity: 0 })
      // Frame her face and cup inside the house (portrait screens use object-position instead).
      const narrow = w < 760
      if (video) gsap.set(video, narrow ? { scale: 1.3, yPercent: 6 } : { scale: 1.45, xPercent: -22, yPercent: 8 })

      // 1 — the intro, once the preloader hands over.
      const intro = gsap.timeline({ paused: true })
      intro
        .to(path, { drawSVG: '100%', duration: 2.2, ease: 'power2.inOut' })
        .to(media, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.9)
        .to(video, { scale: narrow ? 1.15 : 1.25, duration: 2.6, ease: 'silk' }, 0.9)
        .to(splitL.chars, { yPercent: 0, stagger: 0.035, duration: 1.1 }, 0.7)
        .to(splitR.chars, { yPercent: 0, stagger: 0.035, duration: 1.1 }, 0.85)
        .to(section.querySelectorAll('.hero__meta > *, .hero__cue'), { opacity: 1, y: 0, stagger: 0.08, duration: 0.9 }, 1.3)

      const off = onReady(() => {
        if (prefersReducedMotion()) intro.progress(1)
        else intro.play()
        video?.play().catch(() => {})
      })

      // 2 — scrolling in through the front door.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=160%',
          pin: stage,
          scrub: 0.9,
          onUpdate(self) {
            section.dataset.headerTone = self.progress > 0.42 ? 'light' : 'dark'
          },
        },
      })
      tl.to(state, { p: 1, duration: 1, ease: 'power2.inOut', onUpdate: paint }, 0)
        .to(video, { scale: 1, xPercent: 0, yPercent: 0, duration: 1, ease: 'power2.inOut' }, 0)
        .to(outline, { opacity: 0, duration: 0.35 }, 0)
        .to(wordsL, { xPercent: -60, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(wordsR, { xPercent: 60, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(section.querySelectorAll('.hero__meta, .hero__cue'), { opacity: 0, duration: 0.25 }, 0)
        .to(section.querySelector('.hero__shade'), { opacity: 1, duration: 0.5 }, 0.6)
        .to(splitC.words, { yPercent: 0, stagger: 0.05, duration: 0.4 }, 0.8)
        .to({}, { duration: 0.35 })

      return () => {
        off()
        ScrollTrigger.removeEventListener('refreshInit', measure)
        splitL.revert()
        splitR.revert()
        splitC.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hero" data-header-tone="dark" aria-label="Wear it. Live in it.">
      <div className="hero__stage">
        <div className="hero__meta">
          <span>{eyebrow}</span>
          <span>N° 01 — The Day In edit</span>
        </div>

        <div className="hero__media">
          <video muted loop playsInline preload="auto" poster="/img/l-hero.webp" aria-hidden>
            <source src="/video/hero.webm" type="video/webm" />
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
          <div className="hero__shade" />
        </div>

        <svg className="hero__outline" aria-hidden preserveAspectRatio="none">
          <path />
        </svg>

        <h1 className="hero__title">
          <span className="hero__word hero__word--l">{left}</span>
          <span className="hero__word hero__word--r">{right}</span>
        </h1>

        <p className="hero__caption t-display">{caption}</p>

        <div className="hero__cue">
          <span className="hero__key" aria-hidden>
            <svg viewBox="0 0 24 48">
              <circle cx="12" cy="9" r="7" />
              <path d="M12 16 V44 M12 34 H18 M12 40 H16" />
            </svg>
          </span>
          <span>Scroll to come inside</span>
        </div>
      </div>
    </section>
  )
}
