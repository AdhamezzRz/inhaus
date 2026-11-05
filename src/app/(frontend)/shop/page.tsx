import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getProducts } from '@/lib/commerce'
import { ShopGrid } from '@/components/shop/ShopGrid'
import { Marquee } from '@/components/ui/Marquee'

export const metadata: Metadata = {
  title: 'Shop the collection',
  description: 'Pyjama sets, robes, knits and little things — loungewear for every room in the haus.',
}

export const revalidate = 60

export default async function ShopPage() {
  const products = await getProducts()
  return (
    <>
      <section className="shop" data-header-tone="dark">
        <header className="pagehead">
          <p className="t-caps" data-reveal>
            Fall 2026 · {products.length} pieces
          </p>
          <h1 className="t-display pagehead__title" data-split="chars">
            the collection
          </h1>
          <p className="pagehead__lede" data-reveal data-delay="0.2">
            Everything here was made to be lived in — the sofa, the kitchen, the café on the corner.
          </p>
        </header>
        <Suspense>
          <ShopGrid products={products} />
        </Suspense>
      </section>
      <Marquee items={['complimentary delivery over EGP 5,000', 'wrapped in linen', 'exchanges within 14 days', 'made to be lived in']} tone="blue" />
    </>
  )
}
