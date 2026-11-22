import type { Product } from '../types';

/**
 * Osaka Futurelab 70 Lowbow. Verrijkt uit de PassaHockey-import (merkpagina's batch 1,
 * 2026-11-22, met toestemming van de eigenaar) op basis van de gegevens van
 * PassaHockey (source: 'partner-shop'). De officiële Osaka-site gaf bij elke
 * poging HTTP 429, dus bow, carbon en lengtes zijn niet met de merksite
 * vergeleken; dat staat zo bij de aandachtspunten.
 *
 * bol.com: er zijn listings van deze lijn, maar geen die eenduidig dit model
 * is (tegenstrijdige titels, kleuren of carbonwaarden), dus bewust geen
 * bolProductUrl en geen bolNotSold.
 */
export const osakaFuturelab70Lowbow: Product = {
  slug: 'osaka-futurelab-70-lowbow-stk00400-greenash',
  brand: 'Osaka',
  name: 'Osaka Futurelab 70 Lowbow',
  dataStatus: 'verified',
  passaSportsProductUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
  imageAlt: 'Osaka Futurelab 70 Lowbow hockeystick',
  imageUrl: 'https://cdn.sportshop.com/catalog/product/600/600/3/9/397738_1.jpg',
  imageSourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey plaatst deze stick bij de veldhockeysticks.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
    lastVerifiedAt: '2026-11-18',
  },
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel: 'PassaHockey noemt geen niveau. Eigen inschatting op basis van het carbonpercentage (70%).',
    lastVerifiedAt: '2026-11-18',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'PassaHockey noemt geen positie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.',
    lastVerifiedAt: '2026-11-18',
  },
  bowProfile: {
    value: 'lowbow',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey vermeldt "Type kromming: LowBow".',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
    lastVerifiedAt: '2026-11-18',
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel: 'PassaHockey vermeldt een carbonpercentage van 70%.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
    lastVerifiedAt: '2026-11-18',
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel: 'Lengtes die volgens de productfeed van PassaHockey leverbaar waren op de controledatum.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
    lastVerifiedAt: '2026-11-18',
  },
  priceIndicativeEur: {
    value: 155.95,
    source: 'partner-shop',
    sourceLabel: 'Laagste verkoopprijs bij PassaHockey volgens de productfeed op de controledatum.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
    lastVerifiedAt: '2026-11-18',
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel: 'Voorraad volgens de productfeed van PassaHockey op de controledatum.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-70-lowbow-stk00400-greenash',
    lastVerifiedAt: '2026-11-18',
  },
  summary: 'Een low-bow stick uit de Futurelab-lijn van Osaka met 70% carbon. Kan passen bij ervaren spelers die een lage kromming en veel carbon zoeken.',
  strengths: {
    value: ['Low bow met 70% carbon in de Futurelab-lijn van Osaka', 'Leverbaar in twee lengtes (36,5 en 37,5 inch)'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de gegevens in de productomschrijving van PassaHockey.',
    lastVerifiedAt: '2026-11-22',
  },
  pointsOfAttention: {
    value: ['Het niveau "ervaren" is onze inschatting: PassaHockey noemt geen niveau', 'Gegevens uit de productomschrijving van PassaHockey; nog niet met de website van Osaka vergeleken (die was bij de controle niet bereikbaar)'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de gegevens in de productomschrijving van PassaHockey.',
    lastVerifiedAt: '2026-11-22',
  },
};
