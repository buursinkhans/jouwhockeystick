import type { Product } from '../types';

// Sources: Grays (grays-hockey.eu, DB 6 Junior) for the specs; PassaHockey feed for carbon
// (Grays names no percentage, see docs/catalogus-aanvuller.md §4). Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL =
  'https://www.grays-hockey.eu/products/db6-junior-composite-hockey-stick-blue';
const PASSA_URL = 'https://www.passasports.nl/grays-dynabow-6-junior-23274';

export const graysDynabow6Junior23274: Product = {
  slug: 'grays-dynabow-6-junior-23274',
  brand: 'Grays',
  name: 'Grays Dynabow 6 Junior',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Grays Dynabow 6 Junior hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HABG25Composite_20Sticks_20DB6_20Dynabow_20MC_20Black_20Blue_20Main_ecbfc1e0-5aeb-47f7-bb55-1856ff6fb8ad.jpg?v=1744213113',
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
    source: 'brand-website',
    sourceLabel:
      'Grays omschrijft dit juniormodel als gemaakt voor "intermediate power and control".',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt geen veldpositie, alleen gebalanceerde prestaties. Positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'dynabow',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt een "Dynabow profile" (24.75 @ 250 mm) met een Micro-kop.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 40,
    source: 'partner-shop',
    sourceLabel:
      "PassaHockey (PassaSports) vermeldt 'Carbonpercentage: 40%'; Grays noemt zelf geen percentage.",
    sourceUrl: PASSA_URL,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [32, 33, 34, 35],
    source: 'brand-website',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 110,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs zoals vermeld op de officiële Grays-website.',
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
    'Een juniorstick van Grays met dynabow, een kromming tussen mid bow en low bow in. Kan passen bij jonge spelers die balgevoel en een gemiddeld carbonaandeel willen.',
  strengths: {
    value: [
      'Dynabow met Micro-kop: volgens Grays goed voor touch en 3D-vaardigheden',
      'Gemiddeld carbonaandeel (40%) met graphene-constructie voor duurzaamheid en schokdemping',
      'Beschikbaar in vier juniorlengtes, van 32 tot 35 inch',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Het carbonpercentage komt van PassaHockey; Grays noemt zelf geen percentage',
      'Grays verkoopt dit model in meer kleuren; de specificaties komen van de blauwe uitvoering',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de bronnen van Grays en PassaHockey.',
    lastVerifiedAt: CHECKED,
  },
};
