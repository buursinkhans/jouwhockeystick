import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/db-dynabow-composite-hockey-sticks/products/db6-composite-hockey-stick-blue';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-dynabow-6-hockeystick/9300000233640917/';
const CHECKED = '2026-10-13';

export const graysDb6Composite: Product = {
  slug: 'grays-db6-composite',
  brand: 'Grays',
  name: 'Grays DB 6 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  passaSportsProductUrl: 'https://www.passasports.nl/grays-dynabow-6-23273',
  imageAlt: 'Grays DB 6 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HABG25Composite_20Sticks_20DB6_20Dynabow_20MC_20Black_20Blue_20Main.jpg?v=1744213236',
  imageSourceUrl: PAGE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'Grays plaatst dit model bij de composiet-veldhockeysticks.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'Ingeschat als gevorderd. De productpagina van Grays bevat tekst van een ander model (de PB7), daarom nemen we de niveauomschrijving daar niet over. De DB 6 is het instapmodel van de composiet-Dynabowlijn.',
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'dynabow',
    source: 'brand-website',
    sourceLabel:
      'Grays plaatst dit model in de Dynabow-familie (Dynabow-lijn volgens de collectie van Grays).',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 40,
    source: 'partner-shop',
    sourceLabel:
      'PassaHockey (PassaSports) vermeldt "Carbonpercentage: 40%"; Grays noemt zelf geen percentage. bol.com toont 0%, een standaardwaarde die niet klopt voor een composietstick; die gebruiken we niet.',
    sourceUrl: 'https://www.passasports.nl/grays-dynabow-6-23273',
    lastVerifiedAt: '2026-10-19',
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'brand-website',
    sourceLabel: 'Maten die Grays op de productpagina aanbiedt.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 125,
    source: 'brand-website',
    sourceLabel:
      'Adviesprijs van Grays op de controledatum; bij bol.com kan de prijs afwijken.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Leverbaar bij bol.com op de controledatum (verkoper: E-Markt).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'De instap in de Dynabow-lijn van Grays: een allround stick voor spelers die doorgroeien.',
  strengths: {
    value: [
      'Allround Dynabow-profiel voor een middenprijs',
      'Ook in 37,5 inch',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Grays vermeldt het carbonpercentage zelf niet; het komt van PassaHockey',
      'De productpagina van Grays bevat tekst van een ander model',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
