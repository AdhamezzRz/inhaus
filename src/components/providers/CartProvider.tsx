'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { gsap } from '@/lib/gsap'

export type CartLine = {
  variantId: string
  handle: string
  title: string
  size: string
  colorName: string
  price: number
  currency: string
  image: string
  qty: number
}

type Ctx = {
  lines: CartLine[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (o: boolean) => void
  add: (line: Omit<CartLine, 'qty'>, from?: HTMLElement | null) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
}

const CartContext = createContext<Ctx | null>(null)
export const useCart = () => {
  const c = useContext(CartContext)
  if (!c) throw new Error('useCart outside CartProvider')
  return c
}

const KEY = 'innhaus-pouch'

/** Fly a copy of the product image along an arc into the pouch icon. */
function flyToPouch(from: HTMLElement, image: string, onLand: () => void) {
  const target = document.getElementById('pouch-target')
  if (!target) return onLand()
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const ghost = document.createElement('div')
  ghost.className = 'fly-ghost'
  ghost.style.backgroundImage = `url(${image})`
  Object.assign(ghost.style, {
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
  })
  document.body.appendChild(ghost)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const tl = gsap.timeline({
    onComplete: () => {
      ghost.remove()
      onLand()
    },
  })
  tl.to(ghost, { scale: 0.92, borderRadius: '50% 50% 46% 54%', duration: 0.25, ease: 'power2.out' })
    .to(ghost, { x: dx, duration: 0.9, ease: 'power1.inOut' }, '<0.1')
    .to(ghost, { y: dy, duration: 0.9, ease: 'back.in(1.4)' }, '<')
    .to(
      ghost,
      { scale: 26 / Math.max(a.width, a.height), rotation: 200, duration: 0.9, ease: 'power3.in' },
      '<',
    )
    .to(ghost, { opacity: 0, duration: 0.15 }, '>-0.1')
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      // Restore the saved pouch after hydration (server render has no localStorage).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* ignore */
    }
  }, [lines, loaded])

  const commit = useCallback((line: Omit<CartLine, 'qty'>) => {
    setLines((prev) => {
      const found = prev.find((l) => l.variantId === line.variantId)
      if (found) return prev.map((l) => (l.variantId === line.variantId ? { ...l, qty: l.qty + 1 } : l))
      return [...prev, { ...line, qty: 1 }]
    })
    window.dispatchEvent(new CustomEvent('inhaus:pouch-bump'))
  }, [])

  const add = useCallback<Ctx['add']>(
    (line, from) => {
      if (from) flyToPouch(from, line.image, () => commit(line))
      else commit(line)
    },
    [commit],
  )

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l)),
    )
  }, [])

  const remove = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<Ctx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0)
    return { lines, count, subtotal, open, setOpen, add, setQty, remove, clear }
  }, [lines, open, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
