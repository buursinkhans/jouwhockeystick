import type { Product } from '../types';

// Sources: Grays (grays-hockey.eu, JB 6 Junior) for the specs; PassaHockey feed for carbon
// (Grays names no percentage, see docs/catalogus-aanvuller.md §4). Checked 2026-10-29.
const CHECKED = '2026-10-29';
const BRAND_URL =
  'https://www.grays-hockey.eu/products/jb6-junior-composite-hockey-stick-1';
const PASSA_URL = 'https://www.passasports.nl/grays-jb-6-junior-27055';

export const graysJb6Junior27055: Product = {
  slug: 'grays-jb-6-junior-27055',
  brand: 'Grays',
  name: 'Grays JB 6 Junior',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA_URL,
  imageAlt: 'Grays JB 6 Junior hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAEE26CompositeSticksJB6JumbowHockeyStickBlue_Silver_205ecdcd-c42e-44a9-a324-d8027c3d241b.jpg?v=1779972538',
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
      'Grays omschrijft dit juniormodel met "intermediate power and control ratings" voor ambitieuze junioren en allroundspel.',
    sourceUrl: BRAND_URL,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt geen veldpositie, alleen allroundspel. Positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt een "Jumbow blade profile" (24.75 @ 200 mm) maar niet het label "low bow"; op deze site ingedeeld als low bow, net als de senior JB 6.',
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
    'De juniorversie van de Grays JB 6, voor ambitieuze jonge spelers die een lage kromming willen proberen. Grays noemt hem geschikt voor allroundspel en technische acties.',
  strengths: {
    value: [
      'Jumbow-profiel: kan passen bij spelers die graag slepen, liften en technische acties oefenen',
      'Maxi-kop die volgens Grays extra slagkracht en balcontrole geeft',
      'Gemiddeld carbonaandeel (40%) met graphene-constructie voor duurzaamheid en schokdemping',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Het carbonpercentage komt van PassaHockey; Grays noemt zelf geen percentage',
      'Dat de Jumbow als low bow geldt is onze eigen indeling',
      'Een lage kromming vraagt wennen als je van een mid bow komt',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de bronnen van Grays en PassaHockey.',
    lastVerifiedAt: CHECKED,
  },
};
