import { HouseMark } from '@/components/brand/Marks'
import { TLink } from '@/components/providers/TransitionProvider'

export default function NotFound() {
  return (
    <section className="lost" data-header-tone="dark">
      <HouseMark className="lost__house" />
      <p className="t-caps">404 — wrong door</p>
      <h1 className="t-display">this room is still being decorated</h1>
      <p>Let’s get you back somewhere cosy.</p>
      <div className="lost__ctas">
        <TLink href="/" className="btn btn--sage">
          <span>Back to the living room</span>
        </TLink>
        <TLink href="/shop" className="btn btn--ghost">
          <span>Browse the collection</span>
        </TLink>
      </div>
    </section>
  )
}
