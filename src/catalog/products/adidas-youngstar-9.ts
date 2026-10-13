import type { Product } from '../types';

// Specs from a bol.com listing, not from adidas' own site (adidas.nl blocks
// automated access). Values are copied as printed on the listing. The listing
// contradicts itself on the curve ("maximale kromming van 22mm" in the text,
// "Kromming: 24 mm" in the specs) and gives no bow profile in our terms
// ("Straight bow"), so bowProfile is left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-youngstar-9-hockeystick/9300000117484316/';
const CHECKED = '2026-10-13';

export const adidasYoungstar9: Product = {
  slug: 'adidas-youngstar-9',
  brand: 'adidas',
  name: 'adidas Youngstar .9 Hockeystick',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/adidas-youngstar-9-hockeystick/9300000117484316/',
  imageAlt: 'adidas Youngstar .9 hockeystick',
  imageUrl: 'https://media.s-bol.com/gX5mMZXGD1Aj/g5AEnr/415x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Geschikt voor type hockey: Veldhockey".',
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
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 0 %" (volledig hout).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [31],
    source: 'partner-shop',
    sourceLabel:
      'De listing toont 31 inch; de tekst noemt ook een Senior-variant zonder maten.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 27.45,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Op voorraad. Voor 22:00 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten adidas-veldstick voor beginnende kinderen, uit de collectie 2022-2023 volgens de listing.',
  strengths: {
    value: [
      'Volledig hout: kan passen bij beginners die balcontrole opbouwen',
      'Lage prijs voor een merkstick in onze catalogus',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 31 inch gevonden',
      'Oudere collectie (2022-2023) volgens de listing',
      'De listing noemt zowel 22 mm als 24 mm kromming; gegevens komen van bol.com, niet van adidas zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
