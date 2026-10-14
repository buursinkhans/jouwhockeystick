import {
  RECHECK_AFTER_MONTHS,
  addMonths,
  sourcedFields,
  toIsoDate,
} from './health';
import type { Product } from './types';

/**
 * Picks the sticks for this week's re-check (docs/catalogus-hercontroleur.md).
 * A stick is a candidate when its oldest lastVerifiedAt reaches the quarterly
 * re-check (source-policy.md §3) within the horizon. Read-only.
 */

/** At most this many sticks per pull request, so a review stays doable. */
export const RECHECK_BATCH_SIZE = 12;

/** Look this far ahead, so sticks are re-checked before they fall due. */
export const RECHECK_HORIZON_DAYS = 28;

/** Gaps a source may fill now: specs that help the advice when they are known. */
export type RecheckGap = 'carbonPercentage' | 'bowProfile' | 'modelYear';

export type RecheckCandidate = {
  slug: string;
  name: string;
  brand: string;
  /** Oldest lastVerifiedAt of any field. */
  oldestVerifiedAt: string;
  /** Date the quarterly re-check falls due. */
  dueOn: string;
  /** Distinct source URLs to open, in field order. */
  sourceUrls: string[];
  gaps: RecheckGap[];
};

function findGaps(product: Product): RecheckGap[] {
  const gaps: RecheckGap[] = [];
  if (!product.carbonPercentage) gaps.push('carbonPercentage');
  if (!product.bowProfile) gaps.push('bowProfile');
  const hasModelYear = Object.values(product).some(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      'modelYear' in value &&
      typeof value.modelYear === 'number',
  );
  if (!hasModelYear) gaps.push('modelYear');
  return gaps;
}

function findSourceUrls(product: Product): string[] {
  const urls = new Set<string>();
  for (const value of Object.values(product)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'sourceUrl' in value &&
      typeof value.sourceUrl === 'string'
    ) {
      urls.add(value.sourceUrl);
    }
  }
  if (product.bolProductUrl) urls.add(product.bolProductUrl);
  return [...urls];
}

export function toRecheckCandidate(product: Product): RecheckCandidate | null {
  const dates = sourcedFields(product)
    .map(({ lastVerifiedAt }) => lastVerifiedAt)
    .filter((date) => !Number.isNaN(new Date(date).getTime()))
    .sort();
  const oldest = dates[0];
  if (!oldest) return null;
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    oldestVerifiedAt: oldest,
    dueOn: toIsoDate(addMonths(new Date(oldest), RECHECK_AFTER_MONTHS)),
    sourceUrls: findSourceUrls(product),
    gaps: findGaps(product),
  };
}

export function selectRecheckBatch(
  products: readonly Product[],
  now: Date = new Date(),
  max: number = RECHECK_BATCH_SIZE,
  horizonDays: number = RECHECK_HORIZON_DAYS,
): RecheckCandidate[] {
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + horizonDays);
  const limit = toIsoDate(horizon);
  return products
    .filter((product) => product.dataStatus !== 'test-data')
    .map(toRecheckCandidate)
    .filter((c): c is RecheckCandidate => c !== null && c.dueOn <= limit)
    .sort(
      (a, b) =>
        a.oldestVerifiedAt.localeCompare(b.oldestVerifiedAt) ||
        a.slug.localeCompare(b.slug),
    )
    .slice(0, max);
}

const GAP_LABELS: Record<RecheckGap, string> = {
  carbonPercentage: 'carbonpercentage',
  bowProfile: 'bow-profiel',
  modelYear: 'modeljaar',
};

/** Markdown work list for the agent (data, not instructions). */
export function formatRecheckList(
  batch: readonly RecheckCandidate[],
  now: Date = new Date(),
): string {
  const lines = [
    `# Hercontrole ${toIsoDate(now)}`,
    '',
    batch.length === 0
      ? 'Geen sticks aan de beurt.'
      : `${batch.length} sticks, oudste controle eerst.`,
    '',
  ];
  for (const c of batch) {
    lines.push(`## ${c.name} (\`${c.slug}\`)`);
    lines.push(
      `- Laatst gecontroleerd: ${c.oldestVerifiedAt}; kwartaalcontrole vanaf ${c.dueOn}`,
    );
    if (c.gaps.length > 0) {
      lines.push(
        `- Ontbreekt nu: ${c.gaps.map((gap) => GAP_LABELS[gap]).join(', ')}`,
      );
    }
    lines.push('- Bronnen:');
    if (c.sourceUrls.length === 0) lines.push('  - (geen bron-URL in de catalogus)');
    for (const url of c.sourceUrls) lines.push(`  - ${url}`);
    lines.push('');
  }
  return lines.join('\n');
}
