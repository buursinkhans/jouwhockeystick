import { BOW_LABELS } from '@/catalog/labels';
import type { BowProfile, Product } from '@/catalog/types';

/**
 * How field and indoor sticks differ in our catalog, computed from the
 * products (decision log 2026-10-24). Always phrased as "in onze catalogus",
 * never as a general truth: the rules for both are the same (FIH). A point is
 * left out when one side has too little data.
 */

/** Below this many sticks with a value on either side, a point is not shown. */
export const MIN_STICKS_PER_SIDE = 3;

const inch = (value: number) => String(value).replace('.', ',');

function range(values: readonly number[]): [number, number] | null {
  return values.length >= MIN_STICKS_PER_SIDE
    ? [Math.min(...values), Math.max(...values)]
    : null;
}

function mostCommonBow(
  products: readonly Product[],
): { bow: BowProfile; count: number; total: number } | null {
  const bows = products
    .map((p) => p.bowProfile?.value)
    .filter((bow): bow is BowProfile => bow !== undefined);
  if (bows.length < MIN_STICKS_PER_SIDE) return null;
  const counts = new Map<BowProfile, number>();
  for (const bow of bows) counts.set(bow, (counts.get(bow) ?? 0) + 1);
  const [bow, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
  return { bow, count, total: bows.length };
}

const bowName = (bow: BowProfile) =>
  (BOW_LABELS[bow].split(' / ')[0] ?? bow).toLowerCase();

/** List items (inline markup) for the article; empty when there is no usable data. */
export function disciplineDifferences(
  field: readonly Product[],
  indoor: readonly Product[],
): string[] {
  const items: string[] = [];

  const lengthsField = range(field.flatMap((p) => p.lengthsInches.value));
  const lengthsIndoor = range(indoor.flatMap((p) => p.lengthsInches.value));
  if (lengthsField && lengthsIndoor) {
    items.push(
      `**Lengte:** veldsticks in onze catalogus zijn er van ${inch(lengthsField[0])} tot ${inch(lengthsField[1])} inch, zaalsticks van ${inch(lengthsIndoor[0])} tot ${inch(lengthsIndoor[1])} inch.`,
    );
  }

  const weight = (products: readonly Product[]) =>
    products
      .map((p) => p.weightGrams?.value)
      .filter((g): g is number => g !== undefined);
  const weightField = range(weight(field));
  const weightIndoor = range(weight(indoor));
  if (weightField && weightIndoor) {
    items.push(
      `**Gewicht** (waar het merk het noemt): veldsticks in onze catalogus wegen ${weightField[0]} tot ${weightField[1]} gram, zaalsticks ${weightIndoor[0]} tot ${weightIndoor[1]} gram.`,
    );
  }

  const bowField = mostCommonBow(field);
  const bowIndoor = mostCommonBow(indoor);
  if (bowField && bowIndoor) {
    items.push(
      `**Kromming:** bij veldsticks in onze catalogus komt ${bowName(bowField.bow)} het vaakst voor (${bowField.count} van ${bowField.total} met een bekende kromming), bij zaalsticks ${bowName(bowIndoor.bow)} (${bowIndoor.count} van ${bowIndoor.total}).`,
    );
  }

  const carbon = (products: readonly Product[]) =>
    products
      .map((p) => p.carbonPercentage?.value)
      .filter((c): c is number => c !== undefined);
  const carbonField = range(carbon(field));
  const carbonIndoor = range(carbon(indoor));
  if (carbonField && carbonIndoor) {
    items.push(
      `**Carbon:** veldsticks in onze catalogus hebben ${carbonField[0]}% tot ${carbonField[1]}% carbon, zaalsticks ${carbonIndoor[0]}% tot ${carbonIndoor[1]}%.`,
    );
  }

  return items;
}
