import { getAllBrands, getFieldProducts, getIndoorProducts } from './index';
import type { Brand } from './types';

/**
 * The counts the site shows (homepage, /merken), from the same lists the
 * catalog pages render: the whole catalog including the PassaHockey import.
 * Every page that names a number of sticks or brands uses this, so the
 * numbers always match /sticks, /zaalsticks and /merken.
 */
export type CatalogStats = {
  fieldSticks: number;
  indoorSticks: number;
  /** Brands with at least one field stick (the /sticks brand filter). */
  fieldBrands: Brand[];
  /** Brands with at least one stick, field or indoor (the /merken page). */
  brands: Brand[];
};

export function getCatalogStats(now: Date = new Date()): CatalogStats {
  const query = { includeImported: true };
  return {
    fieldSticks: getFieldProducts(now, query).length,
    indoorSticks: getIndoorProducts(now, query).length,
    fieldBrands: getAllBrands(now, 'veld', query),
    brands: getAllBrands(now, undefined, query),
  };
}
