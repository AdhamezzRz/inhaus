'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { gsap } from '@/lib/gsap'
import { cx } from '@/lib/format'
import { Wordmark } from '@/components/brand/Wordmark'
import { PouchIcon } from '@/components/brand/Marks'
import { useCart } from '@/components/providers/CartProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { TLink } from '@/components/providers/TransitionProvider'

const NAV = [
  { href: '/shop', label: 'Shop', img: '/img/p-sunday-set.webp' },
  { href: '/shop?room=day-in', label: 'Day In', img: '/img/l-stretch.webp' },
  { href: "/shop?room=friends-house", label: "Friend's House", img: '/img/l-friends.webp' },
  { href: '/shop?room=quick-errand', label: 'Quick Errand', img: '/img/l-cafe.webp' },
  { href: '/the-haus', label: 'The Haus', img: '/img/l-packaging.webp' },
  { href: '/journal', label: 'Journal', img: '/img/l-kitchen.webp' },
]

export function Header({ announcements }: { announcements: string[] }) {
  const { count, setOpen } = useCart()
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)
  const [tone, setTone] = useState<'dark' | 'light'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [annIdx, setAnnIdx] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const pouchRef = useRef<HTMLButtonElement>(null)

  // Hide on the way down, return on the way up; pick a tone from the section underneath.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 30)
      setHidden(y > 240 && y > last + 2 ? true : y < last - 2 ? false : (h) => h)
      last = y
      const probe = 46
      let t: 'dark' | 'light' = 'dark'
      document.querySelectorAll<HTMLElement>('[data-header-tone]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= probe && r.bottom >= probe) t = s.dataset.headerTone as 'dark' | 'light'
      })
      setTone(t)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  // Close the menu whenever the route changes (adjusting state during render).
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setMenu(false)
  }

  useEffect(() => {
    if (announcements.length < 2) return
    const id = window.setInterval(() => setAnnIdx((i) => (i + 1) % announcements.length), 4200)
    return () => window.clearInterval(id)
  }, [announcements.length])

  // The pouch wiggles and its bow re-ties when something lands in it.
  useEffect(() => {
    const bump = () => {
      const p = pouchRef.current
      if (!p) return
      gsap
        .timeline()
        .to(p, { scale: 1.25, rotation: -8, duration: 0.18, ease: 'power2.out' })
        .to(p, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.2, 0.35)' })
        .fromTo(p.querySelector('.pouch-bow'), { scale: 0.2, transformOrigin: '50% 80%' }, { scale: 1, duration: 0.8, ease: 'elastic.out(1.4,0.4)' }, 0.1)
      if (countRef.current)
        gsap.fromTo(countRef.current, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' })
    }
    window.addEventListener('inhaus:pouch-bump', bump)
    return () => window.removeEventListener('inhaus:pouch-bump', bump)
  }, [])

  // Menu choreography.
  useEffect(() => {
    const m = document.querySelector('.menu')
    if (!m) return
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis
    if (menu) {
      lenis?.stop()
      gsap
        .timeline()
        .set(m, { visibility: 'visible' })
        .fromTo(m, { clipPath: 'circle(0% at 50% 0%)' }, { clipPath: 'circle(150% at 50% 0%)', duration: 1.1, ease: 'haus' })
        .fromTo(
          m.querySelectorAll('.menu__link'),
          { yPercent: 110, rotation: 4 },
          { yPercent: 0, rotation: 0, stagger: 0.06, duration: 0.9 },
          '<0.25',
        )
        .fromTo(m.querySelectorAll('.menu__foot > *'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.05 }, '<0.3')
    } else {
      lenis?.start()
      gsap.to(m, {
        clipPath: 'circle(0% at 50% 0%)',
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(m, { visibility: 'hidden' })
        },
      })
    }
  }, [menu])

  return (
    <>
      <header
        className={cx(
          'header',
          hidden && !menu && 'is-hidden',
          scrolled && 'is-scrolled',
          (tone === 'light' || menu) && 'is-light',
        )}
      >
        <div className="announce" aria-live="polite">
          {announcements.map((a, i) => (
            <p key={a} className={cx('announce__item', i === annIdx && 'is-active')}>
              {a}
            </p>
          ))}
        </div>
        <div className="header__bar">
          <nav className="header__nav" aria-label="Primary">
            <button
              className={cx('header__burger', menu && 'is-open')}
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-label="Menu"
            >
              <span />
              <span />
              <em>{menu ? 'Close' : 'Menu'}</em>
            </button>
            <div className="header__links">
              <TLink href="/shop" className="ulink">
                Shop
              </TLink>
              <TLink href="/the-haus" className="ulink">
                The Haus
              </TLink>
              <TLink href="/journal" className="ulink">
                Journal
              </TLink>
            </div>
          </nav>

          <TLink href="/" className="header__logo" aria-label="inn haus — home">
            <span id="header-logo">
              <Wordmark />
            </span>
          </TLink>

          <div className="header__actions">
            <button
              className="header__lights ulink"
              onClick={toggle}
              aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
            >
              <span className={cx('bulb', theme === 'night' && 'is-off')} aria-hidden />
              <span className="header__lights-text">{theme === 'day' ? 'Lights off' : 'Lights on'}</span>
            </button>
            <button
              ref={pouchRef}
              id="pouch-target"
              className="header__pouch"
              onClick={() => setOpen(true)}
              aria-label={`Open your pouch, ${count} items`}
            >
              <PouchIcon className="header__pouch-icon" />
              <span className="header__count">
                <span ref={countRef}>{count}</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="menu" style={{ visibility: 'hidden' }} aria-hidden={!menu}>
        <div className="menu__pattern" />
        <ul className="menu__list">
          {NAV.map((n, i) => (
            <li key={n.href} className="menu__item">
              <TLink href={n.href} className="menu__link" onClick={() => setMenu(false)}>
                <small>{String(i + 1).padStart(2, '0')}</small>
                <span>{n.label}</span>
                <img src={n.img} alt="" className="menu__peek" />
              </TLink>
            </li>
          ))}
        </ul>
        <div className="menu__foot">
          <span>Wear it. Live in it.</span>
          <span>Cairo — Shipping across Egypt</span>
          <button onClick={toggle} className="ulink">
            {theme === 'day' ? 'Turn the lights off' : 'Turn the lights on'}
          </button>
        </div>
      </div>
    </>
  )
}
