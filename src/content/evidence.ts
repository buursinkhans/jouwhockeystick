import { BOW_LABELS } from '@/catalog/labels';
import type { Product, SourceType } from '@/catalog/types';

/**
 * How sure we are about a stick, in words (redesign fase 8, 2026-11-04).
 * Wirecutter's rule: say what you know, what you don't, and where it comes
 * from. Everything here is read from the product's own source fields; no
 * claim is added that the data does not carry.
 */

const inch = (n: number) => `${String(n).replace('.', ',')} inch`;

/**
 * "Kort gezegd": the stick in one concrete line, from the specs that made
 * the match. Null when neither bow nor carbon is known (then there is
 * nothing concrete to say beyond the size).
 */
export function verdictLine(product: Product, sizeInch: number): string | null {
  const bow = product.bowProfile ? BOW_LABELS[product.bowProfile.value].toLowerCase() : null;
  const carbon = product.carbonPercentage?.value;
  if (!bow && carbon === undefined) return null;
  const what =
    bow && carbon !== undefined
      ? `een ${bow} met ${carbon}% carbon`
      : bow
        ? `een ${bow}`
        : `een stick met ${carbon}% carbon`;
  return `Kort gezegd: ${what}, in ${inch(sizeInch)}.`;
}

/** The specs a stick page lists, each with its own source. */
const SPEC_FIELDS = [
  'discipline',
  'experienceLevel',
  'recommendedPositions',
  'bowProfile',
  'carbonPercentage',
  'weightGrams',
  'lengthsInches',
] as const satisfies readonly (keyof Product)[];

export type SourceMix = { brand: number; shop: number; estimate: number; total: number };

export function sourceMix(product: Product): SourceMix {
  const mix: SourceMix = { brand: 0, shop: 0, estimate: 0, total: 0 };
  for (const field of SPEC_FIELDS) {
    const value = product[field];
    if (!value) continue;
    mix.total++;
    const source: SourceType = value.source;
    if (source === 'brand-website') mix.brand++;
    else if (source === 'partner-shop') mix.shop++;
    else if (source === 'editorial-estimate') mix.estimate++;
  }
  return mix;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * "Van de 7 gegevens komen er 4 van JDH zelf, 2 van een winkel en 1 is onze
 * inschatting." Sources outside the three kinds (FIH rules) count in the
 * total only.
 */
export function sourceMixText(product: Product): string {
  const mix = sourceMix(product);
  const parts = [
    mix.brand ? `${mix.brand} van ${product.brand} zelf` : null,
    mix.shop ? `${mix.shop} van een winkel` : null,
    mix.estimate ? `${mix.estimate} ${mix.estimate === 1 ? 'is' : 'zijn'} onze inschatting` : null,
  ].filter((p): p is string => p !== null);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} en ${parts.at(-1)}` : (parts[0] ?? '');
  const verb = mix.brand + mix.shop === 1 && !mix.estimate ? 'komt er' : 'komen er';
  return `Van de ${count(mix.total, 'gegeven', 'gegevens')} over deze stick ${verb} ${list}.`;
}

/**
 * What we don't know about this stick, plainly. Always ends with the fact
 * that we have not had it in our hands: there are no own measurements or
 * play tests yet (the source list says "niet gemeten", "nog niet getest").
 */
export function evidenceGaps(product: Product, modelYear: number | null): string[] {
  const gaps: string[] = [];
  if (!product.bowProfile) gaps.push('De kromming staat niet in de gegevens van merk of winkel.');
  if (!product.carbonPercentage) gaps.push('Het carbonpercentage is niet vermeld.');
  if (!product.weightGrams) gaps.push('Het gewicht is niet vermeld.');
  if (modelYear === null) gaps.push('Het modeljaar is niet bevestigd.');
  const fromShop = (['bowProfile', 'carbonPercentage'] as const).filter((f) => product[f]?.source === 'partner-shop');
  if (fromShop.length) {
    const what = fromShop.map((f) => (f === 'bowProfile' ? 'de kromming' : 'het carbonpercentage')).join(' en ');
    gaps.push(`${what.charAt(0).toUpperCase()}${what.slice(1)} ${fromShop.length > 1 ? 'komen' : 'komt'} van een winkel, niet van ${product.brand} zelf.`);
  }
  gaps.push('We hebben deze stick niet zelf in de hand gehad of gemeten.');
  return gaps;
}
