import type { Product } from '../types';

const SOURCE =
  'https://www.grays-hockey.eu/collections/indoor-hockey-sticks/products/probow-9i-indoor-hockey-stick';
const CHECKED = '2026-10-05';

export const graysPb9iIndoor: Product = {
  slug: 'grays-pb9i-indoor',
  brand: 'Grays',
  name: 'Grays PB9i Indoor Hockey Stick',
  dataStatus: 'verified',
  imageAlt: 'Grays PB9i zaalhockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HBAL25WoodenSticksPB9iProbowWoodHybridIndoorHockeyStickWhite_Silver.jpg?v=1790669914&width=1024',
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
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt geen niveau, wel "close control, dribbling & drag flicking". Ingeschat als gevorderd.',
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
      'Grays noemt het "Probow blade profile ideal for close control, dribbling & drag flicking".',
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
    value: 210,
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
    'De goedkoopste zaalstick op de eigen website van Grays, met een Probow-profiel dat Grays omschrijft als "ideal for close control, dribbling & drag flicking".',
  strengths: {
    value: [
      'Laagste adviesprijs van de zaalsticks op de Grays-website',
      'Probow-profiel, gericht op balcontrole en dribbelen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Materiaal, carbonpercentage en gewicht worden door Grays niet vermeld',
      'Alleen in 36,5" en 37,5" verkrijgbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
