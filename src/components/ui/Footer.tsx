'use client'

import Link from 'next/link'
import { useActionState, useRef } from 'react'

import { gsap, penReset, penStart, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { Wordmark } from '@/components/brand/Wordmark'
import { ButtonMark } from '@/components/brand/Marks'
import { TLink } from '@/components/providers/TransitionProvider'
import { joinHausList } from '@/app/(frontend)/actions'
import type { SiteSettingsData } from '@/lib/cms'

const WINDOWS = [
  [118, 132],
  [168, 132],
  [218, 132],
  [118, 196],
  [218, 196],
  [302, 160],
  [352, 160],
]

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const root = useRef<HTMLElement>(null)
  const [state, action, pending] = useActionState(joinHausList, null)

  useGSAP(
    () => {
      const el = root.current!
      const pens = el.querySelectorAll<SVGPathElement>('.footer__giant .wordmark__pen path')
      penReset(pens)
      gsap
        .timeline({ scrollTrigger: { trigger: el.querySelector('.footer__giant'), start: 'top 85%' } })
        .to(pens, { drawSVG: '100%', duration: 1.6, stagger: { each: 1.2, onStart: penStart }, ease: 'power1.inOut' })

      // Night falls on the little house: the windows switch on one by one.
      gsap
        .timeline({
          scrollTrigger: { trigger: el.querySelector('.footer__house'), start: 'top 90%', end: 'bottom 70%', scrub: 1 },
        })
        .fromTo(el.querySelectorAll('.footer__house path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 2 })
        .fromTo(
          el.querySelectorAll('.footer__window'),
          { opacity: 0 },
          { opacity: 1, stagger: { each: 0.25, from: 'random' }, duration: 0.3 },
          '>-0.6',
        )
        .fromTo(el.querySelector('.footer__smoke'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, '<')

      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        onEnter: () => gsap.to(el.querySelectorAll('.footer__btn'), { rotation: 360, duration: 2, stagger: 0.1 }),
      })
    },
    { scope: root },
  )

  const year = new Date().getFullYear()

  return (
    <footer ref={root} className="footer" data-header-tone="light">
      <div className="footer__pattern" aria-hidden />
      <div className="footer__top">
        <div className="footer__join">
          <p className="t-caps">The haus list</p>
          <h2 className="t-display">come over more often</h2>
          <p className="footer__lede">
            New drops, slow-living notes and first dibs on restocks. No spam — we hate it too.
          </p>
          <form action={action} className="tagform">
            <span className="tagform__hole" aria-hidden />
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input id="footer-email" name="email" type="email" required placeholder="your@email.com" autoComplete="email" />
            <button type="submit" disabled={pending} className="tagform__btn">
              {pending ? '…' : 'Join'}
            </button>
          </form>
          {state && <p className={state.ok ? 'footer__ok' : 'footer__err'}>{state.message}</p>}
        </div>

        <svg className="footer__house" viewBox="0 0 440 300" aria-hidden>
          <path d="M0 290 H360 V120 H392 L232 24 L150 74 V40 H124 V90 L72 120 H104 V290" />
          {WINDOWS.map(([x, y], i) => (
            <rect key={i} className="footer__window" x={x} y={y} width="30" height="38" rx="2" />
          ))}
          <rect className="footer__window footer__door" x="262" y="222" width="44" height="68" rx="22" ry="22" />
          <path className="footer__smoke" d="M137 34 C 128 22, 146 16, 137 4" />
        </svg>
      </div>

      <div className="footer__cols">
        <div>
          <p className="t-caps">Rooms</p>
          <TLink href="/shop?room=day-in">Day In</TLink>
          <TLink href="/shop?room=friends-house">Friend’s House</TLink>
          <TLink href="/shop?room=quick-errand">Quick Errand</TLink>
          <TLink href="/shop?room=little-things">Little Things</TLink>
        </div>
        <div>
          <p className="t-caps">The haus</p>
          <TLink href="/the-haus">Our story</TLink>
          <TLink href="/journal">Journal</TLink>
          <TLink href="/the-haus#packaging">Packaging</TLink>
          <Link href="/admin" prefetch={false}>
            Studio login
          </Link>
        </div>
        <div>
          <p className="t-caps">Help</p>
          <TLink href="/the-haus#care">Delivery &amp; returns</TLink>
          <TLink href="/the-haus#care">Size guide</TLink>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          {settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp}`}>WhatsApp us</a>}
        </div>
        <div>
          <p className="t-caps">Follow</p>
          <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={`https://tiktok.com/@${settings.tiktok}`} target="_blank" rel="noreferrer">
            TikTok
          </a>
          <div className="footer__btns">
            {['var(--cream)', 'var(--dusty-blue)', 'var(--sage)', 'var(--burgundy)', 'var(--espresso-soft)'].map((c) => (
              <ButtonMark key={c} className="footer__btn" color={c} holes="var(--night)" />
            ))}
          </div>
        </div>
      </div>

      <div className="footer__giant">
        <Wordmark write />
      </div>

      <div className="footer__base">
        <span>© {year} INN HAUS</span>
        <span>Wear it. Live in it.</span>
        <span>Made in Cairo, for staying in</span>
      </div>
    </footer>
  )
}
