import { z } from 'zod';

/**
 * Every verifiable product property is wrapped so it always carries a source,
 * an optional model year, and a last-verified date (source-policy.md §1).
 */
export const sourceTypeSchema = z.enum([
  'brand-website',
  'partner-shop',
  'fih-rules',
  'editorial-estimate',
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export function sourcedValueSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema,
    source: sourceTypeSchema,
    sourceLabel: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    modelYear: z.number().int().optional(),
    lastVerifiedAt: z.string(),
  });
}
export type SourcedValue<T> = {
  value: T;
  source: SourceType;
  sourceLabel?: string;
  sourceUrl?: string;
  modelYear?: number;
  lastVerifiedAt: string;
};

export const experienceLevelSchema = z.enum([
  'beginner',
  'gevorderd',
  'ervaren',
]);
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;

export const positionSchema = z.enum([
  'keeper',
  'verdediger',
  'middenvelder',
  'aanvaller',
]);
export type Position = z.infer<typeof positionSchema>;

export const bowProfileSchema = z.enum([
  'ultrabow',
  'midbow',
  'dynabow',
  'probow',
  'lowbow',
  'extreme_lowbow',
]);
export type BowProfile = z.infer<typeof bowProfileSchema>;

/** Field (veld) or indoor (zaal) hockey. */
export const disciplineSchema = z.enum(['veld', 'zaal']);
export type Discipline = z.infer<typeof disciplineSchema>;

export const stockStatusSchema = z.enum([
  'available',
  'limited',
  'unavailable',
]);
export type StockStatus = z.infer<typeof stockStatusSchema>;

export const brandSchema = z.enum([
  'Grays',
  'Brabo',
  'adidas',
  'JDH',
  'Princess',
  'Scoop',
  'The Indian Maharadja',
  'TK',
  'Osaka',
  'Stag',
  'Ritual',
]);
export type Brand = z.infer<typeof brandSchema>;

export const productSchema = z.object({
  slug: z.string(),
  brand: brandSchema,
  name: z.string(),
  /**
   * 'test-data' marks MVP mock products that have not come from a verified
   * brand or partner-shop feed. Distinct from the price-indicative notice.
   */
  dataStatus: z.enum(['test-data', 'verified']),
  imageAlt: z.string(),
  /** Direct URL to the product photo on the brand's own official product page — omitted falls back to an illustration. */
  imageUrl: z.string().url().optional(),
  imageSourceUrl: z.string().url().optional(),
  /**
   * Direct bol.com product page for shop links. Without it, shop links fall
   * back to a bol.com search for this model.
   */
  bolProductUrl: z
    .string()
    .url()
    .startsWith('https://www.bol.com/nl/nl/p/')
    .optional(),
  experienceLevel: sourcedValueSchema(experienceLevelSchema),
  recommendedPositions: sourcedValueSchema(z.array(positionSchema)),
  /** Optional — not every brand states a bow profile for every model; never guessed. */
  bowProfile: sourcedValueSchema(bowProfileSchema).optional(),
  /** Optional — not every brand publishes a carbon percentage; never guessed. */
  carbonPercentage: sourcedValueSchema(z.number().min(0).max(100)).optional(),
  /** Optional — not every brand publishes a weight. */
  weightGrams: sourcedValueSchema(z.number().positive()).optional(),
  /**
   * Optional for backwards compatibility: products without it are field
   * sticks. Indoor sticks always state it, sourced from the brand's own
   * indoor category.
   */
  discipline: sourcedValueSchema(disciplineSchema).optional(),
  lengthsInches: sourcedValueSchema(z.array(z.number())),
  priceIndicativeEur: sourcedValueSchema(z.number().positive()),
  stock: sourcedValueSchema(stockStatusSchema),
  summary: z.string(),
  /** Editorial pros/cons — always marked as our own assessment, never a hard spec (source-policy.md §2). */
  strengths: sourcedValueSchema(z.array(z.string()).min(1)),
  pointsOfAttention: sourcedValueSchema(z.array(z.string()).min(1)),
});
export type Product = z.infer<typeof productSchema>;
