import type { Shoe } from '../types';
import { checkedShoe, fromBrand } from './source';

/**
 * Osaka hockey shoes, from osakaworld.com (product pages read 2026-10-31;
 * season tag "26-27"). The colour articles the feed import kept apart
 * (ftw00033 and ftw00044) are one model on the brand site.
 */
const KAI = 'https://osakaworld.com/products/osaka-footwear-kai-mk1-pro-tour-blue-topaz';
const FURO_COURT = 'https://osakaworld.com/products/furo-court-pineneedle';
const SIZES = ['35,5', '36', '36,5', '37,5', '38', '38,5', '39', '40', '40,5', '41', '42', '42,5', '43', '44', '44,5', '45', '45,5', '46', '47'];

export const OSAKA_SHOES: readonly Shoe[] = [
  checkedShoe({
    slug: 'osaka-kai-mk1-pro-tour',
    brand: 'Osaka',
    model: 'KAI Mk1 - Pro Tour',
    version: 'Mk1',
    category: fromBrand('veld' as const, KAI, '"From water-based hockey pitches to sand-based courts and everyday training surfaces"', 2026),
    ageGroup: 'senior',
    surfaceWater: fromBrand(
      'bevestigd' as const,
      KAI,
      '"From water-based hockey pitches to sand-based courts and everyday training surfaces, the Kai MK1 - Pro Tour delivers reliable traction"',
      2026,
    ),
    sizesAndWidths: fromBrand({ sizes: SIZES }, KAI, 'Maten in de productgegevens van Osaka (EU); geen breedtes genoemd.', 2026),
    support: fromBrand('the structured outer mesh delivers durability, support, and a bold, performance-driven look', KAI, 'Osaka, productpagina', 2026),
    durability: fromBrand('the structured outer mesh delivers durability', KAI, 'Osaka, productpagina', 2026),
    evidenceLimits: [
      'Zandveld: Osaka noemt "sand-based courts" (padelbanen), geen zandkunstgras voor hockey; daarom onbekend.',
      'Osaka noemt de schoen een all-purpose schoen, ook voor padel en training.',
      'Pasvorm, gewicht, uitneembare binnenzool, demping, bescherming en vochtbescherming: niet genoemd.',
    ],
  }),
  checkedShoe({
    slug: 'osaka-furo-court',
    brand: 'Osaka',
    model: 'Furo Court',
    category: fromBrand('zaal' as const, FURO_COURT, '"a next-generation indoor sports shoe … Built for smooth indoor surfaces"', 2026),
    ageGroup: 'senior',
    sizesAndWidths: fromBrand({ sizes: SIZES }, FURO_COURT, 'Maten in de productgegevens van Osaka (EU); geen breedtes genoemd.', 2026),
    support: fromBrand('Its lightweight yet durable construction enhances agility while providing the support needed for fast-paced indoor play.', FURO_COURT, 'Osaka, productpagina', 2026),
    protection: fromBrand('reinforced toe bumper', FURO_COURT, 'Osaka, productpagina', 2026),
    durability: fromBrand('long-lasting comfort and durability, even in high-abrasion environments', FURO_COURT, 'Osaka, productpagina', 2026),
    evidenceLimits: [
      'Non-marking: niet genoemd. Osaka noemt een "herringbone-structured outsole" voor binnenvloeren.',
      'Osaka noemt geen zaalhockey apart, wel indoorsporten in het algemeen.',
      'Pasvorm: Osaka noemt "a full spandex bootie for a custom, sock-like fit", maar niets over breedte.',
      'Gewicht, uitneembare binnenzool, demping en vochtbescherming: niet genoemd.',
    ],
  }),
];
