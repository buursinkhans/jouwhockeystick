import type { Product } from '../types';

/**
 * JDH X60 Low Bow. Verrijkt uit de PassaHockey-import (merkpagina's batch 1,
 * 2026-11-22). Bron voor bow, carbon, gewicht, lengtes en prijs: de officiële
 * productpagina https://jdhsports.eu/product/x60-low-bow. Voorraad komt van de
 * PassaHockey-feed; de merkpagina meldt zelf "out of stock".
 */
const CHECKED = '2026-11-22';
const BRAND_PAGE = 'https://jdhsports.eu/product/x60-low-bow';
const PASSA_PAGE = 'https://www.passasports.nl/jdh-x60-lowbow-x60lbgn';

export const jdhX60Lowbow: Product = {
  slug: 'jdh-x60-lowbow-x60lbgn',
  brand: 'JDH',
  name: 'JDH X60 Low Bow',
  dataStatus: 'verified',
  // Listing "JDH X60 Low Bow 50% Carbon Hockeystick, size 36.5 inch"; de artikelcode staat niet in de zoekresultaten.
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/jdh-x60-low-bow-50-carbon-hockeystick-size-36-5-inch/9300000238147124/',
  passaSportsProductUrl: PASSA_PAGE,
  imageAlt: 'JDH X60 Low Bow hockeystick',
  imageUrl:
    'https://cdn.prod.website-files.com/66b360ec44fd182804809627/68948042067c93992430729f_X60LBGN_li-grn_6%20.jpg',
  imageSourceUrl: BRAND_PAGE,
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'JDH noemt voor dit model geen niveau. Eigen inschatting op basis van het carbonpercentage (50%) en de prijs.',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'JDH noemt geen specifieke veldpositie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'brand-website',
    sourceLabel:
      'De modelnaam van JDH is "X60 low bow". JDH noemt als vorm "Medium Curve (250 mm from the toe of the stick)"; de profielnaam komt uit de modelnaam.',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 50,
    source: 'brand-website',
    sourceLabel: 'JDH vermeldt "Carbon: 50%".',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  weightGrams: {
    value: 505,
    source: 'brand-website',
    sourceLabel: 'JDH vermeldt een gewichtsbereik van 500 tot 510 gram; hier het midden getoond.',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'brand-website',
    sourceLabel: 'JDH noemt bij "Sizes" 36.5 en 37.5 (de eenheid staat er niet bij; inch is hier aangenomen).',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 180,
    source: 'brand-website',
    sourceLabel:
      'Prijs op de officiële JDH-website (€180,00). De pagina noemt dit niet een adviesprijs; de actuele winkelprijzen staan bij "Waar te koop".',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Voorraad volgens de productfeed van PassaHockey op de controledatum. De JDH-website meldt dit model zelf als niet op voorraad.',
    sourceUrl: PASSA_PAGE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een low-bow stick van JDH met 50% carbon, in de middenklasse van het JDH-assortiment. Kan passen bij spelers die de lage kromming willen proberen zonder meteen het hoogste carbonpercentage te nemen.',
  strengths: {
    value: [
      'Low bow met 50% carbon: een middenpositie tussen de X01 (30%) en de X79 (80%) van JDH',
      'JDH noemt gewicht (500 tot 510 gram) en balanspunt (380 tot 390 mm) op de eigen pagina',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door JDH vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'JDH noemt geen niveau; het niveau "gevorderd" is onze inschatting',
      'Beperkt tot twee lengtematen (36,5 en 37,5 inch)',
      'De merkpagina meldt dit model als niet op voorraad; kijk bij de winkel naar de maat die leverbaar is',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door JDH en de winkels vermelde gegevens.',
    lastVerifiedAt: CHECKED,
  },
};
