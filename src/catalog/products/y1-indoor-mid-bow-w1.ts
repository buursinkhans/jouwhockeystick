import type { Product } from '../types';

// Specs from the PassaSports product page, not from the brand's own site.
// bol.com does not sell this model (checked 2026-10-10); the PassaSports
// affiliate link is still being set up, so there is no shop button yet.
const SOURCE = 'https://www.passasports.nl/y1-indoor-mid-bow-w1-st-inm-c-26';
const CHECKED = '2026-10-10';

export const y1IndoorMidBowW1: Product = {
  slug: 'y1-indoor-mid-bow-w1',
  brand: 'Y1',
  name: 'Y1 Indoor Mid Bow W1',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  passaSportsProductUrl:
    'https://www.passasports.nl/y1-indoor-mid-bow-w1-st-inm-c-26',
  imageAlt: 'Y1 Indoor Mid Bow W1 hockeystick',
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
      'PassaSports vermeldt geen niveau. Ingeschat als instapstick op basis van de mid bow en de prijs.',
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
  // carbonPercentage left out: PassaSports vermeldt geen carbonpercentage.
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel:
      'PassaSports toonde op de controledatum alleen 36,5 inch als leverbaar.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 79.95,
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
    'Een mid bow-zaalstick van Y1 voor volwassenen uit de collectie 2026/2027.',
  strengths: {
    value: [
      'Rustige mid bow voor de zaal',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Niveau en carbonpercentage niet vermeld',
      'Alleen bij PassaSports gevonden; nog geen bestelkoppeling',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
