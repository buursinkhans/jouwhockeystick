// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde Grays- of winkelfeed.
import type { Product } from '../types';

export const graysGr7000Probow: Product = {
  slug: 'grays-gr7000-probow',
  brand: 'Grays',
  name: 'Grays GR7000 Probow',
  dataStatus: 'test-data',
  imageAlt: 'Grays GR7000 Probow hockeystick',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-22',
  },
  recommendedPositions: {
    value: ['aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  bowProfile: {
    value: 'late-bow',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  carbonPercentage: {
    value: 60,
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  priceIndicativeEur: {
    value: 219.95,
    source: 'editorial-estimate',
    sourceLabel: 'Richtprijs, geen live winkelprijs',
    lastVerifiedAt: '2026-09-22',
  },
  stock: {
    value: 'available',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen live voorraad',
    lastVerifiedAt: '2026-09-22',
  },
  summary:
    'Een stick met een late bow en hoog carbonpercentage, die een logische richting kan zijn voor ervaren aanvallers die op zoek zijn naar een explosieve shot.',
  strengths: {
    value: [
      'Late bow en hoog carbonpercentage geven een explosieve, krachtige shot',
      'Kan passen bij spelers die veel waarde hechten aan power in de aanval',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  pointsOfAttention: {
    value: [
      'Hoog carbonpercentage maakt de stick minder vergevingsgezind bij mishits',
      'Minder geschikt voor spelers die nog weinig stickervaring hebben',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/grays-gr7000-probow',
    isSeller: true,
  },
};
