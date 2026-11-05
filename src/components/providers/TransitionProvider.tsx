'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef } from 'react'

import { gsap, penReset, penStart, prefersReducedMotion } from '@/lib/gsap'
import { Wordmark } from '@/components/brand/Wordmark'

type Ctx = { navigate: (href: string) => void }
const TransitionContext = createContext<Ctx>({ navigate: () => {} })
export const usePageTransition = () => useContext(TransitionContext)

/**
 * Page transitions: two linen curtains draw closed, the wordmark is written in
 * the middle, the new room loads, and the curtains part again.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const root = useRef<HTMLDivElement>(null)
  const pending = useRef<string | null>(null)
  const busy = useRef(false)

  const open = useCallback(() => {
    const el = root.current
    if (!el) return
    const tl = gsap.timeline({
      onComplete: () => {
        el.style.visibility = 'hidden'
        busy.current = false
      },
    })
    tl.to(el.querySelector('.curtain__mark'), { opacity: 0, y: -12, duration: 0.35, ease: 'power2.in' })
      .to(el.querySelector('.curtain__panel--l'), { xPercent: -101, duration: 1.15, ease: 'haus' }, '<0.15')
      .to(el.querySelector('.curtain__panel--r'), { xPercent: 101, duration: 1.15, ease: 'haus' }, '<')
      .to(el.querySelectorAll('.curtain__fold'), { scaleX: 0.55, duration: 1.15, ease: 'haus' }, '<')
  }, [])

  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return
      const url = new URL(href, window.location.href)
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        if (url.hash) document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      // Same room, different filter: no curtains, just update the URL.
      if (prefersReducedMotion() || !root.current || url.pathname === window.location.pathname) {
        router.push(href)
        return
      }
      busy.current = true
      pending.current = url.pathname
      const el = root.current
      el.style.visibility = 'visible'
      const mark = el.querySelector('.curtain__mark')
      const strokes = el.querySelectorAll<SVGPathElement>('.wordmark__pen path')
      gsap.set(mark, { opacity: 1, y: 0 })
      penReset(strokes)
      gsap
        .timeline({
          onComplete: () => router.push(href),
        })
        .fromTo(el.querySelector('.curtain__panel--l'), { xPercent: -101 }, { xPercent: 0, duration: 0.95, ease: 'haus' })
        .fromTo(
          el.querySelector('.curtain__panel--r'),
          { xPercent: 101 },
          { xPercent: 0, duration: 0.95, ease: 'haus' },
          '<',
        )
        .fromTo(el.querySelectorAll('.curtain__fold'), { scaleX: 0.55 }, { scaleX: 1, duration: 0.95, ease: 'haus' }, '<')
        .to(strokes, { drawSVG: '100%', duration: 0.9, stagger: { each: 0.45, onStart: penStart }, ease: 'power1.inOut' }, '-=0.35')
      // Safety: never leave the curtains shut.
      window.setTimeout(() => {
        if (busy.current) open()
      }, 6000)
    },
    [router, open],
  )

  useEffect(() => {
    const el = root.current
    if (!el) return
    gsap.set(el.querySelector('.curtain__panel--l'), { xPercent: -101 })
    gsap.set(el.querySelector('.curtain__panel--r'), { xPercent: 101 })
  }, [])

  useEffect(() => {
    if (pending.current && pending.current === pathname) {
      pending.current = null
      const id = window.setTimeout(open, 160)
      return () => window.clearTimeout(id)
    }
  }, [pathname, open])

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={root} className="curtain" aria-hidden style={{ visibility: 'hidden' }}>
        <div className="curtain__panel curtain__panel--l">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="curtain__fold" />
          ))}
        </div>
        <div className="curtain__panel curtain__panel--r">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="curtain__fold" />
          ))}
        </div>
        <div className="curtain__mark">
          <Wordmark write className="curtain__logo" />
        </div>
      </div>
    </TransitionContext.Provider>
  )
}

type LinkProps = React.ComponentProps<typeof NextLink>

/** Drop-in replacement for next/link that plays the curtain transition. */
export const TLink = forwardRef<HTMLAnchorElement, LinkProps>(function TLink(
  { href, onClick, ...rest },
  ref,
) {
  const { navigate } = usePageTransition()
  return (
    <NextLink
      ref={ref}
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        const h = typeof href === 'string' ? href : (href.pathname ?? '/')
        if (h.startsWith('http') || h.startsWith('mailto:')) return
        e.preventDefault()
        navigate(h)
      }}
    />
  )
})
