import { BOW_LABELS, EXPERIENCE_LABELS, POSITION_LABELS, STOCK_LABELS } from './labels';
import type { Product } from './types';

export type CompareRow = { label: string; valueA: string; valueB: string };

const NOT_STATED = 'Niet vermeld';

function formatPositions(product: Product): string {
  return product.recommendedPositions.value.map((p) => POSITION_LABELS[p] ?? p).join(', ');
}

/**
 * Builds a side-by-side row list for two products. A row for an optional
 * spec (bow profile, carbon, weight) is only included when at least one of
 * the two products has it — the other column then shows "Niet vermeld"
 * rather than a guessed value.
 */
export function buildCompareRows(a: Product, b: Product): CompareRow[] {
  const rows: CompareRow[] = [
    { label: 'Merk', valueA: a.brand, valueB: b.brand },
    {
      label: 'Ervaringsniveau',
      valueA: EXPERIENCE_LABELS[a.experienceLevel.value],
      valueB: EXPERIENCE_LABELS[b.experienceLevel.value],
    },
    {
      label: 'Vaak gebruikt op positie',
      valueA: formatPositions(a),
      valueB: formatPositions(b),
    },
  ];

  if (a.bowProfile || b.bowProfile) {
    rows.push({
      label: 'Bow-profiel',
      valueA: a.bowProfile ? BOW_LABELS[a.bowProfile.value] : NOT_STATED,
      valueB: b.bowProfile ? BOW_LABELS[b.bowProfile.value] : NOT_STATED,
    });
  }

  if (a.carbonPercentage || b.carbonPercentage) {
    rows.push({
      label: 'Carbonpercentage',
      valueA: a.carbonPercentage ? `${a.carbonPercentage.value}%` : NOT_STATED,
      valueB: b.carbonPercentage ? `${b.carbonPercentage.value}%` : NOT_STATED,
    });
  }

  if (a.weightGrams || b.weightGrams) {
    rows.push({
      label: 'Gewicht',
      valueA: a.weightGrams ? `${a.weightGrams.value} gram` : NOT_STATED,
      valueB: b.weightGrams ? `${b.weightGrams.value} gram` : NOT_STATED,
    });
  }

  rows.push(
    {
      label: 'Beschikbare lengtes',
      valueA: a.lengthsInches.value.map((l) => `${l}"`).join(', '),
      valueB: b.lengthsInches.value.map((l) => `${l}"`).join(', '),
    },
    {
      label: 'Voorraadstatus',
      valueA: STOCK_LABELS[a.stock.value],
      valueB: STOCK_LABELS[b.stock.value],
    },
    {
      label: 'Adviesprijs',
      valueA: `€${a.priceIndicativeEur.value.toFixed(2)}`,
      valueB: `€${b.priceIndicativeEur.value.toFixed(2)}`,
    },
  );

  return rows;
}
