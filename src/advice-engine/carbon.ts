import type { StickFeel } from './types';

export const SOFT_MAX_CARBON = 30;
export const DIRECT_MIN_CARBON = 70;
/** "Circa 85% carbon of meer" — the spec's threshold for direct/power sticks. */
export const HIGH_CARBON = 85;

/**
 * Editorial rule of thumb for how stiff a stick feels. Carbon percentage is
 * a rough indication only, never a quality ranking (spec §8.1).
 */
export function feelFromCarbon(carbon: number | undefined): StickFeel | null {
  if (carbon === undefined) {
    return null;
  }
  if (carbon <= SOFT_MAX_CARBON) {
    return 'soft';
  }
  return carbon >= DIRECT_MIN_CARBON ? 'direct' : 'balanced';
}
