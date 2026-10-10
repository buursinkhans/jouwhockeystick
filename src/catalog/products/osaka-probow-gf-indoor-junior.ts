import type { Product } from '../types';

// Specs from the PassaSports product page, not from the brand's own site.
// bol.com does not sell this model (checked 2026-10-10); the PassaSports
// affiliate link is still being set up, so there is no shop button yet.
const SOURCE =
  'https://www.passasports.nl/osaka-probow-gf-indoor-junior-stk00394-hotpink';
const CHECKED = '2026-10-10';

export const osakaProbowGfIndoorJunior: Product = {
  slug: 'osaka-probow-gf-indoor-junior',
  brand: 'Osaka',
  name: 'Osaka Probow GF Indoor Junior',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  passaSportsProductUrl:
    'https://www.passasports.nl/osaka-probow-gf-indoor-junior-stk00394-hotpink',
  imageAlt: 'Osaka Probow GF Indoor Junior hockeystick',
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'PassaSports plaatst deze stick bij zaalhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'PassaSports vermeldt geen niveau. Ingeschat als gevorderd op basis van de pro bow en de prijs.',
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
    value: 'probow',
    source: 'partner-shop',
    sourceLabel:
      'PassaSports vermeldt "Type Kromming: Pro Bow", met het hoogste punt van de kromming op 25 cm van de krul.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De productomschrijving van PassaSports zegt dat de stick "zonder carbon" is gemaakt.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [34, 35],
    source: 'partner-shop',
    sourceLabel:
      'Maten die PassaSports op de controledatum als leverbaar toonde.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 84.95,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs bij PassaSports op de controledatum (adviesprijs €94,95).',
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
    'Een junior-zaalstick van Osaka met pro bow en zonder carbon, in 34 en 35 inch.',
  strengths: {
    value: [
      'Pro bow voor jeugdspelers die in de zaal technischer willen spelen',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 34 en 35 inch',
      'Alleen bij PassaSports gevonden; nog geen bestelkoppeling',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
