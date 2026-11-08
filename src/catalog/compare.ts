import {
  DISCIPLINE_LABELS,
  BOW_LABELS,
  EXPERIENCE_LABELS,
  POSITION_LABELS,
  STOCK_LABELS,
} from './labels';
import { getDiscipline } from './discipline';
import type { Product } from './types';

export type CompareRow = { label: string; valueA: string; valueB: string };
/** One row for two or three sticks (UX phase 2, 2026-11-08); `values` in the order of the sticks. */
export type CompareTableRow = { label: string; values: string[] };

const NOT_STATED = 'Niet vermeld';

function formatPositions(product: Product): string {
  return product.recommendedPositions.value
    .map((p) => POSITION_LABELS[p] ?? p)
    .join(', ');
}

/**
 * A side-by-side table for two or three products. A row for an optional
 * spec (bow profile, carbon, weight) is only included when at least one of
 * the products has it; the others then show "Niet vermeld" rather than a
 * guessed value. The last two rows are the products' own first strength and
 * first point of attention, with their sources on the product page.
 */
export function buildCompareTable(products: readonly Product[]): CompareTableRow[] {
  const row = (label: string, value: (p: Product) => string): CompareTableRow => ({ label, values: products.map(value) });
  const rows: CompareTableRow[] = [
    row('Merk', (p) => p.brand),
    row('Soort stick', (p) => DISCIPLINE_LABELS[getDiscipline(p)]),
    row('Ervaringsniveau', (p) => EXPERIENCE_LABELS[p.experienceLevel.value]),
    row('Vaak gebruikt op positie', formatPositions),
  ];
  if (products.some((p) => p.bowProfile)) {
    rows.push(row('Bow-profiel', (p) => (p.bowProfile ? BOW_LABELS[p.bowProfile.value] : NOT_STATED)));
  }
  if (products.some((p) => p.carbonPercentage)) {
    rows.push(row('Carbonpercentage', (p) => (p.carbonPercentage ? `${p.carbonPercentage.value}%` : NOT_STATED)));
  }
  if (products.some((p) => p.weightGrams)) {
    rows.push(row('Gewicht', (p) => (p.weightGrams ? `${p.weightGrams.value} gram` : NOT_STATED)));
  }
  rows.push(
    row('Beschikbare lengtes', (p) => p.lengthsInches.value.map((l) => `${l}"`).join(', ')),
    row('Voorraadstatus', (p) => STOCK_LABELS[p.stock.value]),
    row('Adviesprijs', (p) => `€${p.priceIndicativeEur.value.toFixed(2)}`),
    row('Sterk punt', (p) => p.strengths.value[0] ?? NOT_STATED),
    row('Let op', (p) => p.pointsOfAttention.value[0] ?? NOT_STATED),
  );
  return rows;
}

/** Two products, as the stick pages and the advice compare them (without the plus and minus rows). */
export function buildCompareRows(a: Product, b: Product): CompareRow[] {
  return buildCompareTable([a, b])
    .filter((row) => row.label !== 'Sterk punt' && row.label !== 'Let op')
    .map((row) => ({ label: row.label, valueA: row.values[0] ?? '', valueB: row.values[1] ?? '' }));
}
