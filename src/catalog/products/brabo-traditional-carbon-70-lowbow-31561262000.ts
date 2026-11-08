import type { Product } from '../types';

// Source: Brabo (brabohockey.com, Traditional 70 LB, article 315.61262). Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL = 'https://brabohockey.com/products/315-61262-traditional-70-lb';
const PASSA_URL =
  'https://www.passasports.nl/brabo-traditional-carbon-70-lowbow-31561262000';

export const braboTraditionalCarbon70Lowbow31561262000: Product = {
  slug: 'brabo-traditional-carbon-70-lowbow-31561262000',
  brand: 'Brabo',
  name: 'Brabo Traditional Carbon 70 LowBow',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Brabo Traditional Carbon 70 LowBow hockeystick',
  imageUrl:
    'https://brabohockey.com/cdn/shop/files/315.61262.000_1_b2ee2975-8654-430a-a21d-6eaeeb94e268.jpg?v=1780554179',
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
      'Brabo richt dit model op "experienced players" die een directe, krachtige stick zoeken.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Brabo noemt geen veldpositie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'brand-website',
    sourceLabel: 'Brabo noemt dit model expliciet "Low Bow".',
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
    'Een stijve carbonstick met low bow voor ervaren veldspelers die technisch willen spelen en veel slagkracht zoeken. Het zwaartepunt ligt bij directheid, minder bij vergevingsgezindheid.',
  strengths: {
    value: [
      'Low bow: kan passen bij spelers die de bal graag dicht bij de grond houden, slepen en liften',
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
      'Een low bow vraagt wennen als je van een mid bow of pro bow komt',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Brabo vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
