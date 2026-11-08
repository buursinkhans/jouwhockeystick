import type { Product } from '../types';

// Source: Brabo (brabohockey.com, Traditional 70 PB, article 315.61261). Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL = 'https://brabohockey.com/products/315-61261-traditional-70-pb';
const PASSA_URL =
  'https://www.passasports.nl/brabo-traditional-carbon-70-probow-31561261000';

export const braboTraditionalCarbon70Probow31561261000: Product = {
  slug: 'brabo-traditional-carbon-70-probow-31561261000',
  brand: 'Brabo',
  name: 'Brabo Traditional Carbon 70 ProBow',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Brabo Traditional Carbon 70 ProBow hockeystick',
  imageUrl:
    'https://brabohockey.com/cdn/shop/files/315.61261.000_1_f3cd4c9a-0870-4f74-8e31-c186c94cd864.jpg?v=1780554167',
  imageSourceUrl: BRAND_URL,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey plaatst deze stick bij de veldhockeysticks.',
    sourceUrl: PASSA_URL,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'ervaren',
    source: 'brand-website',
    sourceLabel:
      'Brabo richt dit model op ervaren spelers die een directe, krachtige stick zoeken.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Brabo noemt geen veldpositie, wel allroundspelers die controle, passen en kracht willen combineren. Positie is nooit de enige factor.',
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
    value: 70,
    source: 'brand-website',
    sourceLabel: 'Brabo vermeldt "70% 3K carbon".',
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
    value: 159.99,
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
    'Een stijve carbonstick met pro bow voor ervaren allroundspelers die passen, controle en slagkracht willen combineren. Hij is directer dan de lagere carbonmodellen van Brabo.',
  strengths: {
    value: [
      'Pro bow: een kromming die kan passen bij allroundspelers die veel passen en de bal rustig willen aannemen',
      '70% 3K carbon geeft een directe, stijve stick die veel slagkracht kan geven',
      'Verkrijgbaar in drie lengtes, van 36,5 tot 38,5 inch',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Veel carbon maakt de stick stijver; dat kan minder vergevingsgezind aanvoelen bij mishits',
      'Alleen seniorlengtes (vanaf 36,5 inch): niet bedoeld voor jonge spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
