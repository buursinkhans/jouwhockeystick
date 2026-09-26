// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde merk- of winkelfeed.
import type { Product } from '../types';

export const princessPremium7Star: Product = {
  slug: 'princess-premium-7-star',
  brand: 'Princess',
  name: 'Princess Premium 7 Star',
  dataStatus: 'test-data',
  imageAlt: 'Princess Premium 7 Star hockeystick',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-23',
  },
  recommendedPositions: {
    value: ['middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  bowProfile: {
    value: 'mid-bow',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  carbonPercentage: {
    value: 70,
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  priceIndicativeEur: {
    value: 199.95,
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
    'Een mid-bow stick met een hoog carbonpercentage, die kan passen bij ervaren spelers die kracht en controle willen combineren.',
  strengths: {
    value: [
      'Hoog carbonpercentage voor spelers die kracht en controle combineren',
      'Mid bow blijft ook bij snel dribbelen goed hanteerbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  pointsOfAttention: {
    value: [
      'Minder vergevingsgezind bij mishits door het hoge carbonpercentage',
      'Prijs aan de hogere kant binnen dit assortiment',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/princess-premium-7-star',
    isSeller: true,
  },
};
