import { getCatalogProducts } from './index';
import { getFeedReadDates } from './feedDates';
import { getCatalogStats } from './stats';
import { RETAILERS } from '@/lib/retailers';

/**
 * The proof points the site shows (homepage, advice, Over ons; redesign
 * fase 4, 2026-11-03). Every number is counted from the catalog and the shop
 * feeds at build time, never typed in: no review counts, user numbers or
 * ratings we cannot show the source of (CLAUDE.md, GEO/SEO: no fake reviews).
 */
export type TrustFacts = {
  /** Field sticks the stickwijzer compares (the whole catalog incl. feed imports). */
  fieldSticks: number;
  brands: number;
  /** Partner shops with an approved programme (src/lib/retailers.ts). */
  shops: number;
  /** Sticks whose specs we checked by hand against the brand's own site. */
  checkedSticks: number;
  /** YYYY-MM-DD: the most recent day the shop feeds were read; null without feeds. */
  pricesReadOn: string | null;
};

export function getTrustFacts(now: Date = new Date()): TrustFacts {
  const stats = getCatalogStats(now);
  return {
    fieldSticks: stats.fieldSticks,
    brands: stats.brands.length,
    shops: Object.keys(RETAILERS).length,
    checkedSticks: getCatalogProducts().length,
    pricesReadOn: getFeedReadDates()?.to ?? null,
  };
}
