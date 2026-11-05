import { useId } from 'react'

import { LOGO_D, LOGO_SCALE, LOGO_VIEWBOX, PEN_LINE_1, PEN_LINE_2, PEN_WIDTH } from './logoPaths'

type Props = {
  className?: string
  /** Render the pen-stroke mask so the wordmark can be "written" with DrawSVG. */
  write?: boolean
  title?: string
}

/**
 * The custom INN HAUS script wordmark, vectorised from the brand book.
 * With `write`, a hidden pen path (traced in the order the letters are written)
 * masks the letterforms — animate `.wordmark__pen path` with DrawSVG 0% → 100%.
 */
export function Wordmark({ className, write = false, title = 'inn haus' }: Props) {
  const raw = useId()
  const id = `wm${raw.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg
      className={['wordmark', write && 'wordmark--write', className].filter(Boolean).join(' ')}
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label={title}
      fill="currentColor"
    >
      {write && (
        <defs>
          <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="442">
            <g
              className="wordmark__pen"
              fill="none"
              stroke="#fff"
              strokeWidth={PEN_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={PEN_LINE_1} />
              <path d={PEN_LINE_2} />
            </g>
          </mask>
        </defs>
      )}
      <g mask={write ? `url(#${id})` : undefined}>
        <path transform={`scale(${LOGO_SCALE})`} d={LOGO_D} />
      </g>
    </svg>
  )
}

/** The "pen" itself — the same path, used to move a nib along the stroke. */
export const PEN_PATHS = [PEN_LINE_1, PEN_LINE_2]
