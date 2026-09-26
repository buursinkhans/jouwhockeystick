// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde merk- of winkelfeed.
import type { Product } from '../types';

export const princessY3Junior: Product = {
  slug: 'princess-y3-junior',
  brand: 'Princess',
  name: 'Princess Y3 Junior',
  dataStatus: 'test-data',
  imageAlt: 'Princess Y3 Junior hockeystick',
  experienceLevel: {
    value: 'beginner',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-23',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  bowProfile: {
    value: 'low-bow',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  carbonPercentage: {
    value: 15,
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  lengthsInches: {
    value: [28, 30, 32],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  priceIndicativeEur: {
    value: 54.95,
    source: 'editorial-estimate',
    sourceLabel: 'Richtprijs, geen live winkelprijs',
    lastVerifiedAt: '2026-09-23',
  },
  stock: {
    value: 'available',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen live voorraad',
    lastVerifiedAt: '2026-09-23',
  },
  summary:
    'Een lichte juniorstick met een laag carbonpercentage, die een logische richting kan zijn voor jonge, beginnende spelers.',
  strengths: {
    value: [
      'Licht en laag carbonpercentage — prettig voor jonge, beginnende spelers',
      'Low bow kan liftjes en dribbelen makkelijker aanleerbaar maken',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  pointsOfAttention: {
    value: [
      'Beperkte lengtes — alleen geschikt voor jongere of kleinere spelers',
      'Niet geschikt voor een krachtige shot',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/princess-y3-junior',
    isSeller: true,
  },
};
