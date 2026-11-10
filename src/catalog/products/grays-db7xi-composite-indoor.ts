import type { Product } from '../types';

const SOURCE =
  'https://www.grays-hockey.eu/collections/indoor-hockey-sticks/products/db7xi-dynabow-composite-hockey-stick';
const CHECKED = '2026-10-05';

export const graysDb7xiCompositeIndoor: Product = {
  slug: 'grays-db7xi-composite-indoor',
  brand: 'Grays',
  name: 'Grays DB7Xi Composite Indoor Hockey Stick',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/grays-db7xi-dynabow-senior-hockeystick-rood/9300000304766248/',
  imageAlt: 'Grays DB7Xi Composite zaalhockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAJD26Composite_20Sticks_20DB7Xi_20Dynabow_20Indoor_20Hockey_20Stick_20Red_20_20Silver.jpg?v=1779971676&width=1024',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'brand-website',
    sourceLabel:
      'Grays voert dit model in de collectie "Indoor Hockey Sticks".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'brand-website',
    sourceLabel:
      'Grays schrijft: "Whether you are new to the game or pushing for honours, this stick keeps you confident under pressure." Ingedeeld bij de laagste van die twee: beginner.',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke positie voor dit zaalmodel.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'dynabow',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt het profiel "Dynabow"; een curvepositie in mm staat er niet bij.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'brand-website',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 230,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs zoals vermeld op de officiële Grays-website.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'editorial-estimate',
    sourceLabel: 'Geen live voorraadkoppeling — weergegeven als indicatie.',
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een allround zaalstick met het Dynabow-profiel van Grays en een "Micro headshape for tight indoor spaces and quick skills". Grays richt hem op zowel nieuwe als ambitieuze zaalspelers.',
  strengths: {
    value: [
      'Allround Dynabow-profiel, een rustiger profiel dan de lage Jumbow',
      'Kleine kop die volgens Grays is bedoeld voor snelle acties in een kleine ruimte',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage en gewicht worden door Grays niet vermeld',
      'Alleen in 36,5" en 37,5" verkrijgbaar; geen juniormaten',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
