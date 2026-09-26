// TEST DATA — fictieve MVP-voorbeelddata, geen geverifieerde merk- of winkelfeed.
import type { Product } from '../types';

export const adidasLx24CarbonCompo1: Product = {
  slug: 'adidas-lx24-carbon-compo1',
  brand: 'adidas',
  name: 'adidas LX24 Carbon Compo 1',
  dataStatus: 'test-data',
  imageAlt: 'adidas LX24 Carbon Compo 1 hockeystick',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    modelYear: 2025,
    lastVerifiedAt: '2026-09-23',
  },
  recommendedPositions: {
    value: ['aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  bowProfile: {
    value: 'late-bow',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  carbonPercentage: {
    value: 90,
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
    value: 249.95,
    source: 'editorial-estimate',
    sourceLabel: 'Richtprijs, geen live winkelprijs',
    lastVerifiedAt: '2026-09-23',
  },
  stock: {
    value: 'limited',
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen live voorraad',
    lastVerifiedAt: '2026-09-23',
  },
  summary:
    'Een late-bow stick met een zeer hoog carbonpercentage, gericht op ervaren spelers die precisie en kracht willen combineren in de aanval.',
  strengths: {
    value: [
      'Zeer hoog carbonpercentage voor maximale power in de shot',
      'Gericht op ervaren spelers die precisie en kracht combineren',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  pointsOfAttention: {
    value: [
      'Zeer stug — kan minder vergevingsgezind aanvoelen bij wisselende balaanname of mishits',
      'Niet aan te raden als eerste of enige stick voor spelers die nog weinig ervaring hebben',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Fictieve MVP-testdata, geen geverifieerde bron',
    lastVerifiedAt: '2026-09-23',
  },
  partnerShop: {
    name: 'Voorbeeld Hockeywinkel',
    url: 'https://www.voorbeeld-hockeywinkel.test/adidas-lx24-carbon-compo1',
    isSeller: true,
  },
};
