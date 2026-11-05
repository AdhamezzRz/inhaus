'use client'

import { useEffect, useRef } from 'react'

import { gsap, isTouch } from '@/lib/gsap'

/**
 * A sewing button for a cursor. It spins when it meets something clickable and
 * unfolds into a little label on elements with [data-cursor="view" | "drag" | …].
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isTouch()) return
    const el = dot.current
    if (!el) return
    document.documentElement.classList.add('has-cursor')
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })
    let lastX = 0
    let shown = false

    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY })
        gsap.to(el, { opacity: 1, duration: 0.3 })
        shown = true
      }
      xTo(e.clientX)
      yTo(e.clientY)
      const v = e.clientX - lastX
      lastX = e.clientX
      gsap.to(el.querySelector('.cursor__btn'), { rotation: `+=${v * 0.6}`, duration: 0.6, overwrite: 'auto' })
    }

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>(
        'a, button, [role="button"], input, select, textarea, label, [data-cursor]',
      )
      const mode = t?.dataset.cursor
      el.classList.toggle('is-link', Boolean(t) && !mode)
      el.classList.toggle('is-label', Boolean(mode))
      if (label.current) label.current.textContent = mode ?? ''
    }

    const leave = () => gsap.to(el, { opacity: 0, duration: 0.3 })
    const enter = () => gsap.to(el, { opacity: 1, duration: 0.3 })
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    document.documentElement.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.removeEventListener('pointerenter', enter)
    }
  }, [])

  return (
    <div ref={dot} className="cursor" aria-hidden>
      <div className="cursor__btn">
        <i />
        <i />
        <i />
        <i />
      </div>
      <span ref={label} className="cursor__label" />
    </div>
  )
}
