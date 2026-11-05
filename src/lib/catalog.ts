/**
 * Local "demo" catalog. It mirrors the products created in the Shopify store
 * (same handles), and adds the editorial details Shopify doesn't hold:
 * the room a piece lives in, its colour swatch, and its lifestyle photograph.
 *
 * When Shopify Storefront credentials are configured, live Shopify data
 * (price, variants, availability, images) takes over and this file only
 * supplies the editorial extras. Replace freely — these are placeholders.
 */

export type RoomKey = 'day-in' | 'friends-house' | 'quick-errand' | 'little-things'

export type Room = {
  key: RoomKey
  number: string
  name: string
  line: string
  description: string
  image: string
  frame: string
}

export const ROOMS: Room[] = [
  {
    key: 'day-in',
    number: '01',
    name: 'Day In',
    line: 'Curtains half open. Nowhere to be.',
    description:
      'Pinstripe poplin, waffle robes and ribbed sets for the slow mornings that turn into slow afternoons.',
    image: '/img/l-stretch.webp',
    frame: 'var(--burgundy)',
  },
  {
    key: 'friends-house',
    number: '02',
    name: "Friend's House",
    line: 'Strawberries, old films, one more episode.',
    description:
      'Matching sets and soft knits made for sleepovers, sofa forts and the conversations that last till 2am.',
    image: '/img/l-friends.webp',
    frame: 'var(--sage)',
  },
  {
    key: 'quick-errand',
    number: '03',
    name: 'Quick Errand',
    line: 'Matcha run. Back before it cools.',
    description:
      'Pieces polished enough for the café on the corner, and soft enough to come straight back to the sofa.',
    image: '/img/l-cafe.webp',
    frame: 'var(--dusty-blue)',
  },
  {
    key: 'little-things',
    number: '04',
    name: 'Little Things',
    line: 'The details that make a house a haus.',
    description: 'Silk eye masks, ribbed socks and the small comforts in between.',
    image: '/img/p-eye-mask.webp',
    frame: 'var(--cream-deep)',
  },
]

export type Variant = {
  id: string
  title: string
  size: string
  available: boolean
  price: number
}

export type Product = {
  handle: string
  title: string
  subtitle: string
  room: RoomKey
  price: number
  compareAtPrice?: number
  currency: string
  description: string
  details: string[]
  fabric: string
  care: string
  colorName: string
  colorHex: string
  images: { src: string; alt: string }[]
  lifestyle?: string
  badge?: 'New' | 'Bestseller' | 'Last few'
  sizes: string[]
  variants: Variant[]
  source: 'local' | 'shopify'
}

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const ONE_SIZE = ['One size']

type Seed = Omit<Product, 'variants' | 'source' | 'currency'> & { soldOut?: string[] }

const seeds: Seed[] = [
  {
    handle: 'the-sunday-set',
    title: 'The Sunday Set',
    subtitle: 'Pinstripe poplin pyjama set',
    room: 'day-in',
    price: 3450,
    description:
      'Our signature set, cut from crisp long-staple cotton poplin in a sage and cream pinstripe, finished with contrast piping. A relaxed notch-collar shirt and wide drawstring trousers that soften with every wash.',
    details: [
      'Relaxed notch-collar shirt with chest pocket',
      'Wide-leg trousers, covered elastic & drawstring',
      'Contrast sage piping',
      'Mother-of-pearl effect buttons',
    ],
    fabric: '100% long-staple cotton poplin, 120 gsm',
    care: 'Machine wash cold, line dry, warm iron',
    colorName: 'Sage stripe',
    colorHex: '#9BA27F',
    images: [{ src: '/img/p-sunday-set.webp', alt: 'The Sunday Set folded on cream linen' }],
    lifestyle: '/img/l-hero.webp',
    badge: 'Bestseller',
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'le-petit-matin-set',
    title: 'Le Petit Matin Set',
    subtitle: 'Dusty blue striped pyjama set',
    room: 'day-in',
    price: 3450,
    description:
      'A breezy poplin set in dusty blue and white stripes — the colour of 7am light through linen curtains. Oversized shirt, long wide trousers, made for stretching into the day.',
    details: [
      'Oversized button-front shirt',
      'Long wide-leg trousers with elastic waist',
      'Dropped shoulder, rounded hem',
    ],
    fabric: '100% cotton poplin',
    care: 'Machine wash cold, line dry',
    colorName: 'Dusty blue stripe',
    colorHex: '#AAB7C4',
    images: [{ src: '/img/p-petit-matin.webp', alt: 'Le Petit Matin Set on a wooden hanger' }],
    lifestyle: '/img/l-stretch.webp',
    badge: 'New',
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'haus-rib-cardigan-set',
    title: 'Haus Rib Cardigan Set',
    subtitle: 'Ribbed knit cardigan & flare pant',
    room: 'quick-errand',
    price: 3950,
    description:
      'A fine-rib cardigan with pearl buttons and matching flared lounge pants in warm ivory. Polished enough for the café, soft enough for the sofa you came from.',
    details: ['Cropped cardigan, pearl buttons', 'High-rise flared pant', 'Sold as a set'],
    fabric: '70% viscose, 30% recycled polyamide rib knit',
    care: 'Hand wash cool, dry flat',
    colorName: 'Ivory',
    colorHex: '#EFE8D8',
    images: [{ src: '/img/p-rib-cardigan.webp', alt: 'Ivory rib knit cardigan set stacked on an ottoman' }],
    lifestyle: '/img/l-cafe.webp',
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'bordeaux-rib-set',
    title: 'Bordeaux Rib Set',
    subtitle: 'Ribbed tank & wide trouser',
    room: 'day-in',
    price: 2850,
    description:
      'Deep burgundy ribbed cotton, a tank that holds its shape and a wide trouser that pools just right. For the days you stay in on purpose.',
    details: ['Scoop-neck ribbed tank', 'Wide drawstring trouser', 'Can be worn separately'],
    fabric: '95% organic cotton, 5% elastane',
    care: 'Machine wash cold, dry flat',
    colorName: 'Bordeaux',
    colorHex: '#743F46',
    images: [{ src: '/img/p-bordeaux.webp', alt: 'Bordeaux rib tank and trousers on white sheets' }],
    lifestyle: '/img/l-bordeaux.webp',
    badge: 'New',
    sizes: APPAREL_SIZES,
    soldOut: ['XS'],
  },
  {
    handle: 'cloud-waffle-robe',
    title: 'Cloud Waffle Robe',
    subtitle: 'Cotton waffle robe',
    room: 'day-in',
    price: 3200,
    description:
      'A plush waffle-weave robe in cream with a shawl collar, deep pockets and a tie sash. The first thing you reach for, every morning.',
    details: ['Shawl collar', 'Two deep patch pockets', 'Belt loops and tie sash', 'Mid-calf length'],
    fabric: '100% Egyptian cotton waffle',
    care: 'Machine wash warm, tumble dry low',
    colorName: 'Cream',
    colorHex: '#F3F0E9',
    images: [{ src: '/img/p-cloud-robe.webp', alt: 'Cream waffle robe on a brass hook' }],
    lifestyle: '/img/l-kitchen.webp',
    sizes: ['S/M', 'M/L'],
  },
  {
    handle: 'espresso-fleece-set',
    title: 'Espresso Fleece Set',
    subtitle: 'Brushed fleece hoodie & sweatpant',
    room: 'quick-errand',
    price: 3600,
    description:
      'Brushed-back fleece in a rich espresso, an oversized hoodie and a straight sweatpant. The errand uniform, and the uniform after the errand.',
    details: ['Oversized hoodie with kangaroo pocket', 'Straight-leg sweatpant', 'Brushed interior'],
    fabric: '80% cotton, 20% recycled polyester fleece, 340 gsm',
    care: 'Machine wash cold inside out',
    colorName: 'Espresso',
    colorHex: '#473C38',
    images: [{ src: '/img/p-espresso-hoodie.webp', alt: 'Espresso fleece hoodie and sweatpant beside a cappuccino' }],
    sizes: APPAREL_SIZES,
    badge: 'Last few',
    soldOut: ['XL'],
  },
  {
    handle: 'petite-bow-camisole',
    title: 'Petite Bow Camisole',
    subtitle: 'Modal camisole with lace trim',
    room: 'friends-house',
    price: 1250,
    description:
      'Silky cotton-modal with a scalloped lace edge and the tiniest black satin bow. Layer it, sleep in it, live in it.',
    details: ['Adjustable straps', 'Scalloped lace trim', 'Black satin bow detail'],
    fabric: '50% cotton, 50% modal',
    care: 'Hand wash cold',
    colorName: 'Cream',
    colorHex: '#F3F0E9',
    images: [{ src: '/img/p-camisole.webp', alt: 'Cream camisole with a small black bow' }],
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'pyjama-boxer-duo',
    title: 'Pyjama Boxer Duo',
    subtitle: 'Two striped boxer shorts',
    room: 'friends-house',
    price: 1450,
    description:
      'Two pairs of ruffle-waist boxer shorts, one dusty pink, one dusty blue. Made for sharing — or not.',
    details: ['Set of two', 'Ruffled elastic waistband', 'Relaxed fit'],
    fabric: '100% cotton seersucker',
    care: 'Machine wash cold',
    colorName: 'Pink & blue stripe',
    colorHex: '#D9B8BC',
    images: [{ src: '/img/p-boxers.webp', alt: 'Two striped boxer shorts on bedsheets' }],
    lifestyle: '/img/l-friends.webp',
    badge: 'Bestseller',
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'cable-knit-lounge-set',
    title: 'Cable Knit Lounge Set',
    subtitle: 'Chunky cable sweater & pant',
    room: 'friends-house',
    price: 4250,
    description:
      'Our coziest knit — a chunky cable jumper with a matching wide lounge pant in winter cream. Movie-night armour.',
    details: ['Relaxed crew-neck jumper', 'Wide cable pant with drawcord', 'Sold as a set'],
    fabric: '60% cotton, 40% merino wool',
    care: 'Hand wash cool, dry flat',
    colorName: 'Winter cream',
    colorHex: '#EDE4CF',
    images: [{ src: '/img/p-cable-knit.webp', alt: 'Cream cable knit set on a boucle chair' }],
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'waffle-long-sleeve-set',
    title: 'Waffle Long Sleeve Set',
    subtitle: 'Fitted waffle top & short',
    room: 'friends-house',
    price: 1950,
    description:
      'A fitted thumbhole long sleeve and a matching short in soft dusty-blue waffle. Socks pulled up, book open.',
    details: ['Fitted long sleeve with thumbholes', 'Mid-rise short', 'Stretch waffle knit'],
    fabric: '92% cotton, 8% elastane waffle',
    care: 'Machine wash cold',
    colorName: 'Dusty blue',
    colorHex: '#AAB7C4',
    images: [{ src: '/img/p-waffle-top.webp', alt: 'Dusty blue waffle long sleeve and shorts' }],
    lifestyle: '/img/l-reading.webp',
    sizes: APPAREL_SIZES,
  },
  {
    handle: 'silk-eye-mask',
    title: 'Silk Eye Mask',
    subtitle: 'Mulberry silk, sage',
    room: 'little-things',
    price: 650,
    description:
      '22 momme mulberry silk in sage green with a soft covered band. For long lie-ins and short flights.',
    details: ['22 momme mulberry silk', 'Covered elastic band', 'Comes in a linen pouch'],
    fabric: '100% mulberry silk',
    care: 'Hand wash cold',
    colorName: 'Sage',
    colorHex: '#737B5B',
    images: [{ src: '/img/p-eye-mask.webp', alt: 'Sage silk eye mask on a striped pillowcase' }],
    sizes: ONE_SIZE,
  },
  {
    handle: 'haus-sock-trio',
    title: 'Haus Sock Trio',
    subtitle: 'Ribbed crew socks, set of three',
    room: 'little-things',
    price: 550,
    description: 'Cream, sage and bordeaux ribbed crew socks. To be worn slouched, always.',
    details: ['Set of three pairs', 'Fine rib', 'Reinforced heel and toe'],
    fabric: '80% combed cotton, 18% polyamide, 2% elastane',
    care: 'Machine wash warm',
    colorName: 'Mixed',
    colorHex: '#B7A88C',
    images: [{ src: '/img/p-socks.webp', alt: 'Three pairs of ribbed socks in cream, sage and bordeaux' }],
    sizes: ONE_SIZE,
  },
]

export const LOCAL_PRODUCTS: Product[] = seeds.map(({ soldOut = [], ...p }) => ({
  ...p,
  currency: 'EGP',
  source: 'local',
  variants: p.sizes.map((size) => ({
    id: `local:${p.handle}:${size}`,
    title: size,
    size,
    available: !soldOut.includes(size),
    price: p.price,
  })),
}))

export const roomByKey = (key: RoomKey) => ROOMS.find((r) => r.key === key) ?? ROOMS[0]

export const FREE_SHIPPING_THRESHOLD = 5000
