// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde Grays- of winkelfeed.
import type { Product } from '../types';

export const graysGx1000Jumbow: Product = {
  slug: 'grays-gx1000-jumbow',
  brand: 'Grays',
  name: 'Grays GX1000 Jumbow',
  dataStatus: 'test-data',
  imageAlt: 'Grays GX1000 Jumbow hockeystick',
  experienceLevel: {
    value: 'beginner',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-22',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  bowProfile: {
    value: 'low-bow',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  carbonPercentage: {
    value: 10,
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  lengthsInches: {
    value: [35, 36.5, 37.5],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  priceIndicativeEur: {
    value: 89.95,
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
    'Een stevige instapstick voor volwassenen met een low bow, die kan passen bij spelers die net beginnen met balcontrole en basistechniek.',
  strengths: {
    value: [
      'Stevige instapstick die ruimte geeft om techniek te ontwikkelen',
      'Low bow ondersteunt balcontrole en de eerste dribbeltechnieken',
      'Vergevingsgezind bij mishits',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  pointsOfAttention: {
    value: [
      'Minder respons bij een krachtige shot door het lage carbonpercentage',
      'Kan aan de zware kant aanvoelen voor wie liever heel licht speelt',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/grays-gx1000-jumbow',
    isSeller: true,
  },
};
