import 'server-only'

/**
 * Minimal Shopify Storefront API client.
 *
 * Configure in .env:
 *   SHOPIFY_STORE_DOMAIN=3dxypz-fh.myshopify.com
 *   SHOPIFY_STOREFRONT_ACCESS_TOKEN=<public storefront token from the Headless channel>
 *   SHOPIFY_STOREFRONT_API_VERSION=2026-10   (optional)
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2026-10'

export const shopifyEnabled = Boolean(domain && token)

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { revalidate?: number; cache?: RequestCache } = {},
): Promise<T> {
  if (!shopifyEnabled) throw new Error('Shopify Storefront API is not configured')
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token as string,
    },
    body: JSON.stringify({ query, variables }),
    ...(opts.cache ? { cache: opts.cache } : { next: { revalidate: opts.revalidate ?? 60 } }),
  })
  if (!res.ok) throw new Error(`Shopify ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '))
  return json.data as T
}

export type ShopifyProductNode = {
  handle: string
  title: string
  description: string
  productType: string
  tags: string[]
  images: { nodes: { url: string; altText: string | null }[] }
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  compareAtPriceRange: { minVariantPrice: { amount: string } }
  variants: {
    nodes: {
      id: string
      title: string
      availableForSale: boolean
      price: { amount: string }
      selectedOptions: { name: string; value: string }[]
    }[]
  }
}

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    handle
    title
    description
    productType
    tags
    images(first: 8) { nodes { url altText } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount } }
    variants(first: 50) {
      nodes { id title availableForSale price { amount } selectedOptions { name value } }
    }
  }
`

export async function fetchShopifyProducts(): Promise<ShopifyProductNode[]> {
  const data = await storefront<{ products: { nodes: ShopifyProductNode[] } }>(
    /* GraphQL */ `
      ${PRODUCT_FIELDS}
      query Products {
        products(first: 100, sortKey: CREATED_AT) { nodes { ...ProductFields } }
      }
    `,
  )
  return data.products.nodes
}

export async function fetchShopifyProduct(handle: string): Promise<ShopifyProductNode | null> {
  const data = await storefront<{ product: ShopifyProductNode | null }>(
    /* GraphQL */ `
      ${PRODUCT_FIELDS}
      query Product($handle: String!) { product(handle: $handle) { ...ProductFields } }
    `,
    { handle },
  )
  return data.product
}

export async function createShopifyCheckout(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<string> {
  const data = await storefront<{
    cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] }
  }>(
    /* GraphQL */ `
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart { checkoutUrl }
          userErrors { message }
        }
      }
    `,
    { lines },
    { cache: 'no-store' },
  )
  const { cart, userErrors } = data.cartCreate
  if (!cart) throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not create cart')
  return cart.checkoutUrl
}
