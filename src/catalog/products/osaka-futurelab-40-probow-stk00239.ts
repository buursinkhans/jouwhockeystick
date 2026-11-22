import type { Product } from '../types';

/**
 * Osaka Futurelab 40 Probow. Verrijkt uit de PassaHockey-import (merkpagina's batch 1,
 * 2026-11-22, met toestemming van de eigenaar) op basis van de gegevens van
 * PassaHockey (source: 'partner-shop'). De officiële Osaka-site gaf bij elke
 * poging HTTP 429, dus bow, carbon en lengtes zijn niet met de merksite
 * vergeleken; dat staat zo bij de aandachtspunten.
 *
 * bol.com: er zijn listings van deze lijn, maar geen die eenduidig dit model
 * is (tegenstrijdige titels, kleuren of carbonwaarden), dus bewust geen
 * bolProductUrl en geen bolNotSold.
 */
export const osakaFuturelab40Probow: Product = {
  slug: 'osaka-futurelab-40-probow-stk00239',
  brand: 'Osaka',
  name: 'Osaka Futurelab 40 Probow',
  dataStatus: 'verified',
  passaSportsProductUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
  imageAlt: 'Osaka Futurelab 40 Probow hockeystick',
  imageUrl: 'https://cdn.sportshop.com/catalog/product/600/600/2/0/208241_1.jpg',
  imageSourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey plaatst deze stick bij de veldhockeysticks.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
    lastVerifiedAt: '2026-11-18',
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel: 'PassaHockey noemt geen niveau. Eigen inschatting op basis van het carbonpercentage (40%).',
    lastVerifiedAt: '2026-11-18',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'PassaHockey noemt geen positie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.',
    lastVerifiedAt: '2026-11-18',
  },
  bowProfile: {
    value: 'probow',
    source: 'partner-shop',
    sourceLabel: 'PassaHockey vermeldt "Type kromming: ProBow".',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
    lastVerifiedAt: '2026-11-18',
  },
  carbonPercentage: {
    value: 40,
    source: 'partner-shop',
    sourceLabel: 'PassaHockey vermeldt een carbonpercentage van 40%.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
    lastVerifiedAt: '2026-11-18',
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel: 'Lengtes die volgens de productfeed van PassaHockey leverbaar waren op de controledatum.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
    lastVerifiedAt: '2026-11-18',
  },
  priceIndicativeEur: {
    value: 119.95,
    source: 'partner-shop',
    sourceLabel: 'Laagste verkoopprijs bij PassaHockey volgens de productfeed op de controledatum.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
    lastVerifiedAt: '2026-11-18',
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel: 'Voorraad volgens de productfeed van PassaHockey op de controledatum.',
    sourceUrl: 'https://www.passasports.nl/osaka-futurelab-40-probow-stk00239',
    lastVerifiedAt: '2026-11-18',
  },
  summary: 'Een pro-bow stick uit de Futurelab-lijn van Osaka met 40% carbon. Kan passen bij gevorderde spelers die een stick in de middenklasse zoeken.',
  strengths: {
    value: ['Pro bow met 40% carbon in de Futurelab-lijn van Osaka', 'Leverbaar in twee lengtes (36,5 en 37,5 inch)'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de gegevens in de productomschrijving van PassaHockey.',
    lastVerifiedAt: '2026-11-22',
  },
  pointsOfAttention: {
    value: ['Het niveau "gevorderd" is onze inschatting: PassaHockey noemt geen niveau', 'Gegevens uit de productomschrijving van PassaHockey; nog niet met de website van Osaka vergeleken (die was bij de controle niet bereikbaar)'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de gegevens in de productomschrijving van PassaHockey.',
    lastVerifiedAt: '2026-11-22',
  },
};
