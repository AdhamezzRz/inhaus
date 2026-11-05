import type { Metadata } from 'next'

import { ThankYou } from '@/components/ui/ThankYou'

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } }

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams
  return <ThankYou demo={demo === '1'} />
}
