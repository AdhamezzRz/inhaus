'use client'

import { useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { cx, formatPrice } from '@/lib/format'
import { roomByKey, type Product } from '@/lib/catalog'
import { ButtonMark } from '@/components/brand/Marks'
import { useCart } from '@/components/providers/CartProvider'
import { TLink } from '@/components/providers/TransitionProvider'

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [isOpen, setOpen] = useState(open)
  const body = useRef<HTMLDivElement>(null)
  const toggle = () => {
    const el = body.current
    if (!el) return
    if (isOpen) gsap.to(el, { height: 0, duration: 0.6, ease: 'haus' })
    else gsap.fromTo(el, { height: 0 }, { height: 'auto', duration: 0.7, ease: 'haus' })
    setOpen(!isOpen)
  }
  return (
    <div className={cx('acc', isOpen && 'is-open')}>
      <button className="acc__head" onClick={toggle} aria-expanded={isOpen}>
        <span>{title}</span>
        <i aria-hidden />
      </button>
      <div ref={body} className="acc__body" style={{ height: open ? 'auto' : 0 }}>
        <div className="acc__inner">{children}</div>
      </div>
    </div>
  )
}

export function ProductView({ product }: { product: Product }) {
  const { add } = useCart()
  const root = useRef<HTMLDivElement>(null)
  const firstImg = useRef<HTMLDivElement>(null)
  const onlyOne = product.variants.length === 1
  const [size, setSize] = useState<string | null>(onlyOne ? product.variants[0].size : null)
  const [added, setAdded] = useState(false)
  const room = roomByKey(product.room)
  const variant = product.variants.find((v) => v.size === size)

  const gallery = [
    ...product.images,
    ...(product.lifestyle ? [{ src: product.lifestyle, alt: `${product.title}, styled at home` }] : []),
  ]

  useGSAP(
    () => {
      const el = root.current!
      gsap.from(el.querySelectorAll('.pv__panel > *'), { y: 30, opacity: 0, stagger: 0.07, duration: 1, delay: 0.4 })
      gsap.utils.toArray<HTMLElement>('.pv__shot img', el).forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.12 },
          { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      // The hang tag swings with the cursor.
      const tag = el.querySelector('.pv__hangtag')
      const rot = gsap.quickTo(tag, 'rotation', { duration: 1.2, ease: 'elastic.out(1, 0.3)' })
      const move = (e: PointerEvent) => rot(gsap.utils.clamp(-14, 14, e.movementX * 0.8))
      window.addEventListener('pointermove', move)
      return () => window.removeEventListener('pointermove', move)
    },
    { scope: root },
  )

  const addToPouch = () => {
    if (!variant) {
      gsap.fromTo(root.current!.querySelector('.pv__sizes'), { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.4, 0.2)' })
      return
    }
    add(
      {
        variantId: variant.id,
        handle: product.handle,
        title: product.title,
        size: variant.size,
        colorName: product.colorName,
        price: variant.price,
        currency: product.currency,
        image: product.images[0]?.src ?? '',
      },
      firstImg.current,
    )
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2400)
  }

  const cta = !variant
    ? 'Choose your size'
    : !variant.available
      ? 'Sold out — notify me'
      : added
        ? 'Folded into your pouch ✓'
        : `Add to pouch — ${formatPrice(variant.price, product.currency)}`

  return (
    <div ref={root} className="pv">
      <div className="pv__gallery">
        {gallery.map((g, i) => (
          <div key={g.src} ref={i === 0 ? firstImg : undefined} className={cx('pv__shot', i === 0 && 'pv__shot--hero')}>
            <img src={g.src} alt={g.alt} />
            {i === 0 && (
              <div className="pv__hangtag" aria-hidden>
                <span className="pv__hangtag-string" />
                <span className="pv__hangtag-body">
                  WEAR IT.
                  <br />
                  LIVE IN IT.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <aside className="pv__panel">
        <nav className="pv__crumbs t-caps" aria-label="Breadcrumb">
          <TLink href="/shop">Shop</TLink>
          <span>/</span>
          <TLink href={`/shop?room=${room.key}`}>{room.name}</TLink>
        </nav>
        {product.badge && <span className="pv__badge">{product.badge}</span>}
        <h1 className="pv__title t-display">{product.title}</h1>
        <p className="pv__sub t-caps">{product.subtitle}</p>
        <p className="pv__price">
          {formatPrice(variant?.price ?? product.price, product.currency)}
          {product.compareAtPrice && <s>{formatPrice(product.compareAtPrice, product.currency)}</s>}
        </p>
        <p className="pv__desc">{product.description}</p>

        <div className="pv__colour">
          <ButtonMark className="pv__btn" color={product.colorHex} />
          <span>
            <small className="t-caps">Colour</small>
            {product.colorName}
          </span>
        </div>

        {!onlyOne && (
          <div className="pv__sizes" role="radiogroup" aria-label="Size">
            <div className="pv__sizes-head">
              <small className="t-caps">Size</small>
              <TLink href="/the-haus#care" className="ulink t-caps">
                Size guide
              </TLink>
            </div>
            <div className="pv__size-row">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={size === v.size}
                  className={cx('sizetag', size === v.size && 'is-on', !v.available && 'is-out')}
                  onClick={() => setSize(v.size)}
                >
                  <i aria-hidden />
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className={cx('btn btn--sage btn--full pv__add', added && 'is-added', variant && !variant.available && 'is-out')}
          onClick={addToPouch}
          disabled={Boolean(variant && !variant.available)}
        >
          <span>{cta}</span>
        </button>

        <ul className="pv__perks">
          <li>Wrapped in our linen pouch</li>
          <li>Free delivery over EGP 5,000</li>
          <li>14-day exchanges</li>
        </ul>

        <div className="pv__accs">
          <Accordion title="The details" open>
            <ul>
              {product.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Fabric & care">
            <p>{product.fabric}</p>
            <p>{product.care}</p>
          </Accordion>
          <Accordion title="Delivery & exchanges">
            <p>Delivery in 2–4 working days across Egypt (same-day in Cairo for orders before 1pm). Exchanges within 14 days, unworn and in the pouch.</p>
          </Accordion>
        </div>

      </aside>

      <div className="pv__mobilebar">
        <span>
          <b>{product.title}</b>
          {formatPrice(variant?.price ?? product.price, product.currency)}
        </span>
        <button className="btn btn--sage" onClick={addToPouch}>
          <span>{variant ? 'Add to pouch' : 'Pick a size'}</span>
        </button>
      </div>
    </div>
  )
}
