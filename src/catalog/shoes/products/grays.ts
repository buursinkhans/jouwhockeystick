import type { Shoe } from '../types';
import { checkedShoe, fromBrand } from './source';

/**
 * Grays hockey shoes, from grays-hockey.com (product pages read 2026-10-31).
 * Seasons from the brand's product tags. "All surfaces" or "all pitches"
 * without naming water or sand is not a surface claim: those stay unknown.
 */
const X10 = 'https://www.grays-hockey.com/products/aerocage-x10-shoe';
const X10_JR = 'https://www.grays-hockey.com/products/aerocage-x10-junior-shoe';
const RAID = 'https://www.grays-hockey.com/products/raid-shoe-white';
const STEALTH = 'https://www.grays-hockey.com/products/stealth-shoe-black';
const STEALTH_JR = 'https://www.grays-hockey.com/products/stealth-junior-shoe-black';

/** EU sizes of the senior models in the brand's product data (UK 6.5–13). */
const SENIOR_SIZES = ['40', '41', '41,5', '42', '42,5', '43', '44', '45', '45,5', '46', '46,5', '47', '48'];

/** The AeroCage X10 text is the same on the senior and junior page. */
function aeroCageX10(url: string, slug: 'grays-aerocage-x10' | 'grays-aerocage-x10-junior', sizes: string[]): Shoe {
  return checkedShoe({
    slug,
    brand: 'Grays',
    model: slug === 'grays-aerocage-x10' ? 'AeroCage X10' : 'AeroCage X10 Junior',
    version: 'X10',
    category: fromBrand('veld' as const, url, '"these hockey shoes give you a decisive edge every time you step on the pitch"', 2026),
    ageGroup: slug === 'grays-aerocage-x10' ? 'senior' : 'junior',
    surfaceWater: fromBrand('bevestigd' as const, url, '"rock-solid stability on both water- and sand-based turfs"', 2026),
    surfaceSand: fromBrand('bevestigd' as const, url, '"rock-solid stability on both water- and sand-based turfs"', 2026),
    sizesAndWidths: fromBrand({ sizes }, url, 'Maten in de productgegevens van Grays (EU); geen breedtes genoemd.', 2026),
    cushioning: fromBrand('Genius Foam Midsole for responsive cushioning and energy return', url, 'Grays, productpagina', 2026),
    support: fromBrand('Ultra-lightweight upper with supportive performance structure', url, 'Grays, productpagina', 2026),
    evidenceLimits: [
      'Pasvorm: Grays noemt een "COMFORT FIT PLUS last … for an exceptional fit", maar niets over de breedte van voorvoet, hiel of wreef.',
      'Gewicht, uitneembare binnenzool, bescherming, vochtbescherming en slijtvastheid: niet genoemd.',
      'Semi-waterveld of hybride velden: niet genoemd.',
    ],
  });
}

export const GRAYS_SHOES: readonly Shoe[] = [
  aeroCageX10(X10, 'grays-aerocage-x10', SENIOR_SIZES),
  aeroCageX10(X10_JR, 'grays-aerocage-x10-junior', ['36', '37', '37,5', '38', '39', '39,5']),
  checkedShoe({
    slug: 'grays-raid-2-0',
    brand: 'Grays',
    model: 'Raid 2.0',
    version: '2.0',
    category: fromBrand('veld' as const, RAID, '"a superior grip outsole tailored specifically for dynamic hockey play"', 2025),
    ageGroup: 'senior',
    sizesAndWidths: fromBrand({ sizes: SENIOR_SIZES }, RAID, 'Maten in de productgegevens van Grays (EU); geen breedtes genoemd.', 2025),
    cushioning: fromBrand('EVA Midsole: Energy-efficient cushioning for optimal speed.', RAID, 'Grays, productpagina', 2025),
    support: fromBrand('Welded CAGE Upper: Advanced stability and breathability.', RAID, 'Grays, productpagina', 2025),
    moistureProtection: fromBrand({ kind: 'waterdicht' as const, claim: 'a lightweight waterproof upper … Ripstop WP Fabric' }, RAID, 'Grays, productpagina', 2025),
    durability: fromBrand('AGS Outsole: Enhanced grip and durability for all pitches.', RAID, 'Grays, productpagina', 2025),
    evidenceLimits: [
      'Ondergrond: Grays noemt "stability and traction on all surfaces" en "all pitches", maar niet water- of zandkunstgras apart; daarom onbekend.',
      'Pasvorm, gewicht, uitneembare binnenzool en bescherming: niet genoemd.',
      'Waterdicht volgens de fabrikant; niet door ons getest.',
    ],
  }),
  ...(['grays-stealth', 'grays-stealth-junior'] as const).map((slug) => {
    const url = slug === 'grays-stealth' ? STEALTH : STEALTH_JR;
    return checkedShoe({
      slug,
      brand: 'Grays',
      model: slug === 'grays-stealth' ? 'Stealth' : 'Stealth Junior',
      category: fromBrand('veld' as const, url, '"a lightweight hockey shoe with a high-performance rubber outsole"', 2024),
      ageGroup: slug === 'grays-stealth' ? 'senior' : 'junior',
      sizesAndWidths: fromBrand(
        { sizes: slug === 'grays-stealth' ? SENIOR_SIZES : ['35', '35,5', '36', '36,5', '37', '37,5', '38', '39', '39,5'] },
        url,
        'Maten in de productgegevens van Grays (EU); geen breedtes genoemd.',
        2024,
      ),
      cushioning: fromBrand('the EVA Performance Midsole offers superior comfort and responsiveness, complemented by a memory foam footbed', url, 'Grays, productpagina', 2024),
      support: fromBrand('a welded cradle for enhanced foot support and stability … the Superior Heel Fit (SHF) technology reduces lateral movement offering a secure fit', url, 'Grays, productpagina', 2024),
      moistureProtection: fromBrand({ kind: 'waterafstotend' as const, claim: 'The high-grade water-repellent PU vamp' }, url, 'Grays, productpagina', 2024),
      evidenceLimits: [
        'Ondergrond: Grays noemt "performs on all playing surfaces" en "exceptional grip on synthetic surfaces", maar niet water- of zandkunstgras apart; daarom onbekend.',
        'Pasvorm: Grays noemt "Superior Heel Fit", maar niets over de breedte van voorvoet, hiel of wreef.',
        'Waterafstotend is niet waterdicht. Gewicht, uitneembare binnenzool, bescherming en slijtvastheid: niet genoemd.',
      ],
    });
  }),
];
