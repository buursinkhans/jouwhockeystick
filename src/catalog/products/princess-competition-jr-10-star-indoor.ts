import type { Product } from '../types';

const SOURCE =
  'https://www.princess-hockey.com/products/330-66060-competition-jr-10-star-ind-sg9';
const CHECKED = '2026-10-05';

export const princessCompetitionJr10StarIndoor: Product = {
  slug: 'princess-competition-jr-10-star-indoor',
  brand: 'Princess',
  name: 'Princess Competition JR 10 STAR Indoor SG9-LB',
  dataStatus: 'verified',
  imageAlt: 'Princess Competition JR 10 STAR Indoor zaalhockeystick',
  imageUrl:
    'https://www.princess-hockey.com/cdn/shop/files/330.66060.000_1_aeb3e3c7-8c57-4227-8646-85843d68edc0.jpg?v=1779888669&width=1024',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'brand-website',
    sourceLabel:
      'Princess omschrijft dit model als "indoor stick" met een "sterke balans tussen balgevoel en performance in de zaal".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'editorial-estimate',
    sourceLabel:
      'Princess noemt geen niveau, wel een stick "voor spelers die op zoek zijn naar controle en speelcomfort". Met 15% carbon ingeschat als instap voor jeugdspelers. Princess vermeldt geen modeljaar.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Princess noemt geen specifieke positie voor dit juniormodel.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'brand-website',
    sourceLabel:
      'Princess vermeldt "SG9-LB (Low Bow)"; een curvemaat in mm staat er niet bij.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 15,
    source: 'brand-website',
    sourceLabel: 'Princess vermeldt "15% 3K Carbon".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [34, 35, 36],
    source: 'brand-website',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 79.99,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs zoals vermeld op de officiële Princess-website.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'editorial-estimate',
    sourceLabel: 'Geen live voorraadkoppeling — weergegeven als indicatie.',
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een junior zaalstick met 15% carbon die Princess richt op "controle en speelcomfort". Verkrijgbaar in de juniormaten 34" tot 36".',
  strengths: {
    value: [
      'Verkrijgbaar in juniormaten: 34", 35" en 36"',
      'Laag carbonpercentage (15%), wat doorgaans past bij een zacht, controlegericht gevoel',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Princess vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Low bow-profiel; een rustiger profiel kan voor jonge beginners prettiger zijn bij het pushen',
      'Princess vermeldt geen modeljaar en geen gewicht',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Princess vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
