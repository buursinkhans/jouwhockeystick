// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde Grays- of winkelfeed.
import type { Product } from '../types';

export const graysGx2000Ultrabow: Product = {
  slug: 'grays-gx2000-ultrabow',
  brand: 'Grays',
  name: 'Grays GX2000 Ultrabow',
  dataStatus: 'test-data',
  imageAlt: 'Grays GX2000 Ultrabow hockeystick',
  experienceLevel: {
    value: 'gevorderd',
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
    value: 20,
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
    value: 109.95,
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
    'Een mid-bow stick met wat meer carbon, die een logische richting kan zijn voor spelers die hun techniek verder ontwikkelen en meer controle in de aanval zoeken.',
  strengths: {
    value: [
      'Mid bow combineert controle met wat meer power dan een low-bow stick',
      'Logische tussenstap zodra de basistechniek al aardig zit',
      'Nog redelijk vergevingsgezind dankzij het gematigde carbonpercentage',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  pointsOfAttention: {
    value: [
      'Minder specialistisch dan sticks met een hoger carbonpercentage voor een zware shot',
      'Nog niet de stugheid die sommige ervaren spelers zoeken',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-22',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/grays-gx2000-ultrabow',
    isSeller: true,
  },
};
