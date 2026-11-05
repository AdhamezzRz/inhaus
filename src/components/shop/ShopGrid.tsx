'use client'

import { useSearchParams } from 'next/navigation'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Flip, gsap, ScrollTrigger } from '@/lib/gsap'
import { cx } from '@/lib/format'
import { ROOMS, type Product, type RoomKey } from '@/lib/catalog'
import { ProductCard } from './ProductCard'

type Sort = 'edit' | 'low' | 'high'

export function ShopGrid({ products }: { products: Product[] }) {
  const params = useSearchParams()
  const param = params.get('room')
  const room: RoomKey | 'all' = ROOMS.some((r) => r.key === param) ? (param as RoomKey) : 'all'
  const [sort, setSort] = useState<Sort>('edit')
  const grid = useRef<HTMLDivElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  const list = useMemo(() => {
    const filtered = room === 'all' ? products : products.filter((p) => p.room === room)
    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [products, room, sort])

  const capture = () => {
    if (grid.current) flipState.current = Flip.getState(grid.current.querySelectorAll('.pcard'))
  }

  // Changing rooms rewrites the URL in place; Next keeps useSearchParams in sync without a round trip.
  const choose = (r: RoomKey | 'all') => {
    if (r === room) return
    capture()
    window.history.replaceState(null, '', r === 'all' ? '/shop' : `/shop?room=${r}`)
  }

  useLayoutEffect(() => {
    if (!grid.current) return
    const state = flipState.current
    flipState.current = null
    if (!state) return
    Flip.from(state, {
      targets: grid.current.querySelectorAll('.pcard'),
      duration: 0.9,
      ease: 'haus',
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.05 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
      onComplete: () => ScrollTrigger.refresh(),
    })
  }, [list])
  const active = ROOMS.find((r) => r.key === room)

  return (
    <>
      <div className="shopbar">
        <div className="shopbar__rooms" role="tablist" aria-label="Rooms">
          <button role="tab" aria-selected={room === 'all'} className={cx('chip', room === 'all' && 'is-on')} onClick={() => choose('all')}>
            Every room <sup>{products.length}</sup>
          </button>
          {ROOMS.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={room === r.key}
              className={cx('chip', room === r.key && 'is-on')}
              onClick={() => choose(r.key)}
            >
              {r.name} <sup>{products.filter((p) => p.room === r.key).length}</sup>
            </button>
          ))}
        </div>
        <label className="shopbar__sort">
          <span className="t-caps">Sort</span>
          <select
            value={sort}
            onChange={(e) => {
              capture()
              setSort(e.target.value as Sort)
            }}
          >
            <option value="edit">Our edit</option>
            <option value="low">Price, low to high</option>
            <option value="high">Price, high to low</option>
          </select>
        </label>
      </div>

      <p className="shop__roomline" key={room}>
        {active ? active.line : 'Every soft thing in the haus, all in one place.'}
      </p>

      <div ref={grid} className="pgrid">
        {list.map((p, i) => (
          <ProductCard key={p.handle} product={p} index={i} />
        ))}
      </div>
    </>
  )
}
