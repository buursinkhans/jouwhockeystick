// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde Grays- of winkelfeed.
import type { Product } from '../types';

export const graysGx1000JumbowJunior: Product = {
  slug: 'grays-gx1000-jumbow-junior',
  brand: 'Grays',
  name: 'Grays GX1000 Jumbow Junior',
  dataStatus: 'test-data',
  imageAlt: 'Grays GX1000 Jumbow Junior hockeystick',
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
    value: [30, 31, 32, 33, 34],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  priceIndicativeEur: {
    value: 59.95,
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
    'Een lichte instapstick met een low bow, die een logische richting kan zijn voor jonge, beginnende spelers die willen wennen aan balcontrole.',
  strengths: {
    value: [
      'Licht gewicht — prettig voor kleine hockeyers die nog moeten wennen aan balcontrole',
      'Low bow maakt de stick voorspelbaar bij de eerste stappen in dribbelen',
      'Vergevingsgezind bij mishits door het lage carbonpercentage',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  pointsOfAttention: {
    value: [
      'Beperkte lengtes — geschikt voor jonge spelers, niet voor volwassenen',
      'Minder respons bij een krachtige shot door het lage carbonpercentage',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/grays-gx1000-jumbow-junior',
    isSeller: true,
  },
};
