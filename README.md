# INN HAUS — *wear it. live in it.*

The website for **INN HAUS**, a feminine loungewear house from Cairo, built from the Fall 2026 brand book.

- **Next.js 16** (App Router) storefront
- **Payload CMS 3** at `/admin` for content: home page copy, announcements, journal, and the newsletter list
- **Shopify** (store `3dxypz-fh.myshopify.com`) for products, prices and checkout through the Storefront API
- **GSAP** (ScrollTrigger, SplitText, DrawSVG, MorphSVG, Draggable, Flip), **Lenis** smooth scroll and a **three.js** fabric shader

## The experience

| Moment | What happens |
| --- | --- |
| Preloader | The real *inn haus* wordmark (vectorised from the brand book) writes itself stroke by stroke with an ink nib, then glides into the header. |
| Hero | The brand-book house draws itself and a looping film plays inside it. Scroll and the house opens up to full screen as *wear it.* / *live in it.* slide apart like doors. |
| Manifesto | Read word by word as you scroll, with photos tucked into the sentence. |
| The line | Products hang from wooden pegs on a laundry line that sags and swings with your scroll speed. |
| Rooms | *Day In*, *Friend's House* and *Quick Errand*, each shown in a blob-shaped photo that keeps morphing, with the room's colour washing over the section. |
| Fabric | A WebGL sheet of the Sunday Set poplin that ripples where you touch it. |
| Haus diary | The photography direction as polaroids you can throw around. |
| Unboxing | Scroll to pack an order: card in, linen pouch flap down, satin ribbon tied, hang tag on. |
| Lights | Pull the ceramic heart cord (or press *Lights off*) for night mode. |
| Cart | The pouch: products fly into it on an arc; it's a sage linen drawer with a ribbon and a free-delivery thread. |
| Page changes | Pleated linen curtains close, the wordmark is written, the next room opens. |
| Cursor | A four-hole sewing button that spins as you move. |

## Getting started

```bash
pnpm install
cp .env.example .env      # set PAYLOAD_SECRET to a long random string
pnpm migrate              # create the SQLite database
pnpm seed                 # load the launch content into Payload
pnpm dev                  # http://localhost:3000  ·  admin at /admin
```

The first visit to `/admin` asks you to create the owner account.

## Connecting Shopify checkout

Until a token is set, the site runs on the demo catalog in `src/lib/catalog.ts`, and checkout ends at a demo thank-you page. The same 12 products (same handles, tagged `inn-haus-demo`) already exist in the Shopify store.

1. Shopify admin → **Sales channels → Headless** → create a storefront → copy the **public Storefront API token**.
2. Publish the products to that Headless channel (Products → select all → *Include in sales channels*).
3. Add it to `.env`:
   ```env
   SHOPIFY_STORE_DOMAIN=3dxypz-fh.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
   ```

Prices, variants, stock and images then come live from Shopify. The editorial extras (room, colour swatch, lifestyle photo, details) still come from `src/lib/catalog.ts`, matched by handle. The pouch's **Checkout** button creates a Shopify cart and sends the shopper to Shopify's checkout.

> The store is on a **trial plan** — upgrade it in Shopify before taking real orders.

## Editing content

| Where | What |
| --- | --- |
| `/admin` → Home page | Hero eyebrow, title and caption; manifesto; product-line title; packaging copy |
| `/admin` → Site settings | Announcement bar, marquee phrases, contact email, socials, WhatsApp |
| `/admin` → Journal | Stories (rich text, cover image, room) |
| `/admin` → Haus list | Newsletter sign-ups from the footer |
| `src/lib/catalog.ts` | Demo products, rooms and their copy |
| `public/img`, `public/video` | Photography and the hero film (AI-generated placeholders — swap for the real shoot) |

## Deploying

Any Node host works. For serverless hosts (e.g. Vercel), use a hosted libSQL database (Turso) instead of the local file:

```env
DATABASE_URL=libsql://<db>.turso.io
DATABASE_AUTH_TOKEN=...
```

Migrations in `src/migrations` run automatically on boot in production. After changing a collection, run `pnpm payload migrate:create <name>`. Uploaded media are stored on local disk by default; add a Payload storage adapter (S3, Vercel Blob…) for serverless hosting.

## Structure

```
src/
  app/(frontend)/     pages: home, shop, product/[handle], the-haus, journal, thank-you, 404
  app/(payload)/      Payload admin + REST/GraphQL API
  collections/        Journal, Subscribers, Media, Users
  globals/            HomePage, SiteSettings
  components/
    brand/            Wordmark (+ pen paths), sewing buttons, house mark, blobs
    home/             HeroHaus, Manifesto, Clothesline, Rooms, FabricTouch, PolaroidWall, Packaging
    providers/        Lenis, theme, cart, curtain transitions
    ui/               Preloader, Header, Footer, CartPouch, Cursor, LampCord, Marquee, ScrollFX
  lib/                catalog, Shopify client, commerce layer, CMS helpers
```

Brand rules from the book are followed throughout: the five-colour palette (cream `#F3F0E9`, dusty blue `#AAB7C4`, sage `#737B5B`, burgundy `#743F46`, espresso `#473C38`), Bodoni display type (*Bodoni Moda* stands in for Bauer Bodoni on the web), and centred text, titles and logo.
