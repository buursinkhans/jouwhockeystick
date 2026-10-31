import type { Shoe } from '../types';
import { BRABO_SHOES } from './brabo';
import { GRAYS_SHOES } from './grays';
import { MIZUNO_SHOES } from './mizuno';
import { OSAKA_SHOES } from './osaka';

/**
 * Hand-checked shoe models, with specs from the brand site and a source and
 * date per property (docs/source-policy.md, decision log 2026-10-31). What
 * the brand does not say stays unknown. ASICS, adidas, Nike and The Indian
 * Maharadja are missing: their sites could not be read (phase 1b, issue #100).
 */
export const CURATED_SHOES: readonly Shoe[] = [...GRAYS_SHOES, ...OSAKA_SHOES, ...BRABO_SHOES, ...MIZUNO_SHOES];
