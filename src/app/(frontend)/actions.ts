'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

import { createShopifyCheckout, shopifyEnabled } from '@/lib/shopify'

/** Footer "haus list" sign-up, stored in Payload (/admin → Haus list). */
export async function joinHausList(
  _prev: { ok: boolean; message: string } | null,
  form: FormData,
): Promise<{ ok: boolean; message: string }> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'That email looks a little off.' }
  try {
    const payload = await getPayload({ config })
    const existing = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1 })
    if (!existing.docs.length) await payload.create({ collection: 'subscribers', data: { email, source: 'footer' } })
    return { ok: true, message: 'You’re on the haus list. Welcome in.' }
  } catch (err) {
    console.error('[inn haus] subscribe failed', err)
    return { ok: false, message: 'Something went wrong — try again in a moment.' }
  }
}

export type CheckoutResult = { ok: true; url: string; demo: boolean } | { ok: false; error: string }

/**
 * Turn the pouch into a Shopify checkout. Local demo items (ids starting with
 * `local:`) can't be bought, so the visitor gets the demo thank-you instead.
 */
export async function startCheckout(
  lines: { variantId: string; qty: number }[],
): Promise<CheckoutResult> {
  if (!lines.length) return { ok: false, error: 'Your pouch is empty.' }
  const live = lines.filter((l) => l.variantId.startsWith('gid://shopify/'))
  if (!shopifyEnabled || live.length !== lines.length) {
    return { ok: true, url: '/thank-you?demo=1', demo: true }
  }
  try {
    const url = await createShopifyCheckout(
      live.map((l) => ({ merchandiseId: l.variantId, quantity: Math.max(1, Math.min(20, l.qty)) })),
    )
    return { ok: true, url, demo: false }
  } catch (err) {
    console.error('[inn haus] checkout failed', err)
    return { ok: false, error: 'We couldn’t open checkout just now — please try again.' }
  }
}
