import type { Product } from '../types';

export const graysAuraGtJunior: Product = {
  slug: 'grays-aura-gt-junior',
  brand: 'Grays',
  name: 'Grays Aura GT Junior Hockey Stick',
  dataStatus: 'verified',
  imageAlt: 'Grays Aura GT Junior hockeystick',
  experienceLevel: {
    value: 'beginner',
    source: 'brand-website',
    sourceLabel:
      'Grays omschrijft dit model voor "young players" die schoolhockey/clubtraining doen en basisvaardigheden ontwikkelen.',
    sourceUrl: 'https://grays-hockey.eu/collections/junior-hockey-sticks/products/aura-gt-junior-hockey-stick-blue',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-26',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke veldpositie voor dit instapmodel.',
    lastVerifiedAt: '2026-09-26',
  },
  bowProfile: {
    value: 'low-bow',
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt dit "Classic bow, straighter curve" — dat past het beste bij een low-bow (traditioneel, minder uitgesproken curve), maar is niet letterlijk zo genoemd.',
    sourceUrl: 'https://grays-hockey.eu/collections/junior-hockey-sticks/products/aura-gt-junior-hockey-stick-blue',
    lastVerifiedAt: '2026-09-26',
  },
  lengthsInches: {
    value: [26, 28, 30, 32, 34, 35],
    source: 'brand-website',
    sourceUrl: 'https://grays-hockey.eu/collections/junior-hockey-sticks/products/aura-gt-junior-hockey-stick-blue',
    lastVerifiedAt: '2026-09-26',
  },
  priceIndicativeEur: {
    value: 30,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs zoals vermeld op de officiële Grays-website.',
    sourceUrl: 'https://grays-hockey.eu/collections/junior-hockey-sticks/products/aura-gt-junior-hockey-stick-blue',
    lastVerifiedAt: '2026-09-26',
  },
  stock: {
    value: 'available',
    source: 'editorial-estimate',
    sourceLabel: 'Geen live voorraadkoppeling — weergegeven als indicatie.',
    lastVerifiedAt: '2026-09-26',
  },
  summary:
    'Een zeer toegankelijke instapstick voor jonge, beginnende spelers, met een ruim lengteaanbod van 26" tot 35".',
  strengths: {
    value: [
      'Zeer toegankelijke prijs (€30) voor een eerste eigen stick',
      'Ruim lengteaanbod (26" t/m 35") binnen één instapmodel',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: '2026-09-26',
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage wordt niet vermeld — vermoedelijk een basis composietstick zonder noemenswaardig carbon',
      'Geen aparte leeftijdsindicatie door Grays zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: '2026-09-26',
  },
};
