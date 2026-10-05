import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; package weight is left
// out because it is not the weight of the stick.
const SOURCE =
  'https://www.bol.com/nl/nl/p/wdn-stick-junior-design-2-mid-bow-indoor-hockeystick-blue/9300000252690458/';
const CHECKED = '2026-10-05';

export const scoopWdnJuniorIndoor: Product = {
  slug: 'scoop-wdn-junior-indoor',
  brand: 'Scoop',
  name: 'Scoop WDN Zaalhockeystick Junior Mid Bow',
  dataStatus: 'verified',
  imageAlt: 'Scoop WDN Zaalhockeystick Junior Mid Bow',
  imageUrl: 'https://media.s-bol.com/m0P1j6DrDQ2O/4GLyKn/550x558.jpg',
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
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Niveau: Beginner", "Doelgroep: Kinderen" en noemt het de "ideale hockeystick voor de jongere generatie hockeyers".',
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
      'De listing vermeldt "Mid bow" met een "Maxi"-kop; een krommingsdiepte staat er niet bij.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0%" en "Materiaal: Hout, Kevlar".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [33, 34],
    source: 'partner-shop',
    sourceLabel: 'De listing (Design 2) toont 33" en 34" als leverbare maten.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 24.99,
    source: 'partner-shop',
    sourceLabel:
      'Richtprijs voor 33 inch zoals op bol.com getoond; 34 inch kostte €34,99.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten junior-zaalstick met mid bow en grote Maxi-kop, volgens de listing de "ideale hockeystick voor de jongere generatie hockeyers".',
  strengths: {
    value: [
      'Laagste prijs van alle zaalsticks in onze catalogus',
      'Houten stick zonder carbon met een grote kop, wat doorgaans helpt bij het leren aannemen en pushen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com; Scoop vermeldt geen modeljaar',
      'De prijs verschilt per lengte (33" €24,99, 34" €34,99)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
