import type { Product } from '../types';

/**
 * JDH X79 Low Bow Hook. Verrijkt uit de PassaHockey-import (merkpagina's
 * batch 1, 2026-11-22). Bron voor bow, carbon, gewicht, lengtes en prijs: de
 * officiële productpagina https://jdhsports.eu/product/x79-low-bow-hook (de
 * enige X79-low-bow-pagina op de site). Voorraad komt van de PassaHockey-feed;
 * de merkpagina meldt zelf "out of stock".
 *
 * bol.com: geen listing van precies dit model gevonden. "JDH X79TT low bow
 * hook" is een ander model (TT-uitvoering) en telt niet als koppeling.
 */
const CHECKED = '2026-11-22';
const BRAND_PAGE = 'https://jdhsports.eu/product/x79-low-bow-hook';
const PASSA_PAGE = 'https://www.passasports.nl/jdh-x79-lowbow-hook-x79lbhgn';

export const jdhX79LowbowHook: Product = {
  slug: 'jdh-x79-lowbow-hook-x79lbhgn',
  brand: 'JDH',
  name: 'JDH X79 Low Bow Hook',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  passaSportsProductUrl: PASSA_PAGE,
  imageAlt: 'JDH X79 Low Bow Hook hockeystick',
  imageUrl:
    'https://cdn.prod.website-files.com/66b360ec44fd182804809627/6894763dff5961dcd9c92626_X79LBHGN_grn_6%20.jpg',
  imageSourceUrl: BRAND_PAGE,
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel:
      'JDH noemt voor dit model geen niveau. Eigen inschatting op basis van het carbonpercentage (80%) en de prijs.',
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
      'De modelnaam van JDH is "X79 low bow hook". JDH noemt als vorm "Medium Curve, Hook Head (250 mm from the toe of the stick)"; de profielnaam komt uit de modelnaam.',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 80,
    source: 'brand-website',
    sourceLabel: 'JDH vermeldt "Carbon: 80%".',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  weightGrams: {
    value: 510,
    source: 'brand-website',
    sourceLabel: 'JDH vermeldt een gewichtsbereik van 505 tot 515 gram; hier het midden getoond.',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5, 38.5],
    source: 'brand-website',
    sourceLabel:
      'JDH noemt bij "Sizes" 36.5, 37.5 en 38.5 (de eenheid staat er niet bij; inch is hier aangenomen). Bij PassaHockey waren 36,5 en 37,5 leverbaar.',
    sourceUrl: BRAND_PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 250,
    source: 'brand-website',
    sourceLabel:
      'Prijs op de officiële JDH-website (€250,00). De pagina noemt dit niet een adviesprijs; de actuele winkelprijzen staan bij "Waar te koop".',
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
    'Een low-bow stick van JDH met 80% carbon en een hook head, hoger in het JDH-assortiment dan de X60. Kan passen bij ervaren spelers die een lage kromming en veel carbon zoeken.',
  strengths: {
    value: [
      'Low bow met 80% carbon: hoger in het assortiment dan de X60 (50%), onder de X93 (95%)',
      'Drie lengtematen op de JDH-pagina (36,5, 37,5 en 38,5)',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door JDH vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'JDH noemt geen niveau; het niveau "ervaren" is onze inschatting',
      'De hook head is een andere kopvorm dan bij de gewone X79 low bow; JDH legt het effect op de pagina niet uit',
      'De merkpagina meldt dit model als niet op voorraad; kijk bij de winkel naar de maat die leverbaar is',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de door JDH en de winkels vermelde gegevens.',
    lastVerifiedAt: CHECKED,
  },
};
