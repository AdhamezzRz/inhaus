'use client'

import { useRef } from 'react'

import { gsap, penReset, penStart, useGSAP } from '@/lib/gsap'
import { onReady } from './Preloader'
import { Wordmark } from '@/components/brand/Wordmark'
import { ButtonMark } from '@/components/brand/Marks'
import { TLink } from '@/components/providers/TransitionProvider'

const COLORS = ['#F3F0E9', '#AAB7C4', '#737B5B', '#743F46', '#473C38']

/** The scalloped thank-you card from the packaging page, with a shower of buttons. */
export function ThankYou({ demo }: { demo: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const pens = el.querySelectorAll('.wordmark__pen path')
      penReset(pens)
      const tl = gsap.timeline({ paused: true })
      tl.from(el.querySelector('.ty__card'), { y: 200, rotation: -8, opacity: 0, duration: 1.4, ease: 'back.out(1.2)' })
        .from(el.querySelectorAll('.ty__bow path'), { drawSVG: '50% 50%', duration: 1, stagger: 0.1 }, '-=0.6')
        .to(pens, { drawSVG: '100%', duration: 1.2, stagger: { each: 0.9, onStart: penStart }, ease: 'power1.inOut' }, '-=0.4')
        .from(el.querySelectorAll('.ty__line'), { opacity: 0, y: 14, stagger: 0.1 }, '-=1')
      el.querySelectorAll<HTMLElement>('.ty__confetti').forEach((c) => {
        tl.fromTo(
          c,
          { y: -200, x: 0, rotation: 0, opacity: 1 },
          {
            y: window.innerHeight + 200,
            x: gsap.utils.random(-160, 160),
            rotation: gsap.utils.random(-720, 720),
            duration: gsap.utils.random(2.6, 4.6),
            ease: 'power1.in',
          },
          gsap.utils.random(0.2, 1.4),
        )
      })
      return onReady(() => tl.play())
    },
    { scope: root },
  )

  return (
    <section ref={root} className="ty" data-header-tone="dark">
      {Array.from({ length: 34 }).map((_, i) => (
        <span
          key={i}
          className="ty__confetti"
          style={{ left: `${(i * 37) % 100}%`, width: 14 + ((i * 7) % 16) }}
          aria-hidden
        >
          <ButtonMark color={COLORS[i % COLORS.length]} />
        </span>
      ))}
      <div className="ty__card">
        <svg className="ty__bow" viewBox="0 0 220 90" aria-hidden>
          <path d="M110 40 C 70 -6, 18 8, 34 36 C 46 56, 92 50, 110 40" />
          <path d="M110 40 C 150 -6, 202 8, 186 36 C 174 56, 128 50, 110 40" />
          <path d="M110 40 C 100 58, 84 74, 70 88" />
          <path d="M110 40 C 120 58, 136 74, 152 88" />
        </svg>
        <p className="ty__line ty__title">THANK YOU</p>
        <p className="ty__line t-caps">We hope you love your order</p>
        <Wordmark write className="ty__mark" />
        <p className="ty__line">
          {demo
            ? 'This was a demo checkout — connect the Shopify Storefront token to take real orders.'
            : 'Your order is being folded by hand and tucked into its linen pouch. A confirmation is on its way to your inbox.'}
        </p>
        <TLink href="/shop" className="ty__line btn btn--sage">
          <span>Keep browsing</span>
        </TLink>
      </div>
    </section>
  )
}
