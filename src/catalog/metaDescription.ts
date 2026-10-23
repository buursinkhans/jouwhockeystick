import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { getDiscipline } from './discipline';
import { BOW_LABELS } from './labels';
import type { ExperienceLevel, Product } from './types';

/**
 * The meta description of a stick page, built from catalog data only
 * (decision log 2026-10-23): discipline, brand, bow and carbon (only from the
 * brand or a shop), level (nuanced when estimated) and lengths, then a fixed
 * closing sentence. It no longer uses product.summary, which can contain
 * brand marketing. A missing value is left out, never estimated. Parts are
 * dropped from the end until it fits.
 */
const CLOSING = 'Bekijk specs, passende lengte en vergelijkbare sticks.';

const LEVEL_AUDIENCE: Record<ExperienceLevel, string> = {
  beginner: 'beginnende spelers',
  gevorderd: 'gevorderde spelers',
  ervaren: 'ervaren spelers',
};

const inch = (value: number) => String(value).replace('.', ',');

function lengthsText(lengths: readonly number[]): string | null {
  const sorted = [...new Set(lengths)].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return `In ${inch(sorted[0] ?? 0)} inch.`;
  if (sorted.length > 3) {
    return `In ${inch(sorted[0] ?? 0)} tot ${inch(sorted.at(-1) ?? 0)} inch.`;
  }
  return `In ${sorted
    .slice(0, -1)
    .map(inch)
    .join(', ')} en ${inch(sorted.at(-1) ?? 0)} inch.`;
}

export function productMetaDescription(product: Product): string {
  const kind = getDiscipline(product) === 'zaal' ? 'Zaalstick' : 'Veldstick';
  // Bow and carbon only when they come from the brand or a shop listing: our
  // own estimate is shown (and labelled) on the page, not stated as a fact here.
  const bow =
    product.bowProfile && product.bowProfile.source !== 'editorial-estimate'
      ? (
          BOW_LABELS[product.bowProfile.value].split(' / ')[0] ?? ''
        ).toLowerCase()
      : null;
  const carbon =
    product.carbonPercentage &&
    product.carbonPercentage.source !== 'editorial-estimate'
      ? product.carbonPercentage.value
      : null;
  let detail = bow ? ` met ${bow}` : '';
  if (carbon === 0) detail += ', zonder carbon';
  else if (carbon !== null)
    detail += `${bow ? ' en' : ' met'} ${carbon}% carbon`;
  // The level is always known, but often our estimate: then "kan passen bij".
  const audience = LEVEL_AUDIENCE[product.experienceLevel.value];
  const level =
    product.experienceLevel.source === 'editorial-estimate'
      ? `kan passen bij ${audience}`
      : `voor ${audience}`;
  const first = `${kind} van ${product.brand}${detail}, ${level}.`;
  const parts = [
    first,
    lengthsText(product.lengthsInches.value),
    CLOSING,
  ].filter((part): part is string => part !== null);

  // Drop the lengths first, then the closing sentence, before cutting words.
  for (const candidate of [parts, [first, CLOSING], [first]]) {
    const text = candidate.join(' ');
    if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
  }
  return first.slice(0, MAX_DESCRIPTION_LENGTH);
}
