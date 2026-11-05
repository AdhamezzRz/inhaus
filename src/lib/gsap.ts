'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

let registered = false
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Draggable,
    InertiaPlugin,
    CustomEase,
    Flip,
    useGSAP,
  )
  CustomEase.create('haus', '0.65,0,0.15,1')
  CustomEase.create('silk', '0.22,1,0.36,1')
  CustomEase.create('drape', 'M0,0 C0.3,0 0.2,1 1,1')
  gsap.defaults({ ease: 'silk', duration: 1 })
  registered = true
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

/**
 * Pen strokes use round caps, so a 0-length dash would still paint a dot.
 * Keep each stroke hidden until its own draw tween starts.
 */
export function penReset(paths: ArrayLike<Element>) {
  const list = Array.from(paths)
  gsap.set(list, { drawSVG: '0%' })
  list.forEach((p) => p.classList.remove('is-drawing'))
}
export function penStart(this: gsap.core.Tween) {
  ;(this.targets() as Element[]).forEach((t) => t.classList.add('is-drawing'))
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Draggable, InertiaPlugin, Flip, useGSAP }
