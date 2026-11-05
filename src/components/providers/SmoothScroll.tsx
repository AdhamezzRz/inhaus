'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

const LenisContext = createContext<Lenis | null>(null)
export const useLenis = () => useContext(LenisContext)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 })
    l.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // The Lenis instance is created client-side and shared through context.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(l)
    ;(window as unknown as { __lenis?: Lenis }).__lenis = l
    // The preloader mounts first; respect its scroll lock.
    if (document.documentElement.classList.contains('is-loading')) l.stop()
    return () => {
      gsap.ticker.remove(tick)
      l.destroy()
    }
  }, [])

  // New route: jump to top and let every ScrollTrigger re-measure.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    const id = setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => clearTimeout(id)
  }, [pathname, lenis])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
