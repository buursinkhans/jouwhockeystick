import type { Product } from '../types';

// Source: Brabo (brabohockey.com, Pure 20 PB, article 315.63461). Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL = 'https://brabohockey.com/products/pure-20-pb';
const PASSA_URL =
  'https://www.passasports.nl/brabo-pure-20-probow-31563461010';

export const braboPure20Probow31563461010: Product = {
  slug: 'brabo-pure-20-probow-31563461010',
  brand: 'Brabo',
  name: 'Brabo Pure 20 ProBow',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Brabo Pure 20 ProBow hockeystick',
  imageUrl:
    'https://brabohockey.com/cdn/shop/files/315.63461.010_1_1a8f86b8-9087-423e-8ce1-a933faad9821.jpg',
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
    source: 'brand-website',
    sourceLabel:
      'Brabo noemt beginners die vertrouwen en gebruiksgemak willen, én allroundspelers die een gebalanceerde stick zoeken. We nemen het eerstgenoemde niveau over.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Brabo noemt geen veldpositie, wel allroundspelers. Positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'probow',
    source: 'brand-website',
    sourceLabel: 'Brabo noemt dit model expliciet "Pro Bow".',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 20,
    source: 'brand-website',
    sourceLabel: 'Brabo vermeldt 20% carbon.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5, 38.5],
    source: 'brand-website',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 99.99,
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
    'Een vergevingsgezinde seniorstick met pro bow en weinig carbon, voor spelers die net beginnen of een rustige allroundstick zoeken. Een logische richting als je eerst balgevoel wilt opbouwen.',
  strengths: {
    value: [
      'Pro bow: kan passen bij wie veel wil passen en de bal rustig wil aannemen',
      'Met 20% carbon voelt hij doorgaans comfortabeler en vergevingsgezinder dan stijvere sticks',
      'Brabo benadrukt gebruiksgemak en een gebalanceerd gevoel bij dribbelen, passen en schieten',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Weinig carbon geeft minder slagkracht dan stijvere sticks; ambitieuze spelers kunnen hem snel ontgroeien',
      'Alleen seniorlengtes (vanaf 36,5 inch): niet bedoeld voor jonge spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
