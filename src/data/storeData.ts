export interface HotspotPin {
  id: string;
  pieceId: string;
  label: string;
  xPercent: number;
  yPercent: number;
}

export interface BundlePiece {
  id: string;
  name: string;
  category: string;
  price: number;
  thumb: string;
}

export interface LookbookEntry {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  accentColor: string;
  pieces: BundlePiece[];
  hotspots: HotspotPin[];
}

export interface ArchiveMood {
  id: string;
  title: string;
  tag: string;
  image: string;
  bgTint: string;
  targetSection: string;
}

export interface RackBlouse {
  id: string;
  name: string;
  category: 'Bridal Velvet' | 'Raw Silk' | 'Banarasi Zari';
  fabric: string;
  price: number;
  image: string;
  backDetails: string;
  craftNote: string;
  sizes: readonly number[];
}

export interface DeckCardItem {
  id: string;
  labelTop: string;
  labelBottom: string;
  title: string;
  subtitle: string;
  price: number;
  bgColor: string;
  image: string;
}

export interface BridalStoryItem {
  id: string;
  title: string;
  collection: string;
  description: string;
  price: number;
  glowColor: string;
  image: string;
  bgHex: string;
}

export interface WeaveSilkOption {
  id: string;
  name: string;
  origin: string;
  price: number;
  primaryHex: string;
  zariHex: string;
  accentHex: string;
  image: string;
}

export interface BagItem {
  id: string;
  name: string;
  meta: string;
  price: number;
  image: string;
  quantity: number;
}

export const STORE_INFO = {
  brandName: 'Apurva Bridal',
  fullTitle: 'Apurva Bridal Lehanga & Sarees',
  tagline: 'KHETAN SUPER MARKET • BIRLA MANDIR ROAD • PATNA',
  address: 'Shop No. B-43 & B-44, Khetan Super Market, Birla Mandir Road, Bakerganj, Patna, Bihar – 800004',
  hours: '10:30 AM – 9:00 PM (Open All 7 Days)',
  phones: ['+91 9334274373', '+91 7004499014', '0612-2675440'],
  whatsappNumber: '919334274373',
  gstin: '10BLIPK4090E1ZI',
} as const;

export const MARQUEE_ITEMS = [
  'PURE ZARI • Handwoven borders crafted for Patna weddings',
  'TRY THE LOOK • Five bridal edits styled head to toe',
  'THE RACK • Custom choli fitting in 48 hours at Khetan Market',
  'BRIDAL STORIES • Heirloom Banarasi & Zardozi silhouettes',
  'PATNA SHOWROOM • Shop B-43 & B-44, Khetan Super Market',
] as const;

export const ARCHIVE_MOODS: ArchiveMood[] = [
  {
    id: 'mood-wedding',
    title: 'Wedding Edit',
    tag: 'Royal Zardozi',
    image: '/images/look-crimson.png',
    bgTint: '#F5E8EA',
    targetSection: '#lookbook',
  },
  {
    id: 'mood-kanchi',
    title: 'Kanchipuram Icons',
    tag: 'Temple Zari',
    image: '/images/look-emerald.png',
    bgTint: '#E6F1ED',
    targetSection: '#pick-a-silk',
  },
  {
    id: 'mood-banarasi',
    title: 'Banarasi Heirlooms',
    tag: 'Katan Brocade',
    image: '/images/look-ivory.png',
    bgTint: '#F5F0E4',
    targetSection: '#lookbook',
  },
  {
    id: 'mood-sangeet',
    title: 'Sangeet Pastels',
    tag: 'Gota Patti',
    image: '/images/look-rose.png',
    bgTint: '#F7E9EF',
    targetSection: '#pick-a-silk',
  },
  {
    id: 'mood-haldi',
    title: 'Festive Radiance',
    tag: 'Haldi Marigold',
    image: '/images/look-saffron.png',
    bgTint: '#FBF0E3',
    targetSection: '#rack',
  },
  {
    id: 'mood-showroom',
    title: 'Khetan Looms',
    tag: 'Patna Showroom',
    image: '/images/editorial-side-2.jpg',
    bgTint: '#EFEAE4',
    targetSection: '#muse',
  },
];

export const LOOKBOOK_ITEMS: LookbookEntry[] = [
  {
    id: 'look-crimson',
    title: 'Royal Crimson Zardozi',
    subtitle: 'Heavy Velvet Bridal Lehenga • Hand-Embroidered Double Dupatta',
    image: '/images/look-crimson.png',
    accentColor: '#8B1E2B',
    pieces: [
      {
        id: 'p-crimson-lehenga',
        name: 'Crimson Velvet Zardozi Bridal Lehenga',
        category: 'Bridal Lehenga',
        price: 28500,
        thumb: '/images/look-crimson.png',
      },
      {
        id: 'p-crimson-blouse',
        name: 'Maroon Zari Scalloped Silk Choli',
        category: 'Stitched Blouse',
        price: 4800,
        thumb: '/images/rack-maroon-front.png',
      },
      {
        id: 'p-crimson-choker',
        name: 'Polki & Kundan Heritage Bridal Choker',
        category: 'Bridal Jewelry',
        price: 7500,
        thumb: '/images/look-crimson.png',
      },
      {
        id: 'p-crimson-dupatta',
        name: 'Sheer Zari-Border Bridal Veil Dupatta',
        category: 'Chunni / Dupatta',
        price: 3800,
        thumb: '/images/editorial-side-1.jpg',
      },
    ],
    hotspots: [
      { id: 'hs-1', pieceId: 'p-crimson-choker', label: 'Kundan Choker', xPercent: 52, yPercent: 25 },
      { id: 'hs-2', pieceId: 'p-crimson-blouse', label: 'Zari Choli', xPercent: 48, yPercent: 36 },
      { id: 'hs-3', pieceId: 'p-crimson-dupatta', label: 'Bridal Veil', xPercent: 34, yPercent: 48 },
      { id: 'hs-4', pieceId: 'p-crimson-lehenga', label: 'Velvet Flare', xPercent: 58, yPercent: 72 },
    ],
  },
  {
    id: 'look-ivory',
    title: 'Ivory & Sindoor Heritage',
    subtitle: 'Katan Silk Paisley Lehenga • Contrast Banarasi Dupatta',
    image: '/images/look-ivory.png',
    accentColor: '#9E7328',
    pieces: [
      {
        id: 'p-ivory-lehenga',
        name: 'Ivory Katan Silk Paisley Lehenga',
        category: 'Bridal Lehenga',
        price: 26000,
        thumb: '/images/look-ivory.png',
      },
      {
        id: 'p-ivory-dupatta',
        name: 'Sindoor Red Banarasi Brocade Dupatta',
        category: 'Banarasi Drape',
        price: 5400,
        thumb: '/images/editorial-side-1.jpg',
      },
      {
        id: 'p-ivory-haar',
        name: 'Antique Temple Rani Haar & Choker Set',
        category: 'Temple Jewelry',
        price: 8200,
        thumb: '/images/look-ivory.png',
      },
      {
        id: 'p-ivory-kamarbandh',
        name: 'Gold Filigree Bridal Kamarbandh',
        category: 'Waist Belt',
        price: 3200,
        thumb: '/images/look-ivory.png',
      },
    ],
    hotspots: [
      { id: 'hs-5', pieceId: 'p-ivory-haar', label: 'Rani Haar', xPercent: 54, yPercent: 22 },
      { id: 'hs-6', pieceId: 'p-ivory-dupatta', label: 'Sindoor Drape', xPercent: 64, yPercent: 34 },
      { id: 'hs-7', pieceId: 'p-ivory-kamarbandh', label: 'Kamarbandh', xPercent: 52, yPercent: 43 },
      { id: 'hs-8', pieceId: 'p-ivory-lehenga', label: 'Katan Skirt', xPercent: 48, yPercent: 72 },
    ],
  },
  {
    id: 'look-emerald',
    title: 'Kanchi Royal Emerald',
    subtitle: 'Pure-Style Banarasi Silk Saree • Antique Zari Temple Border',
    image: '/images/look-emerald.png',
    accentColor: '#0D5C46',
    pieces: [
      {
        id: 'p-emerald-saree',
        name: 'Emerald Green Banarasi Zari Silk Saree',
        category: 'Bridal Saree',
        price: 16500,
        thumb: '/images/look-emerald.png',
      },
      {
        id: 'p-emerald-blouse',
        name: 'Emerald Raw Silk Zari-Sleeve Blouse',
        category: 'Designer Blouse',
        price: 4200,
        thumb: '/images/rack-emerald-front.png',
      },
      {
        id: 'p-emerald-jhumka',
        name: 'Gold Temple Jhumki & Necklace Set',
        category: 'Jewelry',
        price: 6800,
        thumb: '/images/look-emerald.png',
      },
    ],
    hotspots: [
      { id: 'hs-9', pieceId: 'p-emerald-jhumka', label: 'Temple Gold', xPercent: 50, yPercent: 22 },
      { id: 'hs-10', pieceId: 'p-emerald-blouse', label: 'Zari Blouse', xPercent: 42, yPercent: 33 },
      { id: 'hs-11', pieceId: 'p-emerald-saree', label: 'Zari Pallu', xPercent: 56, yPercent: 62 },
    ],
  },
  {
    id: 'look-rose',
    title: 'Pastel Rose Gota Patti',
    subtitle: 'Sangeet & Reception Raw Silk Lehenga • Pearl & Mirror Craft',
    image: '/images/look-rose.png',
    accentColor: '#B84A6E',
    pieces: [
      {
        id: 'p-rose-lehenga',
        name: 'Dusty Rose Gota-Patti Reception Lehenga',
        category: 'Sangeet Lehenga',
        price: 19500,
        thumb: '/images/look-rose.png',
      },
      {
        id: 'p-rose-blouse',
        name: 'Blush Silk Pearl-Bordered Choli',
        category: 'Designer Blouse',
        price: 4500,
        thumb: '/images/rack-rose-front.png',
      },
      {
        id: 'p-rose-choker',
        name: 'Rose Pearl & Kundan Choker Set',
        category: 'Jewelry',
        price: 5800,
        thumb: '/images/look-rose.png',
      },
    ],
    hotspots: [
      { id: 'hs-12', pieceId: 'p-rose-choker', label: 'Pearl Choker', xPercent: 50, yPercent: 22 },
      { id: 'hs-13', pieceId: 'p-rose-blouse', label: 'Blush Choli', xPercent: 48, yPercent: 34 },
      { id: 'hs-14', pieceId: 'p-rose-lehenga', label: 'Gota Patti', xPercent: 54, yPercent: 70 },
    ],
  },
  {
    id: 'look-saffron',
    title: 'Haldi Saffron Zari',
    subtitle: 'Marigold Handloom Silk Saree • Contrast Magenta Pallu',
    image: '/images/look-saffron.png',
    accentColor: '#C46210',
    pieces: [
      {
        id: 'p-saffron-saree',
        name: 'Saffron Marigold Temple-Border Silk Saree',
        category: 'Festive Silk Saree',
        price: 13800,
        thumb: '/images/look-saffron.png',
      },
      {
        id: 'p-saffron-blouse',
        name: 'Saffron Raw Silk Scallop Zardozi Blouse',
        category: 'Stitched Blouse',
        price: 4200,
        thumb: '/images/rack-saffron-front.png',
      },
      {
        id: 'p-saffron-jewelry',
        name: 'Kundan Choker & Maang Tikka Set',
        category: 'Jewelry',
        price: 5400,
        thumb: '/images/look-saffron.png',
      },
    ],
    hotspots: [
      { id: 'hs-15', pieceId: 'p-saffron-jewelry', label: 'Kundan Set', xPercent: 50, yPercent: 22 },
      { id: 'hs-16', pieceId: 'p-saffron-blouse', label: 'Magenta Choli', xPercent: 44, yPercent: 34 },
      { id: 'hs-17', pieceId: 'p-saffron-saree', label: 'Marigold Weave', xPercent: 52, yPercent: 66 },
    ],
  },
];

export const RACK_BLOUSES: RackBlouse[] = [
  {
    id: 'rack-saffron',
    name: 'APURVA SAFFRON RAW SILK BLOUSE',
    category: 'Raw Silk',
    fabric: 'Pure-feel Raw Silk • Scalloped Zardozi Neckline',
    price: 4800,
    image: '/images/rack-saffron-front.png',
    backDetails: 'Deep sweetheart keyhole back with braided silk dori, hand-beaded gold pearl latkans & padded cotton lining.',
    craftNote: 'Custom-fitted in-house at Khetan Market within 48 hours.',
    sizes: [32, 34, 36, 38, 40, 42],
  },
  {
    id: 'rack-maroon',
    name: 'APURVA BRIDAL MAROON VELVET CHOLI',
    category: 'Bridal Velvet',
    fabric: 'Micro Velvet • Antique Gold Zardozi & Dabka',
    price: 5600,
    image: '/images/rack-maroon-front.png',
    backDetails: 'Full sheer-tulle or solid velvet U-back with concealed side zip and heavy tassel tie-back.',
    craftNote: 'Matches our Royal Crimson & Ivory Heritage bridal lehengas.',
    sizes: [32, 34, 36, 38, 40, 42],
  },
  {
    id: 'rack-rose',
    name: 'APURVA DUSTY ROSE GOTA BLOUSE',
    category: 'Raw Silk',
    fabric: 'Tussar Raw Silk • Pearl & Silver-Gold Gota Patti',
    price: 4500,
    image: '/images/rack-rose-front.png',
    backDetails: 'Structured boat-cut back with pearl-button placket and soft breathable mulmul lining.',
    craftNote: 'Ideal for Sangeet, Mehendi, and daylight reception drapes.',
    sizes: [32, 34, 36, 38, 40, 42],
  },
  {
    id: 'rack-emerald',
    name: 'APURVA EMERALD TEMPLE ZARI BLOUSE',
    category: 'Banarasi Zari',
    fabric: 'Kanchipuram Raw Silk • Antique Temple Border',
    price: 4200,
    image: '/images/rack-emerald-front.png',
    backDetails: 'Classic circular cut-out back framed with hand-woven gold zari piping and silk tassels.',
    craftNote: 'Pairs effortlessly with Banarasi & Katan silk sarees.',
    sizes: [32, 34, 36, 38, 40, 42],
  },
  {
    id: 'rack-sindoor',
    name: 'APURVA SINDOOR ZARI BORDER CHOLI',
    category: 'Bridal Velvet',
    fabric: 'Matte Bridal Velvet • Heavy Zari Sleeve Cuff',
    price: 5200,
    image: '/images/rack-maroon-front.png',
    backDetails: 'Sculpted deep-pot back with hand-knotted gota dori and zardozi buttis.',
    craftNote: 'Signature Patna bridal trousseau favorite.',
    sizes: [32, 34, 36, 38, 40, 42],
  },
  {
    id: 'rack-haldi',
    name: 'APURVA HALDI GOLD SCALLOP CHOLI',
    category: 'Banarasi Zari',
    fabric: 'Silk Brocade • Scallop Mirror & Thread Work',
    price: 4400,
    image: '/images/rack-saffron-front.png',
    backDetails: 'Open diamond cut-out back with metallic gold tissue piping and double tassels.',
    craftNote: 'Designed for Haldi ceremonies and festive Banarasi drapes.',
    sizes: [32, 34, 36, 38, 40, 42],
  },
];

export const DECK_CARDS: DeckCardItem[] = [
  {
    id: 'card-crimson',
    labelTop: 'CRIMSON',
    labelBottom: 'ZARDOZI',
    title: 'Royal Crimson Velvet Lehenga',
    subtitle: 'Double Dupatta • Hand Zardozi',
    price: 28500,
    bgColor: '#8B1E2B',
    image: '/images/look-crimson.png',
  },
  {
    id: 'card-ivory',
    labelTop: 'IVORY',
    labelBottom: 'HERITAGE',
    title: 'Ivory Katan Paisley Lehenga',
    subtitle: 'Banarasi Contrast Drape',
    price: 26000,
    bgColor: '#B58932',
    image: '/images/look-ivory.png',
  },
  {
    id: 'card-emerald',
    labelTop: 'KANCHI',
    labelBottom: 'EMERALD',
    title: 'Emerald Temple Zari Saree',
    subtitle: 'Rich Contrast Pallu',
    price: 16500,
    bgColor: '#0E5A45',
    image: '/images/look-emerald.png',
  },
  {
    id: 'card-rose',
    labelTop: 'PASTEL',
    labelBottom: 'GOTA PATTI',
    title: 'Dusty Rose Sangeet Lehenga',
    subtitle: 'Mirror & Pearl Handwork',
    price: 19500,
    bgColor: '#B04368',
    image: '/images/look-rose.png',
  },
  {
    id: 'card-saffron',
    labelTop: 'SAFFRON',
    labelBottom: 'SILK',
    title: 'Marigold Temple Silk Saree',
    subtitle: 'Festive & Haldi Edit',
    price: 13800,
    bgColor: '#C46210',
    image: '/images/look-saffron.png',
  },
  {
    id: 'card-sindoor',
    labelTop: 'SINDOOR',
    labelBottom: 'VELVET',
    title: 'Patna Bridal Velvet Set',
    subtitle: 'Heirloom Trousseau',
    price: 31200,
    bgColor: '#7A1624',
    image: '/images/look-crimson.png',
  },
  {
    id: 'card-royal-gold',
    labelTop: 'BENARES',
    labelBottom: 'GOLD',
    title: 'Banarasi Gold Katan Drape',
    subtitle: 'Woven Zari Border',
    price: 22400,
    bgColor: '#9A6F1E',
    image: '/images/look-ivory.png',
  },
];

export const BRIDAL_STORIES: BridalStoryItem[] = [
  {
    id: 'story-crimson',
    title: 'Sindoor Zardozi',
    collection: 'APURVA BRIDAL COUTURE',
    description: 'Deep bridal velvet, hand-worked antique dabka borders, made for the pheras.',
    price: 28500,
    glowColor: '#9E1F2E',
    image: '/images/look-crimson.png',
    bgHex: '#2B070C',
  },
  {
    id: 'story-ivory',
    title: 'Katan Ivory & Red',
    collection: 'BANARASI HERITAGE',
    description: 'Luminous ivory paisley silk layered beneath a pure sindoor Banarasi veil.',
    price: 26000,
    glowColor: '#C08F38',
    image: '/images/look-ivory.png',
    bgHex: '#241B0B',
  },
  {
    id: 'story-emerald',
    title: 'Pachai Temple Pattu',
    collection: 'KANCHI WEAVES',
    description: 'Peacock-emerald silk woven with traditional temple checks and gold zari.',
    price: 16500,
    glowColor: '#0E6B50',
    image: '/images/look-emerald.png',
    bgHex: '#07241B',
  },
  {
    id: 'story-rose',
    title: 'Sangeet Rose Gota',
    collection: 'RECEPTION PASTELS',
    description: 'Featherlight dusty rose raw silk sparkling with mirror work and pearl tassels.',
    price: 19500,
    glowColor: '#B84A6E',
    image: '/images/look-rose.png',
    bgHex: '#290E18',
  },
];

export const WEAVE_SILK_OPTIONS: WeaveSilkOption[] = [
  {
    id: 'weave-ivory',
    name: 'Muga Ivory Katan',
    origin: 'Banarasi Brocade',
    price: 26000,
    primaryHex: '#E9DCC3',
    zariHex: '#C79B42',
    accentHex: '#B68938',
    image: '/images/look-ivory.png',
  },
  {
    id: 'weave-crimson',
    name: 'Sindoor Crimson Velvet',
    origin: 'Zardozi Bridal',
    price: 28500,
    primaryHex: '#8B1E2B',
    zariHex: '#E7C16D',
    accentHex: '#5D0F18',
    image: '/images/look-crimson.png',
  },
  {
    id: 'weave-emerald',
    name: 'Kanchi Temple Emerald',
    origin: 'Pure Zari Border',
    price: 16500,
    primaryHex: '#0D5C46',
    zariHex: '#DFB65D',
    accentHex: '#073A2C',
    image: '/images/look-emerald.png',
  },
  {
    id: 'weave-rose',
    name: 'Rani Rose Gota Silk',
    origin: 'Sangeet Raw Silk',
    price: 19500,
    primaryHex: '#B84A6E',
    zariHex: '#F3D2DF',
    accentHex: '#872D4B',
    image: '/images/look-rose.png',
  },
  {
    id: 'weave-saffron',
    name: 'Haldi Saffron Marigold',
    origin: 'Festive Handloom',
    price: 13800,
    primaryHex: '#D17018',
    zariHex: '#F7D076',
    accentHex: '#9E4B0A',
    image: '/images/look-saffron.png',
  },
  {
    id: 'weave-plum',
    name: 'Patna Wine Brocade',
    origin: 'Reception Tissue',
    price: 21400,
    primaryHex: '#5E1B3A',
    zariHex: '#E5BC6B',
    accentHex: '#3B0F24',
    image: '/images/editorial-side-1.jpg',
  },
];

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
