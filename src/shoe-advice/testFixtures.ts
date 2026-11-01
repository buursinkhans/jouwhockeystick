import type { Offer } from '@/catalog/offers/sort';
import { SHOE_CONTENT_PROPERTIES, UNKNOWN, type Shoe, type ShoeListing } from '@/catalog/shoes/types';
import type { SourcedValue } from '@/catalog/types';
import type { ShoeAnswers } from './answers';
import type { ShoeCatalog } from './types';

/** Test data for the shoe advice rules: made-up models, never the real catalog's claims. */
export const NOW = new Date('2026-11-01T12:00:00Z');
const READ_AT = '2026-10-31';

export const brand = <T>(value: T, quote = 'Fabrikant, productpagina'): SourcedValue<T> => ({
  value,
  source: 'brand-website',
  sourceLabel: quote,
  sourceUrl: 'https://example.com/shoe',
  lastVerifiedAt: READ_AT,
});

type Extra = { priceEur?: number | null; sizesInStock?: string[]; sizes?: string[] };

/** A checked model with every property unknown unless given. */
export function testShoe(slug: string, overrides: Partial<Shoe> = {}): Shoe {
  const unknowns = Object.fromEntries(SHOE_CONTENT_PROPERTIES.map((key) => [key, UNKNOWN])) as Pick<Shoe, (typeof SHOE_CONTENT_PROPERTIES)[number]>;
  return {
    ...unknowns,
    id: slug,
    slug,
    brand: 'Testmerk',
    model: slug,
    category: brand('veld' as const),
    ageGroup: 'senior',
    sizesAndWidths: UNKNOWN,
    evidenceLimits: ['Testmodel.'],
    eans: [],
    ...overrides,
  };
}

/** A catalog of test shoes, each with one PassaHockey listing. */
export function testCatalog(entries: readonly (readonly [Shoe, Extra?])[]): ShoeCatalog {
  const extras = new Map(entries.map(([shoe, extra]) => [shoe.slug, extra ?? {}]));
  const listing = (shoe: Shoe): ShoeListing[] => {
    const extra = extras.get(shoe.slug) ?? {};
    const price = extra.priceEur === undefined ? 80 : extra.priceEur;
    if (price === null) return [];
    return [
      {
        shop: 'passasports',
        url: `https://www.passasports.nl/${shoe.slug}`,
        priceEur: price,
        inStock: true,
        sizes: extra.sizes ?? extra.sizesInStock ?? [],
        sizesInStock: extra.sizesInStock ?? [],
        colourPages: 1,
        readAt: READ_AT,
      },
    ];
  };
  return {
    shoes: entries.map(([shoe]) => shoe),
    listingsOf: listing,
    offersOf: (shoe): Offer[] =>
      listing(shoe).map((l) => ({ retailer: l.shop, productUrl: l.url, priceEur: l.priceEur, shippingEur: 0, inStock: l.inStock, readAt: l.readAt })),
  };
}

/** A complete set of answers for a field player; override what the test is about. */
export function fieldAnswers(overrides: Partial<ShoeAnswers> = {}): ShoeAnswers {
  return {
    purpose: 'veld',
    player: 'volwassene',
    surface: 'bijna-alleen-water',
    frequency: '2-3x',
    fitIssues: ['goed'],
    movements: ['allround'],
    budget: 'geen',
    allowAboveBudget: false,
    preferences: ['geen'],
    size: null,
    ...overrides,
  };
}
