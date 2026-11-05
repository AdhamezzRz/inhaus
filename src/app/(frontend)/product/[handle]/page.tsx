import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getProduct, getProducts } from '@/lib/commerce'
import { LOCAL_PRODUCTS } from '@/lib/catalog'
import { ProductView } from '@/components/product/ProductView'
import { ProductCard } from '@/components/shop/ProductCard'

export const revalidate = 60

export async function generateStaticParams() {
  return LOCAL_PRODUCTS.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const p = await getProduct(handle)
  if (!p) return { title: 'Not found' }
  return {
    title: p.title,
    description: p.description,
    openGraph: { images: [p.images[0]?.src ?? '/img/l-hero.webp'] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const [product, all] = await Promise.all([getProduct(handle), getProducts()])
  if (!product) notFound()

  const related = [
    ...all.filter((p) => p.room === product.room && p.handle !== product.handle),
    ...all.filter((p) => p.room !== product.room && p.handle !== product.handle),
  ].slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.src),
    brand: { '@type': 'Brand', name: 'INN HAUS' },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.price,
      availability: product.variants.some((v) => v.available)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <section className="product" data-header-tone="dark">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ProductView product={product} />
      </section>
      <section className="related" data-header-tone="dark">
        <div className="section-head">
          <p className="t-caps">From the same room</p>
          <h2 className="t-display" data-split="lines">
            complete the look
          </h2>
        </div>
        <div className="pgrid pgrid--four">
          {related.map((p, i) => (
            <ProductCard key={p.handle} product={p} index={i} />
          ))}
        </div>
      </section>
    </>
  )
}
