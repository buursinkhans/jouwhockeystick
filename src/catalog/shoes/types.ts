import { z } from 'zod';
import { sourcedValueSchema } from '../types';

/**
 * The hockey-shoe catalog (docs/spec/hockeyschoenen-keuzemodel.md §7). Kept
 * apart from the stick catalog: own types, own data, own advice rules later
 * (src/shoe-advice/). Reuses SourcedValue, so every known property carries a
 * source type, a label or URL and a check date, like a stick property.
 */

/** A property nobody has established: no source, and never a match (keuzemodel §2). */
export const unknownSchema = z.object({ value: z.literal('onbekend') }).strict();
export const UNKNOWN = { value: 'onbekend' } as const;
export type Unknown = typeof UNKNOWN;

/** A property that is either established, with its source, or unknown. */
export function claimSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.union([unknownSchema, sourcedValueSchema(valueSchema)]);
}

/**
 * Suitability for one playing surface. "ongeschikt" is a known conflict
 * (exclude); "onbekend" is no claim at all (keuzemodel §6, laag A).
 */
export const suitabilitySchema = z.enum(['bevestigd', 'ongeschikt', 'onbekend']);
export type Suitability = z.infer<typeof suitabilitySchema>;
const surfaceClaim = claimSchema(z.enum(['bevestigd', 'ongeschikt']));

/** Fit of one part of the foot: the sourced description plus a coded value. */
const fitClaim = claimSchema(
  z.object({
    code: z.enum(['smal', 'normaal', 'ruim']),
    /** What the source says, in its own words. */
    description: z.string().min(1),
  }),
);

/** An exact claim in the source's words (cushioning, support, …); no scores. */
const textClaim = claimSchema(z.string().min(1));

export const shoeCategorySchema = z.enum(['veld', 'zaal']);
export type ShoeCategory = z.infer<typeof shoeCategorySchema>;

export const shoeSchema = z.object({
  id: z.string().min(1),
  /** merk-model-versie, without a colour code; stable once published. */
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  brand: z.string().min(1),
  /** Model name without the brand, e.g. "Gel-Peake 3". */
  model: z.string().min(1),
  /** Cut or edition the shop or brand names, e.g. "Heren", "Dames". */
  variant: z.string().optional(),
  version: z.string().optional(),
  /**
   * Field or indoor, with its source. Unknown when no source says which:
   * a shop's general "hockeyschoenen" category is not a field claim.
   */
  category: claimSchema(shoeCategorySchema),
  ageGroup: z.enum(['junior', 'senior']),

  surfaceWater: surfaceClaim,
  surfaceSand: surfaceClaim,
  surfaceSemiWaterHybrid: surfaceClaim,
  indoorNonMarking: claimSchema(z.enum(['bevestigd', 'nee'])),

  fitForefoot: fitClaim,
  fitHeel: fitClaim,
  fitInstep: fitClaim,

  weight: claimSchema(
    z.object({
      grams: z.number().positive(),
      /** The shoe size the weight was measured in. */
      size: z.string().min(1),
      /** How it was measured, as the source says ("per schoen", "paar"). */
      method: z.string().min(1),
    }),
  ),
  sizesAndWidths: claimSchema(
    z.object({
      sizes: z.array(z.string().min(1)).min(1),
      widths: z.array(z.string().min(1)).optional(),
      sizeChartUrl: z.string().url().optional(),
    }),
  ),
  removableInsole: claimSchema(z.boolean()),
  cushioning: textClaim,
  support: textClaim,
  protection: textClaim,
  /** The exact claim: water-repellent is not waterproof. */
  moistureProtection: claimSchema(
    z.object({
      kind: z.enum(['waterafstotend', 'waterdicht', 'anders']),
      claim: z.string().min(1),
    }),
  ),
  durability: textClaim,

  /** What has explicitly not been established for this model. */
  evidenceLimits: z.array(z.string().min(1)),

  /** EAN/GTIN codes of all sizes and colours: the only automatic link between shops. */
  eans: z.array(z.string().regex(/^\d{8,14}$/)),
  passaSportsProductUrl: z.string().url().optional(),
  plutosportProductUrl: z.string().url().optional(),
  bolProductUrl: z.string().url().optional(),
  bolNotSold: z.boolean().optional(),
  /** Product photo from a shop feed; never a brand logo or other image. */
  imageUrl: z.string().url().optional(),

  /** Set on models generated from the shop feeds: noindex until enriched by hand. */
  feedImport: z
    .object({
      feeds: z.array(z.enum(['passahockey', 'plutosport'])).min(1),
      importedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .optional(),
});
export type Shoe = z.infer<typeof shoeSchema>;

/** The content properties a curated model fills from sources; all unknown after a feed import. */
export const SHOE_CONTENT_PROPERTIES = [
  'surfaceWater',
  'surfaceSand',
  'surfaceSemiWaterHybrid',
  'indoorNonMarking',
  'fitForefoot',
  'fitHeel',
  'fitInstep',
  'weight',
  'removableInsole',
  'cushioning',
  'support',
  'protection',
  'moistureProtection',
  'durability',
] as const satisfies readonly (keyof Shoe)[];

/** One shop's listing of a model, as read from its feed. */
export const shoeListingSchema = z.object({
  shop: z.enum(['passasports', 'plutosport']),
  /** The shop's page for the cheapest colour in stock (else the cheapest). */
  url: z.string().url(),
  /** Lowest feed price of that model at this shop, in stock if any. */
  priceEur: z.number().positive(),
  inStock: z.boolean(),
  /** Sizes the feed lists, and those it lists as in stock per size. */
  sizes: z.array(z.string()),
  sizesInStock: z.array(z.string()),
  /** Colour pages the shop has for this model. */
  colourPages: z.number().int().positive(),
  /** YYYY-MM-DD: when the feed was read. */
  readAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type ShoeListing = z.infer<typeof shoeListingSchema>;
