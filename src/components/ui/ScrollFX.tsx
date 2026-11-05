'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from '@/lib/gsap'
import { onReady } from './Preloader'

/**
 * Declarative scroll effects, so server components can stay server components:
 *   data-reveal            fade + rise when it enters
 *   data-split="lines|chars|words"  SplitText reveal
 *   data-parallax="0.2"    drift against the scroll
 *   data-img-reveal        image unveils from a soft clip
 *   data-draw              DrawSVG every <path> inside on enter
 */
export function ScrollFX() {
  const pathname = usePathname()

  useEffect(() => {
    if (prefersReducedMotion()) return
    let ctx: gsap.Context | null = null
    const splits: SplitText[] = []

    const run = () => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 1.2,
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: { trigger: el, start: 'top 88%' },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
          const type = (el.dataset.split || 'lines') as 'lines' | 'chars' | 'words'
          const split = SplitText.create(el, {
            type: type === 'lines' ? 'lines' : `lines,${type}`,
            mask: 'lines',
            linesClass: 'split-line',
          })
          splits.push(split)
          const targets = type === 'lines' ? split.lines : type === 'chars' ? split.chars : split.words
          gsap.from(targets, {
            yPercent: 110,
            rotation: type === 'chars' ? 8 : 2,
            duration: type === 'chars' ? 1 : 1.25,
            stagger: type === 'chars' ? 0.025 : 0.08,
            delay: Number(el.dataset.delay ?? 0),
            ease: 'silk',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amt = Number(el.dataset.parallax || 0.15)
          gsap.fromTo(
            el,
            { yPercent: -amt * 50 },
            {
              yPercent: amt * 50,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>('[data-img-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(18% 12% 18% 12% round 999px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 0px)',
              duration: 1.6,
              ease: 'haus',
              scrollTrigger: { trigger: el, start: 'top 85%' },
            },
          )
          const img = el.querySelector('img')
          if (img) gsap.from(img, { scale: 1.3, duration: 2, ease: 'silk', scrollTrigger: { trigger: el, start: 'top 85%' } })
        })

        gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll('path, line, circle, rect'),
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 1.8, stagger: 0.1, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } },
          )
        })
      })
      ScrollTrigger.refresh()
    }

    let off = () => {}
    const id = window.setTimeout(() => {
      off = onReady(run)
    }, 60)

    return () => {
      window.clearTimeout(id)
      off()
      ctx?.revert()
      splits.forEach((s) => s.revert())
    }
  }, [pathname])

  return null
}
