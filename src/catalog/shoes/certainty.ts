import { sourceTypeSchema, type SourceType } from '../types';
import type { Shoe } from './types';

/**
 * How well a model's data is backed, shown on every model page (keuzemodel
 * §6 laag C, decision log 2026-11-01). Per model, before any advice: the
 * shoe advice in phase 3 adds the player's own answers.
 * - goede-onderbouwing: field or indoor confirmed, the surface (field) or
 *   non-marking (indoor) confirmed, and the fit of at least one part of the
 *   foot described by a source. Still no fit guarantee.
 * - voorwaardelijk: checked by hand and field or indoor confirmed, but
 *   surface, non-marking or fit must still be checked.
 * - onvoldoende-informatie: a feed model nobody checked, or field or indoor unknown.
 */
export type ShoeCertainty = 'goede-onderbouwing' | 'voorwaardelijk' | 'onvoldoende-informatie';

export function shoeCertainty(shoe: Shoe): ShoeCertainty {
  if (shoe.feedImport || shoe.category.value === 'onbekend') return 'onvoldoende-informatie';
  const playsOn =
    shoe.category.value === 'veld'
      ? shoe.surfaceWater.value === 'bevestigd' || shoe.surfaceSand.value === 'bevestigd'
      : shoe.indoorNonMarking.value === 'bevestigd';
  const fit = [shoe.fitForefoot, shoe.fitHeel, shoe.fitInstep].some((part) => part.value !== 'onbekend');
  return playsOn && fit ? 'goede-onderbouwing' : 'voorwaardelijk';
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
