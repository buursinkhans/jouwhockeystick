import type { Product } from '../types';

// Specs from a bol.com listing (seller: ekwip), not from the brand's own
// site. Values are copied as printed on the listing; package weight is left
// out because it is not the weight of the stick.
const SOURCE =
  'https://www.bol.com/nl/nl/p/tk-3-control-bow-sky-silver-junior-zaalhockeystick/9300000167728587/';
const CHECKED = '2026-10-05';

export const tk3ControlBowJuniorIndoor: Product = {
  slug: 'tk-3-control-bow-junior-indoor',
  brand: 'TK',
  name: 'TK 3 Control Bow Junior Zaalhockeystick',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/tk-3-control-bow-sky-silver-junior-zaalhockeystick/9300000167728587/',
  imageAlt: 'TK 3 Control Bow Junior Zaalhockeystick',
  imageUrl: 'https://media.s-bol.com/gNk3przxxgXj/V8Jrq9/550x550.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Geschikt voor type hockey: Zaalhockey".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Niveau: Gevorderde" en "Doelgroep: Kinderen".',
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
    sourceLabel:
      'De listing vermeldt "Mid bow" met een kromming van 24 mm en een "Maxi"-kop.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 5,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 5%" en "Materiaal: Composiet".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [32],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 32".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 51.99,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs zoals op bol.com getoond op de controledatum (geen adviesprijs van het merk).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Uiterlijk 12 oktober in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een composiet junior-zaalstick met 5% carbon en mid bow (24 mm). De listing richt hem op gevorderde jeugdspelers.',
  strengths: {
    value: [
      'Junior-zaalstick in composiet met weinig carbon (5%)',
      'Grote Maxi-kop, wat doorgaans helpt bij aannemen en pushen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld',
      'Alleen in 32" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
