import { getProducts } from '@/lib/commerce'
import { getHome, getJournal, getSiteSettings } from '@/lib/cms'
import { ROOMS } from '@/lib/catalog'
import { HeroHaus } from '@/components/home/HeroHaus'
import { Manifesto } from '@/components/home/Manifesto'
import { Clothesline } from '@/components/home/Clothesline'
import { Rooms } from '@/components/home/Rooms'
import { FabricTouch } from '@/components/home/FabricTouch'
import { PolaroidWall } from '@/components/home/PolaroidWall'
import { Packaging } from '@/components/home/Packaging'
import { JournalTeaser } from '@/components/home/JournalTeaser'
import { Marquee } from '@/components/ui/Marquee'

export const revalidate = 60

export default async function HomePage() {
  const [home, products, journal, settings] = await Promise.all([
    getHome(),
    getProducts(),
    getJournal(),
    getSiteSettings(),
  ])

  return (
    <>
      <HeroHaus eyebrow={home.heroEyebrow} title={home.heroTitle} caption={home.heroCaption} />
      <Manifesto text={home.manifesto} />
      <Marquee items={settings.marquee} tone="sage" />
      <Clothesline products={products.filter((p) => p.room !== 'little-things').slice(0, 9)} title={home.lineTitle} intro={home.lineIntro} />
      <Rooms rooms={ROOMS.slice(0, 3)} products={products} />
      <FabricTouch />
      <PolaroidWall />
      <Marquee items={['quick errand', 'friend’s house', 'day in', 'little things']} tone="burgundy" />
      <Packaging title={home.packagingTitle} text={home.packagingText} />
      <JournalTeaser entries={journal} />
    </>
  )
}
