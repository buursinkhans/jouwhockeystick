import type { Product } from '../types';

// Specs from the PassaSports product page, not from the brand's own site.
// bol.com does not sell this model (checked 2026-10-10); the PassaSports
// affiliate link is still being set up, so there is no shop button yet.
const SOURCE =
  'https://www.passasports.nl/osaka-midbow-hout-indoor-junior-stk00398-hotpink';
const CHECKED = '2026-10-10';

export const osakaMidbowHoutIndoorJunior: Product = {
  slug: 'osaka-midbow-hout-indoor-junior',
  brand: 'Osaka',
  name: 'Osaka Midbow Hout Indoor Junior',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  passaSportsProductUrl:
    'https://www.passasports.nl/osaka-midbow-hout-indoor-junior-stk00398-hotpink',
  imageAlt: 'Osaka Midbow Hout Indoor Junior hockeystick',
  imageUrl: 'https://cdn.sportshop.com/catalog/product/600/600/3/9/397730_1.jpg',
  imageSourceUrl: 'https://www.passasports.nl/osaka-midbow-hout-indoor-junior-stk00398-hotpink',
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'PassaSports plaatst deze stick bij zaalhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'editorial-estimate',
    sourceLabel:
      'PassaSports vermeldt geen niveau. Ingeschat als instapstick: houten junior-zaalstick met mid bow.',
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De productpagina noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel: 'PassaSports vermeldt "Type Kromming: Mid Bow".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  // carbonPercentage left out: PassaSports vermeldt geen carbonpercentage (de beschrijving spreekt van "geen specifiek carbonpercentage").
  lengthsInches: {
    value: [28, 30, 32, 34],
    source: 'partner-shop',
    sourceLabel:
      'Maten die PassaSports op de controledatum als leverbaar toonde.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 39.95,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs bij PassaSports op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'PassaSports toonde op de controledatum leverbare maten ("Vandaag besteld, maandag in huis").',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten junior-zaalstick van Osaka met mid bow, van 28 tot 34 inch.',
  strengths: {
    value: [
      'Betaalbare zaalstick voor kinderen in veel maten',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De productomschrijving op PassaSports beschrijft een ander model; we gebruiken alleen de kenmerkentabel',
      'Niet bij bol.com te koop, wel bij PassaHockey',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
