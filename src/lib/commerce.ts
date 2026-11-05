import 'server-only'
import { cache } from 'react'

import { LOCAL_PRODUCTS, type Product, type RoomKey } from './catalog'
import {
  fetchShopifyProduct,
  fetchShopifyProducts,
  shopifyEnabled,
  type ShopifyProductNode,
} from './shopify'

const ROOM_KEYS: RoomKey[] = ['day-in', 'friends-house', 'quick-errand', 'little-things']

/** Merge a live Shopify product with the editorial extras from the local catalog. */
function fromShopify(node: ShopifyProductNode): Product {
  const local = LOCAL_PRODUCTS.find((p) => p.handle === node.handle)
  const roomTag = node.tags.find((t) => t.startsWith('room:'))?.slice(5) as RoomKey | undefined
  const room = roomTag && ROOM_KEYS.includes(roomTag) ? roomTag : (local?.room ?? 'day-in')
  const price = Number(node.priceRange.minVariantPrice.amount)
  const compare = Number(node.compareAtPriceRange.minVariantPrice.amount)
  const variants = node.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    size: v.selectedOptions.find((o) => o.name.toLowerCase() === 'size')?.value ?? v.title,
    available: v.availableForSale,
    price: Number(v.price.amount),
  }))
  const shopImages = node.images.nodes.map((i) => ({ src: i.url, alt: i.altText ?? node.title }))
  const badge = node.tags.includes('bestseller')
    ? 'Bestseller'
    : node.tags.includes('new')
      ? 'New'
      : local?.badge

  return {
    handle: node.handle,
    title: node.title,
    subtitle: local?.subtitle ?? node.productType,
    room,
    price,
    compareAtPrice: compare > price ? compare : undefined,
    currency: node.priceRange.minVariantPrice.currencyCode,
    description: node.description || local?.description || '',
    details: local?.details ?? [],
    fabric: local?.fabric ?? '',
    care: local?.care ?? '',
    colorName: local?.colorName ?? '',
    colorHex: local?.colorHex ?? '#737B5B',
    // Prefer the optimised local photography when it exists; fall back to Shopify's CDN.
    images: local?.images ?? (shopImages.length ? shopImages : []),
    lifestyle: local?.lifestyle ?? shopImages[1]?.src,
    badge,
    sizes: variants.map((v) => v.size),
    variants,
    source: 'shopify',
  }
}

export const getProducts = cache(async (): Promise<Product[]> => {
  if (shopifyEnabled) {
    try {
      const nodes = await fetchShopifyProducts()
      if (nodes.length) {
        const live = nodes.map(fromShopify)
        // Keep the editorial ordering of the local catalog where handles match.
        const order = LOCAL_PRODUCTS.map((p) => p.handle)
        return live.sort((a, b) => {
          const ia = order.indexOf(a.handle)
          const ib = order.indexOf(b.handle)
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
        })
      }
    } catch (err) {
      console.warn('[inn haus] Shopify unavailable, using local catalog:', (err as Error).message)
    }
  }
  return LOCAL_PRODUCTS
})

export const getProduct = cache(async (handle: string): Promise<Product | null> => {
  if (shopifyEnabled) {
    try {
      const node = await fetchShopifyProduct(handle)
      if (node) return fromShopify(node)
    } catch (err) {
      console.warn('[inn haus] Shopify product fetch failed:', (err as Error).message)
    }
  }
  return LOCAL_PRODUCTS.find((p) => p.handle === handle) ?? null
})

export { shopifyEnabled }
