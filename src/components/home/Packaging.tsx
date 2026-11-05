'use client'

import { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { LOGO_D, LOGO_SCALE } from '@/components/brand/logoPaths'

/** Scroll to pack an order: card in, flap down, ribbon tied, tag on. */
export function Packaging({ title, text }: { title: string; text: string }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)
      gsap.set(q('.pk-ribbon'), { drawSVG: '0%' })
      gsap.set(q('.pk-bow'), { drawSVG: '50% 50%' })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=170%',
          pin: q('.pack__pin'),
          scrub: 0.8,
        },
      })
      tl.from(q('.pk-pouch'), { y: 140, opacity: 0, duration: 0.6 })
        .from(q('.pk-card'), { y: -420, rotation: -14, duration: 0.9 }, 0.2)
        .to(q('.pk-card'), { y: 150, duration: 0.6, ease: 'power2.in' }, '>')
        .fromTo(q('.pk-flap'), { scaleY: -1 }, { scaleY: 1, duration: 0.5, transformOrigin: '50% 0%' }, '>-0.1')
        .to(q('.pk-ribbon'), { drawSVG: '100%', duration: 0.6, stagger: 0.1 }, '>')
        .to(q('.pk-bow'), { drawSVG: '0% 100%', duration: 0.6, stagger: 0.08 }, '>-0.2')
        .fromTo(q('.pk-knot'), { scale: 0 }, { scale: 1, duration: 0.25, transformOrigin: '50% 50%', ease: 'back.out(3)' }, '<0.3')
        .from(q('.pk-tag'), { y: -260, rotation: 40, duration: 0.7, ease: 'bounce.out' }, '>')
        .to(q('.pk-tag'), { rotation: -8, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '>')
        .from(q('.pack__step'), { opacity: 0.2, stagger: 0.6, duration: 0.3 }, 0.2)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="pack" data-header-tone="dark" id="packaging">
      <div className="pack__pin">
        <div className="pack__copy">
          <p className="t-caps">N° 07 — The unboxing</p>
          <h2 className="t-display">{title}</h2>
          <p>{text}</p>
          <ol className="pack__steps">
            <li className="pack__step">Folded by hand</li>
            <li className="pack__step">Tucked in sage linen</li>
            <li className="pack__step">Tied with black satin</li>
            <li className="pack__step">Signed, with a thank you</li>
          </ol>
        </div>

        <svg className="pack__scene" viewBox="0 0 600 640" aria-hidden>
          <defs>
            <pattern id="linen" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#737B5B" />
              <path d="M0 3 H6 M3 0 V6" stroke="#6A7253" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* thank-you card (scalloped) */}
          <g className="pk-card">
            <path
              d="M170 120 q15 -14 30 0 q15 -14 30 0 q15 -14 30 0 q15 -14 30 0 q15 -14 30 0 q15 -14 30 0 q15 -14 30 0 q15 -14 30 0 V330 q-15 14 -30 0 q-15 14 -30 0 q-15 14 -30 0 q-15 14 -30 0 q-15 14 -30 0 q-15 14 -30 0 q-15 14 -30 0 q-15 14 -30 0 Z"
              fill="#F3F0E9"
              stroke="#E2DACB"
            />
            <text x="290" y="190" textAnchor="middle" className="pk-card__title">
              THANK YOU
            </text>
            <text x="290" y="212" textAnchor="middle" className="pk-card__sub">
              WE HOPE YOU LOVE YOUR ORDER
            </text>
            <g transform="translate(232 232) scale(0.13)" fill="#737B5B">
              <path transform={`scale(${LOGO_SCALE})`} d={LOGO_D} />
            </g>
          </g>

          {/* pouch */}
          <g className="pk-pouch">
            <rect x="110" y="250" width="380" height="330" rx="10" fill="url(#linen)" />
            <rect x="124" y="264" width="352" height="302" rx="6" fill="none" stroke="#C9CDB6" strokeDasharray="6 6" strokeWidth="1.4" />
            <g transform="translate(240 470) scale(0.135)" fill="#E9E6D8" opacity="0.9">
              <path transform={`scale(${LOGO_SCALE})`} d={LOGO_D} />
            </g>
            <text x="300" y="548" textAnchor="middle" className="pk-pouch__tag">
              WEAR IT. LIVE IN IT.
            </text>
          </g>
          <path className="pk-flap" d="M110 250 H490 V330 Q300 372 110 330 Z" fill="#6A7253" />

          {/* ribbon */}
          <path className="pk-ribbon" d="M300 250 V580" stroke="#141110" strokeWidth="12" fill="none" />
          <path className="pk-ribbon" d="M110 360 H490" stroke="#141110" strokeWidth="12" fill="none" />
          <path className="pk-bow" d="M300 330 C 240 260, 180 300, 214 336 C 236 360, 280 344, 300 330" stroke="#141110" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path className="pk-bow" d="M300 330 C 360 260, 420 300, 386 336 C 364 360, 320 344, 300 330" stroke="#141110" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path className="pk-bow" d="M300 330 C 286 370, 262 404, 238 430" stroke="#141110" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path className="pk-bow" d="M300 330 C 314 370, 340 404, 364 430" stroke="#141110" strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect className="pk-knot" x="288" y="318" width="24" height="24" rx="7" fill="#141110" />

          {/* hang tag */}
          <g className="pk-tag" style={{ transformOrigin: '300px 330px' }}>
            <path d="M300 330 C 330 380, 400 400, 420 420" stroke="#E8E0CF" strokeWidth="2" fill="none" />
            <g transform="translate(400 410) rotate(-12)">
              <rect width="82" height="118" rx="6" fill="#F3F0E9" stroke="#E2DACB" />
              <circle cx="41" cy="14" r="5" fill="#E2DACB" />
              <text x="41" y="56" textAnchor="middle" className="pk-tag__text">
                WEAR IT.
              </text>
              <text x="41" y="72" textAnchor="middle" className="pk-tag__text">
                LIVE IN IT.
              </text>
              <g transform="translate(16 84) scale(0.056)" fill="#A9A08F">
                <path transform={`scale(${LOGO_SCALE})`} d={LOGO_D} />
              </g>
            </g>
          </g>
        </svg>

        <figure className="pack__photo" data-parallax="0.25">
          <img src="/img/l-packaging.webp" alt="Sage linen pouches tied with black satin ribbon" />
        </figure>
      </div>
    </section>
  )
}
