import { sourceTypeSchema, type SourceType } from '../types';
import type { Shoe } from './types';

/**
 * How well a model's data is backed, shown on every model page (keuzemodel
 * §6 laag C, decision log 2026-11-01). Per model, before any advice: the
 * shoe advice in phase 3 adds the player's own answers.
 * - goede-onderbouwing: field or indoor confirmed, and the surface (field) or
 *   non-marking sole (indoor) confirmed by the brand or a shop. No fit data
 *   needed (owner's decision, 2026-11-01): the fit is always the player's
 *   own check, and still no fit guarantee.
 * - voorwaardelijk: checked by hand and field or indoor confirmed, but the
 *   surface or non-marking sole is unknown or only our estimate.
 * - onvoldoende-informatie: a feed model nobody checked, or field or indoor unknown.
 */
export type ShoeCertainty = 'goede-onderbouwing' | 'voorwaardelijk' | 'onvoldoende-informatie';

/** Confirmed by the brand or a shop; our own estimate (from a photo) does not count as confirmed. */
export const confirmedBySource = (claim: { value: unknown; source?: string }) =>
  claim.value === 'bevestigd' && claim.source !== undefined && claim.source !== 'editorial-estimate';

export function shoeCertainty(shoe: Shoe): ShoeCertainty {
  if (shoe.feedImport || shoe.category.value === 'onbekend') return 'onvoldoende-informatie';
  const playsOn =
    shoe.category.value === 'veld'
      ? confirmedBySource(shoe.surfaceWater) || confirmedBySource(shoe.surfaceSand)
      : confirmedBySource(shoe.indoorNonMarking);
  return playsOn ? 'goede-onderbouwing' : 'voorwaardelijk';
}

/**
 * The warning on an indoor shoe whose non-marking sole the brand or a shop
 * has not confirmed (owner's decision, 2026-11-01): our photo estimate, or unknown.
 */
export function nonMarkingStatus(shoe: Shoe): 'bevestigd' | 'inschatting' | 'onbekend' | null {
  if (shoe.category.value !== 'zaal') return null;
  if (confirmedBySource(shoe.indoorNonMarking)) return 'bevestigd';
  return shoe.indoorNonMarking.value === 'bevestigd' ? 'inschatting' : 'onbekend';
}

/** The newest check date of the model's sourced properties; null when nothing is sourced. */
export function lastChecked(shoe: Shoe): string | null {
  const dates = Object.values(shoe)
    .flatMap((value) =>
      value && typeof value === 'object' && 'lastVerifiedAt' in value && typeof value.lastVerifiedAt === 'string'
        ? [value.lastVerifiedAt]
        : [],
    )
    .sort();
  return dates.at(-1) ?? null;
}

/** The kinds of source behind the model's known properties. */
export function sourceKinds(shoe: Shoe): SourceType[] {
  const kinds = new Set<SourceType>();
  for (const value of Object.values(shoe)) {
    if (!value || typeof value !== 'object' || !('source' in value)) continue;
    const kind = sourceTypeSchema.safeParse(value.source);
    if (kind.success) kinds.add(kind.data);
  }
  return [...kinds].sort();
}
