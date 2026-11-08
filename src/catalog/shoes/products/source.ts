import type { SourcedValue } from '../../types';
import { SHOE_CONTENT_PROPERTIES, UNKNOWN, type Shoe } from '../types';
import { CURATED_SHOE_EANS } from './eans';

/** When the brand pages below were read. */
export const CHECKED_AT = '2026-10-31';

/**
 * A claim from the brand's own product page: the page, the brand's exact
 * words and the check date. Never a paraphrase that says more than the brand.
 */
export function fromBrand<T>(
  value: T,
  sourceUrl: string,
  quote: string,
  modelYear?: number,
): SourcedValue<T> {
  return {
    value,
    source: 'brand-website',
    sourceLabel: quote,
    sourceUrl,
    lastVerifiedAt: CHECKED_AT,
    ...(modelYear !== undefined && { modelYear }),
  };
}

/**
 * A claim from a partner shop's product text, for brands whose own site
 * cannot be read (owner's decision, decision log 2026-11-01). Shown as a shop
 * source, never as the brand's.
 */
export function fromShop<T>(value: T, sourceUrl: string, quote: string): SourcedValue<T> {
  return { value, source: 'partner-shop', sourceLabel: quote, sourceUrl, lastVerifiedAt: CHECKED_AT };
}

/** When the product photos were checked for the sole colour. */
export const PHOTO_CHECKED_AT = '2026-11-01';

/**
 * Non-marking as our own estimate from the product photos: a sole that is not
 * black counts as non-marking (owner's decision, decision log 2026-11-01).
 * Always shown as an estimate with a warning, never as the brand's claim.
 */
export function nonMarkingFromPhoto(soleColour: string, photoPage: string): SourcedValue<'bevestigd'> {
  return {
    value: 'bevestigd',
    source: 'editorial-estimate',
    sourceLabel: `Inschatting: de loopzool is ${soleColour} op de productfoto's van de winkel. Bij een zool die niet zwart is, gaan we uit van non-marking; merk en winkel bevestigen het niet.`,
    sourceUrl: photoPage,
    lastVerifiedAt: PHOTO_CHECKED_AT,
  };
}

type ContentKey = (typeof SHOE_CONTENT_PROPERTIES)[number];
type CheckedShoeInput = Omit<Shoe, ContentKey | 'sizesAndWidths' | 'eans' | 'feedImport' | 'id'> &
  Partial<Pick<Shoe, ContentKey | 'sizesAndWidths'>> & { slug: keyof typeof CURATED_SHOE_EANS };

/**
 * A hand-checked model: every property the brand does not mention stays
 * unknown, and the EANs come from the brand's product data (eans.ts).
 */
export function checkedShoe(input: CheckedShoeInput): Shoe {
  const unknowns = Object.fromEntries(SHOE_CONTENT_PROPERTIES.map((key) => [key, UNKNOWN])) as Pick<Shoe, ContentKey>;
  return { ...unknowns, sizesAndWidths: UNKNOWN, ...input, id: input.slug, eans: [...CURATED_SHOE_EANS[input.slug]] };
}
