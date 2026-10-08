import type { Product } from '../types';

// Specs from a bol.com listing (seller: Leerentveld Vrijetijd), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/brabo-o-geez-snowleopard-kinder-veld-hockeystick-315-25330-020-kleur-mintgroen-maat-28/9300000122374311/';
const CHECKED = '2026-10-05';

export const braboOgeezSnowleopardJunior: Product = {
  slug: 'brabo-ogeez-snowleopard-junior',
  brand: 'Brabo',
  name: "Brabo O'geez Snowleopard Kinder Veldhockeystick",
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/brabo-o-geez-snowleopard-kinder-veld-hockeystick-315-25330-020-kleur-mintgroen-maat-28/9300000122374311/',
  imageAlt: "Brabo O'geez Snowleopard Kinder Veldhockeystick hockeystick",
  // No imageUrl: the bol.com photo is a 550×42 strip that is unreadable as a thumbnail; the illustration is used instead.
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Geschikt voor type hockey: Veldhockey".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner" en "Doelgroep: Kinderen".',
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
    value: 'ultrabow',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Straight bow" met een kromming van 17 mm en een "Maxi"-kop; in onze indeling het rustigste profiel (standaard).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0%" en "Materiaal: Hout/Glasvezel".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [28],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 28".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 41.49,
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
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, donderdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten kinderstick van Brabo, versterkt met glasvezel, met een rechte, rustige kromming (17 mm) en een grote Maxi-kop.',
  strengths: {
    value: [
      'Rustig profiel en grote kop, wat doorgaans helpt bij leren aannemen en pushen',
      'Verkrijgbaar in 28 inch',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com, niet van Brabo zelf; geen modeljaar vermeld',
      'Alleen in 28" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
