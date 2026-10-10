import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/csign-sports-hockeystick-senior-20-carbon-10-twaron-70-fiberglass-mid-bow-22-mm/9300000008476369/';
const CHECKED = '2026-10-10';

export const csign20CarbonMidBow: Product = {
  slug: 'csign-20-carbon-mid-bow',
  brand: 'Csign',
  name: 'Csign Sports Senior 20% Carbon Mid Bow',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/csign-sports-hockeystick-senior-20-carbon-10-twaron-70-fiberglass-mid-bow-22-mm/9300000008476369/',
  imageAlt: 'Csign Sports Senior 20% Carbon Mid Bow hockeystick',
  imageUrl: 'https://media.s-bol.com/qQ3RZyrqnjY0/550x503.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Gevorderde" en "Doelgroep: Volwassenen".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Mid bow" met een kromming van 22 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 20,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 20 %" (samenstelling volgens de titel: 20% carbon, 10% twaron, 70% fiberglass).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 49.99,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com op de controledatum (36,5 en 37,5 inch).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, maandag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een betaalbare veldstick voor volwassenen met 20% carbon en een mid bow van 22 mm.',
  strengths: {
    value: [
      'Mid bow met weinig carbon voor rond de €50',
      'Samenstelling staat letterlijk in de productnaam',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een listing op bol.com; geen officiële merksite gevonden',
      'Een andere 36,5-inchlisting van dezelfde stick was niet leverbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
