import type { Product } from '../types';

// Sources: Brabo (brabohockey.com, article 315.65280) for lengths, price and photo;
// PassaHockey feed for the bow. Brabo's page says "15% carbon" while PassaHockey
// says 40%, so the carbon percentage is left out. Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL = 'https://brabohockey.com/products/gforce-pure-40';
const PASSA_URL =
  'https://www.passasports.nl/brabo-g-force-pure-40-junior-3156528000';

export const braboGForcePure40Junior3156528000: Product = {
  slug: 'brabo-g-force-pure-40-junior-3156528000',
  brand: 'Brabo',
  name: 'Brabo G-Force Pure 40 Junior',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Brabo G-Force Pure 40 Junior hockeystick',
  imageUrl:
    'https://brabohockey.com/cdn/shop/files/315.65280.000_1_e662d550-520b-4ed1-bc6f-798720745c0f.jpg?v=1783352014',
  imageSourceUrl: BRAND_URL,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey plaatst deze stick bij de veldhockeysticks.',
    sourceUrl: PASSA_URL,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'editorial-estimate',
    sourceLabel:
      'Brabo noemt geen niveau; de merkpagina spreekt van een lichte stick die controle en kracht in balans brengt. Eigen inschatting op basis van de prijs (€64,99) en het lage carbonpercentage dat Brabo noemt; een juniorstick schatten we nooit als "ervaren" in.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Brabo noemt geen veldpositie. Eigen inschatting; positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel:
      'PassaHockey vermeldt "Type kromming: MidBow"; Brabo noemt de kromming niet.',
    sourceUrl: PASSA_URL,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [28, 30, 31, 32, 33, 34, 35, 36],
    source: 'brand-website',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 64.99,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs zoals vermeld op de officiële Brabo-website.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel: 'Voorraad volgens de productfeed van PassaHockey op 2026-10-28.',
    sourceUrl: PASSA_URL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een betaalbare juniorstick van Brabo met mid bow, voor jonge spelers die een allroundstick zoeken zonder veel te willen uitgeven. Door het lage carbonaandeel is hij vooral een logische instap.',
  strengths: {
    value: [
      'Mid bow: een allround kromming die bij veel spelers en posities kan passen',
      'Voor een lage adviesprijs te koop, in acht lengtes van 28 tot 36 inch',
      'Brabo beschrijft hem als licht, met een balans tussen controle en kracht',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de gegevens van Brabo en PassaHockey.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Brabo noemt 15% carbon, PassaHockey 40%: we tonen daarom geen percentage; controleer dit bij de winkel',
      'Brabo noemt de kromming niet; die komt van PassaHockey',
      'Het niveau is onze eigen inschatting; Brabo noemt er geen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de tegenstrijdige bronnen en wat Brabo niet vermeldt.',
    lastVerifiedAt: CHECKED,
  },
};
