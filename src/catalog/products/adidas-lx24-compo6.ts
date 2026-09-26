// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde merk- of winkelfeed.
import type { Product } from '../types';

export const adidasLx24Compo6: Product = {
  slug: 'adidas-lx24-compo6',
  brand: 'adidas',
  name: 'adidas LX24 Compo 6',
  dataStatus: 'test-data',
  imageAlt: 'adidas LX24 Compo 6 hockeystick',
  experienceLevel: {
    value: 'gevorderd',
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
    value: 24,
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
    value: 84.95,
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
    'Een allround low-bow stick met een betaalbaar carbonpercentage, die een logische richting kan zijn voor spelers die hun techniek verder ontwikkelen.',
  strengths: {
    value: [
      'Allround low-bow stick, prettig voor wie nog volop in ontwikkeling is',
      'Betaalbare instap in carbon zonder meteen heel stug te zijn',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  pointsOfAttention: {
    value: [
      'Minder respons voor wie al gewend is aan een hoog carbonpercentage',
      'Beperkte specialisatie richting één specifieke speelstijl',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/adidas-lx24-compo6',
    isSeller: true,
  },
};
