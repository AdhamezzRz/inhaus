'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { gsap } from '@/lib/gsap'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/catalog'
import { cx, formatPrice } from '@/lib/format'
import { ButtonMark } from '@/components/brand/Marks'
import { useCart } from '@/components/providers/CartProvider'
import { TLink, usePageTransition } from '@/components/providers/TransitionProvider'
import { startCheckout } from '@/app/(frontend)/actions'

/** The cart, as a sage linen pouch tied with a black satin ribbon. */
export function CartPouch() {
  const { lines, open, setOpen, subtotal, setQty, remove, clear, count } = useCart()
  const { navigate } = usePageTransition()
  const root = useRef<HTMLDivElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis
    const panel = el.querySelector('.pouch__panel')
    const ribbon = el.querySelectorAll('.pouch__ribbon path')
    if (open) {
      lenis?.stop()
      gsap
        .timeline()
        .set(el, { visibility: 'visible' })
        .to(el.querySelector('.pouch__veil'), { opacity: 1, duration: 0.6 })
        .fromTo(panel, { xPercent: 105, rotation: 3 }, { xPercent: 0, rotation: 0, duration: 1, ease: 'haus' }, '<')
        .fromTo(ribbon, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.1, stagger: 0.1, ease: 'power2.out' }, '<0.4')
        .fromTo(
          el.querySelectorAll('.pouch__line, .pouch__empty'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.7 },
          '<0.1',
        )
    } else {
      lenis?.start()
      gsap
        .timeline({ onComplete: () => void gsap.set(el, { visibility: 'hidden' }) })
        .to(panel, { xPercent: 105, duration: 0.7, ease: 'power3.in' })
        .to(el.querySelector('.pouch__veil'), { opacity: 0, duration: 0.5 }, '<0.2')
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)

  const checkout = () => {
    setError(null)
    startTransition(async () => {
      const res = await startCheckout(lines.map((l) => ({ variantId: l.variantId, qty: l.qty })))
      if (!res.ok) return setError(res.error)
      if (res.demo) {
        setOpen(false)
        navigate(res.url)
        window.setTimeout(clear, 1200)
      } else {
        window.location.href = res.url
      }
    })
  }

  return (
    <div ref={root} className="pouch" style={{ visibility: 'hidden' }} aria-hidden={!open}>
      <div className="pouch__veil" onClick={() => setOpen(false)} />
      <aside className="pouch__panel" role="dialog" aria-label="Your pouch">
        <div className="pouch__stitch" />
        <svg className="pouch__ribbon" viewBox="0 0 220 90" aria-hidden>
          <path d="M110 40 C 70 -6, 18 8, 34 36 C 46 56, 92 50, 110 40" />
          <path d="M110 40 C 150 -6, 202 8, 186 36 C 174 56, 128 50, 110 40" />
          <path d="M110 40 C 100 58, 84 74, 70 88" />
          <path d="M110 40 C 120 58, 136 74, 152 88" />
        </svg>
        <header className="pouch__head">
          <p className="t-caps">Your pouch</p>
          <h2 className="t-display">
            {count === 0 ? 'still empty' : `${count} soft thing${count === 1 ? '' : 's'}`}
          </h2>
          <button className="pouch__close ulink" onClick={() => setOpen(false)}>
            Close
          </button>
        </header>

        <div className="pouch__thread" aria-label={remaining ? `${formatPrice(remaining)} until free delivery` : 'Free delivery unlocked'}>
          <p>
            {remaining
              ? `You’re ${formatPrice(remaining)} away from complimentary delivery`
              : 'Complimentary delivery — it’s on us'}
          </p>
          <div className="pouch__track">
            <span style={{ transform: `scaleX(${progress})` }} />
            <ButtonMark className="pouch__needle" color="var(--cream)" holes="var(--sage-deep)" ring="rgba(0,0,0,.2)" />
          </div>
        </div>

        <div className="pouch__lines" data-lenis-prevent>
          {lines.length === 0 && (
            <div className="pouch__empty">
              <p>Nothing folded in here yet.</p>
              <TLink href="/shop" className="btn btn--cream" onClick={() => setOpen(false)}>
                <span>Find something soft</span>
              </TLink>
            </div>
          )}
          {lines.map((l) => (
            <article key={l.variantId} className="pouch__line">
              <TLink href={`/product/${l.handle}`} className="pouch__thumb" onClick={() => setOpen(false)}>
                <img src={l.image} alt="" />
              </TLink>
              <div className="pouch__info">
                <h3>{l.title}</h3>
                <p>
                  {l.colorName} · {l.size}
                </p>
                <div className="qty">
                  <button onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="Remove one">
                    −
                  </button>
                  <span>{l.qty}</span>
                  <button onClick={() => setQty(l.variantId, l.qty + 1)} aria-label="Add one">
                    +
                  </button>
                </div>
              </div>
              <div className="pouch__price">
                <span>{formatPrice(l.price * l.qty, l.currency)}</span>
                <button className="ulink" onClick={() => remove(l.variantId)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <footer className="pouch__foot">
          <div className="pouch__subtotal">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <p className="pouch__note">Taxes included. Delivery calculated at checkout.</p>
          {error && <p className="pouch__error">{error}</p>}
          <button className={cx('btn btn--cream btn--full', pending && 'is-busy')} disabled={!lines.length || pending} onClick={checkout}>
            <span>{pending ? 'Tying the ribbon…' : 'Checkout'}</span>
          </button>
        </footer>
      </aside>
    </div>
  )
}
