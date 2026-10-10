import type { Product } from '../types';

// Specs from the PassaSports product page, not from the brand's own site.
// bol.com does not sell this model (checked 2026-10-10); the PassaSports
// affiliate link is still being set up, so there is no shop button yet.
const SOURCE = 'https://www.passasports.nl/malik-lowbow-2-ma25101';
const CHECKED = '2026-10-10';

export const malikLowbow2: Product = {
  slug: 'malik-lowbow-2',
  brand: 'Malik',
  name: 'Malik LowBow 2',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  passaSportsProductUrl: 'https://www.passasports.nl/malik-lowbow-2-ma25101',
  imageAlt: 'Malik LowBow 2 hockeystick',
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaSports plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel:
      'PassaSports vermeldt geen niveau, wel "Stijfheid: Stug" en 75% carbon. Daarom ingeschat als stick voor ervaren spelers.',
    modelYear: 2025,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De productpagina noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  // bowProfile left out: PassaSports vermeldt zowel "Low Bow" als "Mid Bow"; omdat dat elkaar tegenspreekt, vullen we geen bow-profiel in.
  carbonPercentage: {
    value: 75,
    source: 'partner-shop',
    sourceLabel: 'PassaSports vermeldt "Percentage Carbon: 75%".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten die PassaSports op de controledatum als leverbaar toonde.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 219.95,
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
    'Een stugge veldstick van Malik met 75% carbon uit de collectie 2025/2026.',
  strengths: {
    value: [
      'Veel carbon voor een directe, krachtige stick',
      'Malik is een merk dat we nog niet in de catalogus hadden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Het bow-profiel is niet eenduidig vermeld',
      'Alleen bij PassaSports gevonden; nog geen bestelkoppeling',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
