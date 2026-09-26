// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde Grays- of winkelfeed.
import type { Product } from '../types';

export const graysGr5000Dynabow: Product = {
  slug: 'grays-gr5000-dynabow',
  brand: 'Grays',
  name: 'Grays GR5000 Dynabow',
  dataStatus: 'test-data',
  imageAlt: 'Grays GR5000 Dynabow hockeystick',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-22',
  },
  recommendedPositions: {
    value: ['middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  bowProfile: {
    value: 'mid-bow',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  carbonPercentage: {
    value: 40,
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
    value: 159.95,
    source: 'editorial-estimate',
    sourceLabel: 'Richtprijs, geen live winkelprijs',
    lastVerifiedAt: '2026-09-22',
  },
  stock: {
    value: 'limited',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen live voorraad',
    lastVerifiedAt: '2026-09-22',
  },
  summary:
    'Een responsieve mid-bow stick met een hoger carbonpercentage, die kan passen bij ervaren spelers die meer power en dribbelcontrole willen combineren.',
  strengths: {
    value: [
      'Responsieve mid-bow stick met merkbaar meer power dan instapmodellen',
      'Combineert dribbelcontrole met een stevigere shot',
      'Kan passen bij spelers die hun techniek al goed onder controle hebben',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  pointsOfAttention: {
    value: [
      'Minder vergevingsgezind bij mishits dan sticks met een lager carbonpercentage',
      'Beperkt beschikbaar volgens de huidige (test)voorraad',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/grays-gr5000-dynabow',
    isSeller: true,
  },
};
