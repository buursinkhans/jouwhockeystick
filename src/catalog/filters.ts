import { z } from 'zod';
import { getOffers, lowestTotal } from './offers';
import { bowProfileSchema, experienceLevelSchema, type Brand, type Product } from './types';

/**
 * The catalog filters on /sticks and /zaalsticks (redesign fase 2,
 * 2026-11-03): a plain GET form, read on the server, so they work without
 * JavaScript and the canonical stays the unfiltered page. Unknown or
 * malformed values are ignored, never an error.
 */
export const BUDGET_STEPS = [50, 100, 150, 200, 300] as const;

const filterSchema = z.object({
  brand: z.string().optional(),
  niveau: experienceLevelSchema.optional().catch(undefined),
  bow: bowProfileSchema.optional().catch(undefined),
  // Whole and half inches (36,5" exists).
  lengte: z.coerce
    .number()
    .min(18)
    .max(39)
    .refine((n) => Number.isInteger(n * 2))
    .optional()
    .catch(undefined),
  budget: z.coerce
    .number()
    .refine((n) => (BUDGET_STEPS as readonly number[]).includes(n))
    .optional()
    .catch(undefined),
});

export type CatalogFilters = {
  brand?: Brand;
  niveau?: z.infer<typeof experienceLevelSchema>;
  bow?: z.infer<typeof bowProfileSchema>;
  lengte?: number;
  budget?: number;
};

export function parseCatalogFilters(
  params: Record<string, string | string[] | undefined>,
  brands: readonly Brand[],
): CatalogFilters {
  const first = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) || undefined;
  };
  const parsed = filterSchema.parse({
    brand: first('brand'),
    niveau: first('niveau'),
    bow: first('bow'),
    lengte: first('lengte'),
    budget: first('budget'),
  });
  const brand = brands.find((b) => b === parsed.brand);
  return {
    ...(brand && { brand }),
    ...(parsed.niveau && { niveau: parsed.niveau }),
    ...(parsed.bow && { bow: parsed.bow }),
    ...(parsed.lengte !== undefined && { lengte: parsed.lengte }),
    ...(parsed.budget !== undefined && { budget: parsed.budget }),
  };
}

export const hasFilters = (filters: CatalogFilters) => Object.keys(filters).length > 0;

/**
 * The price a visitor sees first: the lowest current shop total (fresh and
 * in stock), otherwise the indicative price. With a length filter, only
 * shops with that length count.
 */
export function shownPrice(product: Product, now: Date, length?: number): number {
  return lowestTotal(getOffers(product), { size: length ?? null, now }) ?? product.priceIndicativeEur.value;
}

export function applyCatalogFilters(products: readonly Product[], filters: CatalogFilters, now: Date): Product[] {
  return products.filter(
    (p) =>
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.niveau || p.experienceLevel.value === filters.niveau) &&
      (!filters.bow || p.bowProfile?.value === filters.bow) &&
      (filters.lengte === undefined || p.lengthsInches.value.includes(filters.lengte)) &&
      (filters.budget === undefined || shownPrice(p, now, filters.lengte) <= filters.budget),
  );
}

/** The query string of these filters, for links that keep them (paging). */
export function filterQuery(filters: CatalogFilters, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) params.set(key, String(value));
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  const query = params.toString();
  return query ? `?${query}` : '';
}
