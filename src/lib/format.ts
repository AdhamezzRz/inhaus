export function formatPrice(amount: number, currency = 'EGP') {
  const n = new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(amount)
  return `${currency === 'EGP' ? 'EGP' : currency} ${n}`
}

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')
