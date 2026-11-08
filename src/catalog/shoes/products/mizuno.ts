import type { Shoe } from '../types';
import { checkedShoe, fromBrand } from './source';

/**
 * Mizuno hockey shoes, from emea.mizuno.com (product pages read 2026-10-31).
 * Mizuno gives a weight without the shoe size it was weighed in, so the
 * weight stays unknown (the model needs the size, keuzemodel §7).
 */
const LYNX = 'https://emea.mizuno.com/eu/en/wave-lynx-3/X1GA263080.html';
const LYNX_JR = 'https://emea.mizuno.com/eu/fr-be/wave-lynx-3-jr./X1GC263083.html';

export const MIZUNO_SHOES: readonly Shoe[] = [
  checkedShoe({
    slug: 'mizuno-wave-lynx-3',
    brand: 'Mizuno',
    model: 'Wave Lynx 3',
    version: '3',
    category: fromBrand('veld' as const, LYNX, '"these field hockey shoes support your every move"'),
    ageGroup: 'senior',
    cushioning: fromBrand('Made with a midsole designed for amazing cushioning and stability.', LYNX, 'Mizuno, productpagina'),
    support: fromBrand('Equipped with a MIZUNO WAVE structure that balances cushioning and stability.', LYNX, 'Mizuno, productpagina'),
    durability: fromBrand('The artificial leather and mesh upper structure pursues stability and durability.', LYNX, 'Mizuno, productpagina'),
    evidenceLimits: [
      'Ondergrond: Mizuno noemt veldhockey en "excellent grip in all directions", maar geen water- of zandkunstgras; daarom onbekend.',
      'Gewicht: Mizuno noemt 340 g, maar niet bij welke maat; daarom onbekend.',
      'Pasvorm: Mizuno noemt "The updated heel structure provides an even more comfortable fit", maar niets over breedte.',
      'Maten, uitneembare binnenzool, bescherming en vochtbescherming: niet genoemd.',
    ],
  }),
  checkedShoe({
    slug: 'mizuno-wave-lynx-3-junior',
    brand: 'Mizuno',
    model: 'Wave Lynx 3 Jr.',
    version: '3',
    category: fromBrand('veld' as const, LYNX_JR, '"these field hockey shoes support your every move"; categorie "Junior Hockey"'),
    ageGroup: 'junior',
    sizesAndWidths: fromBrand(
      { sizes: ['31', '32,5', '33', '34', '35', '36', '36,5', '37', '38', '38,5', '39', '40', '40,5'] },
      LYNX_JR,
      'Maten op de productpagina van Mizuno (EU); geen breedtes genoemd.',
    ),
    cushioning: fromBrand("Dotée d'une semelle intermédiaire conçue pour offrir un amorti et une stabilité exceptionnels.", LYNX_JR, 'Mizuno, productpagina (Frans)'),
    support: fromBrand("Équipée d'une structure MIZUNO WAVE qui allie amorti et stabilité.", LYNX_JR, 'Mizuno, productpagina (Frans)'),
    durability: fromBrand('La structure de la tige, en cuir synthétique et en mesh, est conçue pour offrir stabilité et résistance.', LYNX_JR, 'Mizuno, productpagina (Frans)'),
    evidenceLimits: [
      'Ondergrond: Mizuno noemt veldhockey, maar geen water- of zandkunstgras; daarom onbekend.',
      'Gewicht: Mizuno noemt 275 g, maar niet bij welke maat; daarom onbekend.',
      'Pasvorm: Mizuno noemt een vernieuwde hiel voor een comfortabeler pasvorm, maar niets over breedte.',
      'Uitneembare binnenzool, bescherming en vochtbescherming: niet genoemd.',
    ],
  }),
];
