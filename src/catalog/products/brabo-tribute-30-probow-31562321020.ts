import type { Product } from '../types';

// Source: Brabo (brabohockey.com, Tribute 30 Pro Bow, article 315.62321). Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL = 'https://brabohockey.com/products/315-62321-tribute-30';
const PASSA_URL =
  'https://www.passasports.nl/brabo-tribute-30-probow-31562321020';

export const braboTribute30Probow31562321020: Product = {
  slug: 'brabo-tribute-30-probow-31562321020',
  brand: 'Brabo',
  name: 'Brabo Tribute 30 ProBow',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Brabo Tribute 30 ProBow hockeystick',
  imageUrl:
    'https://brabohockey.com/cdn/shop/files/315.62321.010_1_42fbb272-aca1-44f8-8f6c-747158c90b7b.jpg',
  imageSourceUrl: BRAND_URL,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey plaatst deze stick bij de veldhockeysticks.',
    sourceUrl: PASSA_URL,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'Brabo noemt geen niveau, wel een toegankelijke stick voor spelers die hun techniek willen ontwikkelen. Eigen inschatting op basis van het carbonpercentage (30%) en de prijs.',
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
    value: 30,
    source: 'brand-website',
    sourceLabel: 'Brabo vermeldt 30% carbon.',
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
    value: 109.99,
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
    'Een toegankelijke seniorstick met pro bow en 30% carbon, voor spelers die hun techniek verder willen ontwikkelen. Een logische stap tussen een instapstick en een stijf carbonmodel.',
  strengths: {
    value: [
      'Pro bow: kan passen bij allroundspelers die controle, passen en kracht willen combineren',
      '30% carbon: een balans tussen balgevoel en slagkracht',
      'Brabo legt de nadruk op controle en comfort',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Het niveau is onze eigen inschatting; Brabo noemt geen niveau',
      'Alleen seniorlengtes (vanaf 36,5 inch): niet bedoeld voor jonge spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
