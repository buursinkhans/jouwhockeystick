import type { Product } from '../types';

// Specs from the PassaSports product page, not from the brand's own site.
// bol.com does not sell this model (checked 2026-10-10); the PassaSports
// affiliate link is still being set up, so there is no shop button yet.
const SOURCE = 'https://www.passasports.nl/malik-lowbow-4-junior-ma25103';
const CHECKED = '2026-10-10';

export const malikLowbow4Junior: Product = {
  slug: 'malik-lowbow-4-junior',
  brand: 'Malik',
  name: 'Malik LowBow 4 Junior',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  imageAlt: 'Malik LowBow 4 Junior hockeystick',
  imageUrl: 'https://cdn.sportshop.com/catalog/product/600/600/2/1/210877_1.jpg',
  imageSourceUrl: 'https://www.passasports.nl/malik-lowbow-4-junior-ma25103',
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'PassaSports plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'PassaSports vermeldt geen niveau, wel "Stijfheid: Soepel, Allround" en 30% carbon. Ingeschat als stick voor jeugdspelers die de basis beheersen.',
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
    value: 30,
    source: 'partner-shop',
    sourceLabel: 'PassaSports vermeldt "Percentage Carbon: 30%".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [35, 36.5, 37.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten die PassaSports op de controledatum als leverbaar toonde.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 129.95,
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
    'Een veldstick van Malik met 30% carbon, als junior aangeboden maar ook in seniormaten.',
  strengths: {
    value: [
      'Soepel tot allround volgens PassaSports',
      'Zowel in 35 inch als in seniormaten',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Het bow-profiel is niet eenduidig vermeld',
      'Niet bij bol.com te koop, wel bij PassaHockey',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
