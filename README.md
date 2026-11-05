# INN HAUS — Shopify theme

*Wear it. Live in it.* A custom Online Store 2.0 theme for **INN HAUS**, the feminine loungewear house from Cairo, built from the Fall 2026 brand book. It's installed in the store **My Store 3** (`3dxypz-fh.myshopify.com`) as the unpublished theme **INN HAUS**.

## What's in it

| Moment | What happens |
| --- | --- |
| Intro | The real *inn haus* wordmark (vectorised from the brand book) writes itself stroke by stroke with an ink nib, then glides into the header. It plays once per visit. |
| Hero | An arched window draws itself, and a film plays behind sheer linen curtains. Scroll and the window opens to full screen as *wear it.* / *live in it.* slide apart. |
| Manifesto | Read word by word as you scroll, with photos tucked into the sentence. |
| The line | Products hang from wooden pegs on a laundry line that sags and swings with your scroll speed. |
| Rooms | Day In, Friend's House and Quick Errand, each shown in a morphing blob-shaped photo, with the section's colour changing per room. |
| Fabric | A WebGL sheet of pinstripe poplin that ripples where you touch it. |
| Haus diary | Draggable polaroids in the brand frame colours. |
| Unboxing | Scroll to pack an order: card in, pouch flap down, satin ribbon tied, hang tag on. |
| Lights | Pull the ceramic heart cord (or press *Lights off*) for night mode. |
| Pouch | AJAX cart drawer in sage linen. Products fly into it on an arc, and a thread tracks progress to free delivery. |
| Page changes | Pleated linen curtains close, the wordmark is written, the next page opens. |
| Cursor | A four-hole sewing button that spins as you move. |

Every section is editable in **Online Store → Themes → Customize**: text, photos, the hero video, rooms (linked to collections), polaroids, marquee phrases, footer, and the intro, cursor, cord and curtains (Theme settings → Experience).

## Store setup this theme uses

- **Rooms** are smart collections that fill themselves from product tags: `room:day-in`, `room:friends-house`, `room:quick-errand`, `room:little-things`.
- **Badges** come from the tags `bestseller` and `new`.
- **Product details** are product metafields under `inhaus.*`: subtitle, colour name, colour swatch, details (one per line), fabric, care. Edit them at the bottom of each product page in the admin.
- **The lifestyle photo** shown on hover is the product's *second* image.
- **Menus:** `inhaus-main` (header) and `inhaus-footer`.
- **Pages:** *The Haus* uses the `page.the-haus` template. The **Journal** blog holds the stories.
- **Newsletter** sign-ups become Shopify customers tagged `newsletter`.

The 12 products tagged `inn-haus-demo` are placeholders with AI-generated photography. Replace them with the real collection.

## Working on the theme

```bash
npm install
npm run check      # Shopify Theme Check
npm run package    # builds inn-haus-theme.zip for Online Store → Themes → Add theme → Upload zip
```

For live sync, connect this repository's branch in **Online Store → Themes → Add theme → Connect from GitHub**, or use the Shopify CLI (`shopify theme dev`).

The previous standalone Next.js + Payload version of the site is in git history (commit `d8065d1`).
