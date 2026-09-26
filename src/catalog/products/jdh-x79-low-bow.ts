// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde merk- of winkelfeed.
import type { Product } from '../types';

export const jdhX79LowBow: Product = {
  slug: 'jdh-x79-low-bow',
  brand: 'JDH',
  name: 'JDH X79 Low Bow',
  dataStatus: 'test-data',
  imageAlt: 'JDH X79 Low Bow hockeystick',
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-23',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder'],
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
    value: 30,
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  lengthsInches: {
    value: [35, 36.5, 37.5],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  priceIndicativeEur: {
    value: 119.95,
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
    'Een low-bow stick met een gematigd carbonpercentage, die een logische richting kan zijn voor spelers die liftjes en dribbelen dicht bij de stick willen verfijnen.',
  strengths: {
    value: [
      'Low bow kan liftjes en dribbelen dicht bij de stick ondersteunen',
      'Gematigd carbonpercentage — vergevingsgezind maar toch responsief',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  pointsOfAttention: {
    value: [
      'Minder krachtig bij een verre, harde pass',
      'Niet primair gericht op pure aanvallers',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/jdh-x79-low-bow',
    isSeller: true,
  },
};
