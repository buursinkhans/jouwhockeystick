import type { Product } from '../types';

// Specs from the brand page (The Indian Maharadja, season 2026-2027). The brand
// states no carbon percentage for this wooden stick; the 0% comes from the
// PassaHockey feed. bol.com was not reachable on the check date, so neither
// bolProductUrl nor bolNotSold is set.
const SOURCE =
  'https://www.indianmaharadja.com/indianmaharadja26-yuki-neonnight-wood.html';
const PASSA =
  'https://www.passasports.nl/indian-maharadja-yuki-neon-night-hout-junior-10261053';
const CHECKED = '2026-10-22';

export const indianMaharadjaYukiNeonNightHoutJunior: Product = {
  slug: 'indian-maharadja-yuki-neon-night-hout-junior-10261053',
  brand: 'The Indian Maharadja',
  name: 'Indian Maharadja Yuki Neon Night Hout Junior',
  dataStatus: 'verified',
  passaSportsProductUrl: PASSA,
  imageAlt: 'Indian Maharadja Yuki Neon Night houten juniorhockeystick',
  imageUrl:
    'https://www.indianmaharadja.com/media/catalog/product/cache/39c02c379c089de926df0e018adc8ab8/t/i/tim_10261053_2.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'De merkpagina vermeldt "suitable for field use".',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'brand-website',
    sourceLabel:
      'The Indian Maharadja richt deze stick op beginners en jonge spelers die de basis van hockey willen leren.',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'Het merk noemt geen positie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'midbow',
    source: 'brand-website',
    sourceLabel: 'De merkpagina noemt "junior mid bow" (20 mm kromming).',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'PassaHockey (PassaSports) vermeldt een carbonpercentage van 0%; het merk noemt zelf geen percentage (houten stick).',
    sourceUrl: PASSA,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
    source: 'brand-website',
    sourceLabel: 'Maten van 25 tot en met 34 inch volgens de merkpagina.',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 39.95,
    source: 'brand-website',
    sourceLabel:
      'Adviesprijs zoals vermeld op de officiële website van The Indian Maharadja. PassaHockey vraagt op de controledatum een andere prijs; controleer de actuele prijs bij de winkel.',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Voorraad volgens de productfeed van PassaHockey op de controledatum.',
    sourceUrl: PASSA,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een zwarte houten veldstick met junior mid bow voor jonge spelers die de basis leren. Kan passen bij een eerste stick, en is in 10 maten verkrijgbaar.',
  strengths: {
    value: [
      'Mid bow: een allround kromming die bij veel jonge spelers kan passen',
      'Door het merk bedoeld voor beginners: een logische richting als je net begint',
      'Veel maten (25 tot 34 inch), dus ook voor hele jonge spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door het merk vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Het carbonpercentage (0%) komt van PassaHockey, niet van het merk',
      'Een houten stick kan zwaarder aanvoelen dan een composietstick; dit is een eigen inschatting',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van het materiaal en de bron van het percentage.',
    lastVerifiedAt: CHECKED,
  },
};
