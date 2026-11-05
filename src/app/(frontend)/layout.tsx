import type { Metadata, Viewport } from 'next'

import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/archivo-narrow/400.css'
import '@fontsource/archivo-narrow/500.css'
import 'lenis/dist/lenis.css'
import './styles.css'

import { getSiteSettings } from '@/lib/cms'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { CartProvider } from '@/components/providers/CartProvider'
import { TransitionProvider } from '@/components/providers/TransitionProvider'
import { Preloader } from '@/components/ui/Preloader'
import { Cursor } from '@/components/ui/Cursor'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { CartPouch } from '@/components/ui/CartPouch'
import { LampCord } from '@/components/ui/LampCord'
import { ScrollFX } from '@/components/ui/ScrollFX'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'INN HAUS — Wear it. Live in it.', template: '%s — INN HAUS' },
  description:
    'INN HAUS is a feminine loungewear house from Cairo. Pinstripe poplin, waffle robes and soft knits for the day in, the friend’s house and the quick errand.',
  openGraph: {
    title: 'INN HAUS — Wear it. Live in it.',
    description: 'Feminine loungewear for living in.',
    images: ['/img/l-hero.webp'],
    type: 'website',
  },
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#F7F6F1',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" data-theme="day" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('innhaus-theme');if(t)document.documentElement.dataset.theme=t;if(sessionStorage.getItem('innhaus-intro-seen')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('is-loading')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScroll>
            <CartProvider>
              <TransitionProvider>
                <Preloader />
                <Header announcements={settings.announcements} />
                <main id="main">{children}</main>
                <Footer settings={settings} />
                <CartPouch />
                <LampCord />
                <Cursor />
                <ScrollFX />
                <div className="grain" aria-hidden />
              </TransitionProvider>
            </CartProvider>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}
