import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/ac-aerocore-composite-hockey-sticks/products/ac700-dynabow-s-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-ac700-dynabow-s-hockeystick/9300000236708010/';
const CHECKED = '2026-10-13';

export const graysAc700DynabowS: Product = {
  slug: 'grays-ac700-dynabow-s',
  brand: 'Grays',
  name: 'Grays AC700 Dynabow-S',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays AC700 Dynabow-S hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAAD25Composite_20Sticks_20AC700_20Dynabow-S_20Black_20Blue_20Main.jpg?v=1744209275',
  imageSourceUrl: PAGE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'Grays plaatst dit model bij de composiet-veldhockeysticks.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // Also sold at PassaSports (checked 2026-10-16): second shop button.
  passaSportsProductUrl:
    'https://www.passasports.nl/grays-ac700-dynabow-s-23244',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt geen niveau ("for players striving for excellence"). Ingeschat als ervaren: de AC600 heet al "ideal for advanced gameplay", de AC700 zit daarboven.',
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
      'Grays plaatst dit model in de Dynabow-familie (Bow: 24.75 @ 250 mm, Vertex-kop, Dynabow-S-profiel "to suit all playing styles").',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel:
      'PassaHockey (PassaSports) vermeldt "Carbonpercentage: 70%"; Grays noemt zelf geen percentage. bol.com toont 0%, een standaardwaarde die niet klopt voor een composietstick; die gebruiken we niet.',
    sourceUrl: 'https://www.passasports.nl/grays-ac700-dynabow-s-23244',
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
    value: 250,
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Pertina).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een allround AeroCore-stick van Grays met schuimkern, voor alle speelstijlen.',
  strengths: {
    value: [
      'Allround Dynabow-S-profiel',
      'Schuimkern voor stabiliteit, volgens Grays',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Grays vermeldt het carbonpercentage zelf niet; het komt van PassaHockey',
      'Grays noemt geen niveau; dat is onze inschatting',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
