/** Small brand marks drawn as inline SVG so they inherit currentColor. */

export function ButtonMark({
  className,
  color = 'currentColor',
  ring = 'rgba(0,0,0,.18)',
  holes = 'var(--paper)',
}: {
  className?: string
  color?: string
  ring?: string
  holes?: string
}) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill={color} />
      <circle cx="20" cy="20" r="14" fill="none" stroke={ring} strokeWidth="1.2" />
      <circle cx="16.2" cy="16.2" r="2.4" fill={holes} />
      <circle cx="23.8" cy="16.2" r="2.4" fill={holes} />
      <circle cx="16.2" cy="23.8" r="2.4" fill={holes} />
      <circle cx="23.8" cy="23.8" r="2.4" fill={holes} />
    </svg>
  )
}

/** The house outline from the brand book (chimney on the left, long ground line). */
export function HouseMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 80" fill="none" stroke="currentColor" aria-hidden>
      <path
        d="M2 76 H104 V40 H114 L72 6 L52 22 V12 H44 V29 L30 40 H40 V76"
        strokeWidth="2.2"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden fill="currentColor">
      <path d="M10 0c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10C5.2 9.4 9.4 5.2 10 0z" />
    </svg>
  )
}

/** The linen pouch icon used for the bag. */
export function PouchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" aria-hidden>
      <path d="M7 11h18l-1.6 15.2a2 2 0 0 1-2 1.8H10.6a2 2 0 0 1-2-1.8L7 11z" strokeWidth="1.4" />
      <path d="M7 11c2.5-1.4 5.5-2 9-2s6.5.6 9 2" strokeWidth="1.4" />
      <path d="M9.5 14.5h13" strokeWidth="1" strokeDasharray="1.6 1.8" />
      <g className="pouch-bow">
        <path d="M16 9c-2.6-3.6-6.4-3.4-5.6-.8.5 1.5 3.4 1.4 5.6.8z" strokeWidth="1.3" />
        <path d="M16 9c2.6-3.6 6.4-3.4 5.6-.8-.5 1.5-3.4 1.4-5.6.8z" strokeWidth="1.3" />
        <path d="M16 9l-2.6 5M16 9l2.6 5" strokeWidth="1.3" />
      </g>
    </svg>
  )
}

/** Organic blob outlines (all share the same command structure so they morph cleanly). */
export const BLOBS = [
  'M0.52,0.02 C0.74,0.0,0.96,0.14,0.98,0.40 C1.0,0.62,0.9,0.86,0.66,0.96 C0.44,1.04,0.16,0.94,0.06,0.72 C-0.04,0.5,0.04,0.22,0.24,0.1 C0.33,0.05,0.42,0.03,0.52,0.02 Z',
  'M0.48,0.04 C0.72,-0.02,0.94,0.2,0.96,0.44 C0.98,0.7,0.82,0.92,0.58,0.98 C0.34,1.03,0.08,0.86,0.03,0.6 C-0.02,0.36,0.1,0.14,0.3,0.07 C0.36,0.05,0.42,0.05,0.48,0.04 Z',
  'M0.56,0.0 C0.8,0.04,1.0,0.28,0.97,0.52 C0.94,0.78,0.74,0.98,0.48,0.99 C0.22,1.0,0.02,0.8,0.01,0.54 C0.0,0.3,0.16,0.08,0.38,0.02 C0.44,0.0,0.5,0.0,0.56,0.0 Z',
  'M0.5,0.0 C0.7,0.02,0.9,0.1,0.97,0.34 C1.04,0.58,0.92,0.84,0.7,0.95 C0.48,1.05,0.2,0.98,0.08,0.78 C-0.04,0.58,-0.02,0.3,0.16,0.12 C0.26,0.03,0.38,-0.01,0.5,0.0 Z',
]
