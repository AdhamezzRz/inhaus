'use client'

import { useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { formatPrice } from '@/lib/format'
import { roomByKey, type Product } from '@/lib/catalog'
import { ButtonMark } from '@/components/brand/Marks'
import { useCart } from '@/components/providers/CartProvider'
import { TLink } from '@/components/providers/TransitionProvider'

/**
 * A product with a paper hang tag. On hover the lifestyle photo spreads out
 * from the cursor and the tag swings; quick-add sends it flying into the pouch.
 */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart()
  const frame = useRef<HTMLSpanElement>(null)
  const tag = useRef<HTMLSpanElement>(null)
  const alt = useRef<HTMLImageElement>(null)

  const enter = (e: React.PointerEvent) => {
    const r = frame.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    if (alt.current)
      gsap.fromTo(
        alt.current,
        { clipPath: `circle(0% at ${x}% ${y}%)` },
        { clipPath: `circle(150% at ${x}% ${y}%)`, duration: 1.1, ease: 'silk' },
      )
    gsap.fromTo(tag.current, { rotation: -18 }, { rotation: 0, duration: 1.8, ease: 'elastic.out(1.2, 0.25)' })
  }
  const leave = (e: React.PointerEvent) => {
    const r = frame.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    if (alt.current) gsap.to(alt.current, { clipPath: `circle(0% at ${x}% ${y}%)`, duration: 0.7, ease: 'power3.inOut' })
  }

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const v =
      product.variants.find((x) => x.available && (x.size === 'M' || x.size === 'One size' || x.size === 'S/M')) ??
      product.variants.find((x) => x.available)
    if (!v) return
    add(
      {
        variantId: v.id,
        handle: product.handle,
        title: product.title,
        size: v.size,
        colorName: product.colorName,
        price: v.price,
        currency: product.currency,
        image: product.images[0]?.src ?? '',
      },
      frame.current,
    )
  }

  const soldOut = product.variants.every((v) => !v.available)

  return (
    <article className="pcard" style={{ ['--i' as string]: index }} data-flip-id={product.handle}>
      <TLink href={`/product/${product.handle}`} className="pcard__link" data-cursor="view">
        <span ref={frame} className="pcard__frame" onPointerEnter={enter} onPointerLeave={leave}>
          <img src={product.images[0]?.src} alt={product.images[0]?.alt ?? product.title} loading="lazy" />
          {product.lifestyle && <img ref={alt} className="pcard__alt" src={product.lifestyle} alt="" loading="lazy" />}
          {product.badge && <span className="pcard__badge">{product.badge}</span>}
          <span ref={tag} className="pcard__tag" aria-hidden>
            <i className="pcard__string" />
            <span className="pcard__tagbody">
              <small>{roomByKey(product.room).name}</small>
              <b>{formatPrice(product.price, product.currency)}</b>
            </span>
          </span>
          {!soldOut && (
            <button className="pcard__quick" onClick={quickAdd} aria-label={`Quick add ${product.title}`}>
              <span>+ Quick add</span>
            </button>
          )}
        </span>
        <span className="pcard__body">
          <span className="pcard__title">{product.title}</span>
          <span className="pcard__sub">{product.subtitle}</span>
          <span className="pcard__row">
            <ButtonMark className="pcard__swatch" color={product.colorHex} />
            <span>{product.colorName}</span>
            <span className="pcard__price">{soldOut ? 'Sold out' : formatPrice(product.price, product.currency)}</span>
          </span>
        </span>
      </TLink>
    </article>
  )
}
