import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { LENGTH_TABLE_PATH } from '@/lib/site';
import {
  BOW_LABELS,
  DISCIPLINE_LABELS,
  EXPERIENCE_LABELS,
  POSITION_LABELS,
  STOCK_LABELS,
} from '@/catalog/labels';
import { SourceBadge, type SourceMeta } from '@/components/ui/SourceBadge';

export function ProductSpecTable({ product }: { product: Product }) {
  const rows: Array<{ label: string; value: string; sourced: SourceMeta; lengthHelp?: boolean }> = [
    {
      label: 'Ervaringsniveau',
      value: EXPERIENCE_LABELS[product.experienceLevel.value],
      sourced: product.experienceLevel,
    },
    {
      label: 'Vaak gebruikt op positie',
      value: product.recommendedPositions.value
        .map((p) => POSITION_LABELS[p] ?? p)
        .join(', '),
      sourced: product.recommendedPositions,
    },
  ];

  if (product.discipline) {
    rows.unshift({
      label: 'Soort stick',
      value: DISCIPLINE_LABELS[product.discipline.value],
      sourced: product.discipline,
    });
  }

  if (product.bowProfile) {
    rows.push({
      label: 'Bow-profiel',
      value: BOW_LABELS[product.bowProfile.value],
      sourced: product.bowProfile,
    });
  }

  if (product.carbonPercentage) {
    rows.push({
      label: 'Carbonpercentage',
      value: `${product.carbonPercentage.value}%`,
      sourced: product.carbonPercentage,
    });
  }

  if (product.weightGrams) {
    rows.push({
      label: 'Gewicht',
      value: `${product.weightGrams.value} gram`,
      sourced: product.weightGrams,
    });
  }

  rows.push(
    {
      label: 'Beschikbare lengtes',
      value: product.lengthsInches.value.map((l) => `${l}"`).join(', '),
      sourced: product.lengthsInches,
      lengthHelp: true,
    },
    {
      label: 'Voorraadstatus',
      value: STOCK_LABELS[product.stock.value],
      sourced: product.stock,
    },
  );

  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Specificaties van {product.name}</caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-rand">
            <th
              scope="row"
              className="w-1/3 py-3 pr-4 align-top text-sm font-semibold text-inkt/80"
            >
              {row.label}
            </th>
            <td className="py-3">
              <p>{row.value}</p>
              {row.lengthHelp && (
                <p className="mt-1 text-sm text-inkt/80">
                  Welke lengte past bij jou? Bekijk de{' '}
                  <Link href={LENGTH_TABLE_PATH} className="font-semibold text-veld underline hover:no-underline">
                    hockeystick lengte tabel
                  </Link>
                  .
                </p>
              )}
              <SourceBadge sourced={row.sourced} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
