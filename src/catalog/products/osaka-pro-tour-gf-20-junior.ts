import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/osaka-pro-tour-gf-2-0-junior-hockeystick/9300000159549923/';
const CHECKED = '2026-10-05';

export const osakaProTourGf20Junior: Product = {
  slug: 'osaka-pro-tour-gf-20-junior',
  brand: 'Osaka',
  name: 'Osaka Pro Tour GF 2.0 Junior Veldhockeystick',
  dataStatus: 'verified',
  imageAlt: 'Osaka Pro Tour GF 2.0 Junior Veldhockeystick hockeystick',
  imageUrl: 'https://media.s-bol.com/Zj7YR0Ky7XP2/Mw4NPLB/252x840.jpg',
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
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Mid bow" met een kromming van 24 mm en een "Maxi"-kop.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  // No carbonPercentage: De listing vermeldt "Materiaal: Carbon" én "Percentage carbon: 0%"; omdat die elkaar tegenspreken, vullen we geen percentage in.
  lengthsInches: {
    value: [32, 34, 35],
    source: 'partner-shop',
    sourceLabel:
      'Leverbare maten in de listing; 36,5" en 37,5" waren niet leverbaar.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 81.9,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 35 inch op de controledatum (34" kostte €83,00).',
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
    'Een junior-veldstick van Osaka met mid bow en een grote Maxi-kop, op bol.com in 32" tot 35".',
  strengths: {
    value: [
      'Verkrijgbaar in 32", 34" en 35"',
      'Mid bow met grote kop, een allround profiel voor jeugdspelers',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing spreekt zichzelf tegen over het materiaal (carbon of niet)',
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
