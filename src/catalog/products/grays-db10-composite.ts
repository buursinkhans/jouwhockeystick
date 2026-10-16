import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/db-dynabow-composite-hockey-sticks/products/db10-composite-hockey-stick-red';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-db-10-senior-hockeystick-rood/9300000304766041/';
const CHECKED = '2026-10-13';

export const graysDb10Composite: Product = {
  slug: 'grays-db10-composite',
  brand: 'Grays',
  name: 'Grays DB 10 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays DB 10 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/2705063DB10DynabowHockeyStickRed_Silver.jpg?v=1779969275',
  imageSourceUrl: PAGE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'Grays plaatst dit model bij de composiet-veldhockeysticks.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // Also sold at PassaSports (checked 2026-10-16): second shop button.
  passaSportsProductUrl: 'https://www.passasports.nl/grays-db-10-27050',
  experienceLevel: {
    value: 'ervaren',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt de DB 10 "preferred by top international players", met de hoogste power-rating en "elite control".',
    sourceUrl: PAGE,
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
      'Grays plaatst dit model in de Dynabow-familie (Bow: 24.75 @ 250 mm, Micro-kop, "mid-intensity bow").',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // carbonPercentage left out: Een winkel noemt 95% voor de zwart/blauwe uitvoering, bol.com 100% voor de rode; die waarden verschillen en gaan over verschillende uitvoeringen. Daarom niet ingevuld.
  lengthsInches: {
    value: [36.5, 37.5, 38.5],
    source: 'brand-website',
    sourceLabel: 'Maten die Grays op de productpagina aanbiedt.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 350,
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Sporthuis.nl).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Het topmodel van de Dynabow-lijn, volgens Grays de keuze van internationals: allround, met veel power en controle.',
  strengths: {
    value: [
      'Topmodel van de allround Dynabow-lijn',
      'Ook in 38,5 inch voor lange spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Stijf en duur: echt voor ervaren spelers',
      'Exact carbonpercentage niet eenduidig',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
