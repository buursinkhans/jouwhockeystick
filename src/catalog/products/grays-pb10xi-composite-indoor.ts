import type { Product } from '../types';

const SOURCE =
  'https://www.grays-hockey.eu/collections/indoor-hockey-sticks/products/pb10xi-probow-composite-hockey-stick';
const CHECKED = '2026-10-05';

export const graysPb10xiCompositeIndoor: Product = {
  slug: 'grays-pb10xi-composite-indoor',
  brand: 'Grays',
  name: 'Grays PB10Xi Composite Indoor Hockey Stick',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: '2026-10-08' },
  imageAlt: 'Grays PB10Xi Composite zaalhockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAJA26Composite_20Sticks_20PB10Xi_20Probow_20Indoor_20Hockey_20Stick_20Black_20_20Orange.jpg?v=1779971848&width=1024',
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
    value: 'gevorderd',
    source: 'brand-website',
    sourceLabel:
      'Grays omschrijft dit model voor "ambitious players pushing their indoor game to the next level".',
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
    value: 'probow',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt het profiel "Probow"; een curvepositie in mm staat er niet bij.',
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
    value: 300,
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
    'Het topmodel van de Grays-zaalsticks: volgens Grays een "Xi composite construction developed specifically for indoor hockey" met een "Micro headshape for close control in confined spaces". Een logische richting voor ambitieuze zaalspelers.',
  strengths: {
    value: [
      'Door Grays specifiek voor zaalhockey ontwikkeld, met een kleine kop voor balcontrole in een kleine ruimte',
      'Probow-profiel, een allround profiel dat ook liften en 3D ondersteunt',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage en gewicht worden door Grays niet vermeld',
      'Alleen in 36,5" en 37,5" verkrijgbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
