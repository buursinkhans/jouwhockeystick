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

export const bowProfileSchema = z.enum(['low-bow', 'mid-bow', 'late-bow']);
export type BowProfile = z.infer<typeof bowProfileSchema>;

export const stockStatusSchema = z.enum(['available', 'limited', 'unavailable']);
export type StockStatus = z.infer<typeof stockStatusSchema>;

export const brandSchema = z.enum(['Grays', 'Brabo', 'adidas', 'JDH', 'Princess']);
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
  experienceLevel: sourcedValueSchema(experienceLevelSchema),
  recommendedPositions: sourcedValueSchema(z.array(positionSchema)),
  /** Optional — not every brand states a bow profile for every model; never guessed. */
  bowProfile: sourcedValueSchema(bowProfileSchema).optional(),
  /** Optional — not every brand publishes a carbon percentage; never guessed. */
  carbonPercentage: sourcedValueSchema(z.number().min(0).max(100)).optional(),
  /** Optional — not every brand publishes a weight. */
  weightGrams: sourcedValueSchema(z.number().positive()).optional(),
  lengthsInches: sourcedValueSchema(z.array(z.number())),
  priceIndicativeEur: sourcedValueSchema(z.number().positive()),
  stock: sourcedValueSchema(stockStatusSchema),
  summary: z.string(),
  /** Editorial pros/cons — always marked as our own assessment, never a hard spec (source-policy.md §2). */
  strengths: sourcedValueSchema(z.array(z.string()).min(1)),
  pointsOfAttention: sourcedValueSchema(z.array(z.string()).min(1)),
});
export type Product = z.infer<typeof productSchema>;
