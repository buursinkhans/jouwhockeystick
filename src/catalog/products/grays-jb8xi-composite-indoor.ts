import type { Product } from '../types';

const SOURCE =
  'https://www.grays-hockey.eu/collections/indoor-hockey-sticks/products/jb8xi-jumbow-composite-hockey-stick';
const CHECKED = '2026-10-05';

export const graysJb8xiCompositeIndoor: Product = {
  slug: 'grays-jb8xi-composite-indoor',
  brand: 'Grays',
  name: 'Grays JB8Xi Composite Indoor Hockey Stick',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: '2026-10-08' },
  imageAlt: 'Grays JB8Xi Composite zaalhockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAJC26Composite_20Sticks_20JB8Xi_20Jumbow_20Indoor_20Hockey_20Stick_20Mint_20_20Silver.jpg?v=1779971664&width=1024',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'brand-website',
    sourceLabel:
      'Grays voert dit model in de collectie "Indoor Hockey Sticks" en noemt het "Designed for the speed and skill of indoor hockey".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt geen niveau, wel "players who demand accuracy under pressure" in wedstrijden op hoog tempo. Ingeschat als gevorderd.',
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
    value: 'lowbow',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt het profiel "Jumbow blade profile"; net als bij de Jumbow-veldsticks ingedeeld als low bow.',
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
    value: 260,
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
    'Een zaalstick met het lage Jumbow-profiel van Grays, volgens Grays met een "Composite Xi construction for precision, power and control". Kan passen bij zaalspelers die veel liften en 3D-acties maken.',
  strengths: {
    value: [
      'Door Grays ontworpen voor het tempo en de techniek van zaalhockey',
      'Laag Jumbow-profiel, gericht op liften, flicks en 3D',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Een lage kromming kan het strak vlak pushen iets lastiger maken dan een rustiger profiel',
      'Carbonpercentage en gewicht worden door Grays niet vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
