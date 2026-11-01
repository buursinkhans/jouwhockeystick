import type { Shoe } from '../types';
import { BRABO_SHOES } from './brabo';
import { GRAYS_SHOES } from './grays';
import { MIZUNO_SHOES } from './mizuno';
import { OSAKA_SHOES } from './osaka';
import { SHOP_SOURCED_SHOES } from './shopSourced';

/**
 * Hand-checked shoe models, with a source and date per property
 * (docs/source-policy.md, decision log 2026-10-31 and 2026-11-01). Specs come
 * from the brand site; for brands whose site cannot be read, from the shop's
 * product text (shopSourced.ts, marked as a shop source). What the source
 * does not say stays unknown.
 */
export const CURATED_SHOES: readonly Shoe[] = [
  ...GRAYS_SHOES,
  ...OSAKA_SHOES,
  ...BRABO_SHOES,
  ...MIZUNO_SHOES,
  ...SHOP_SOURCED_SHOES,
];
