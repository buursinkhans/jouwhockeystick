import type { Product } from '@/catalog/types';
import { BOW_LABELS, EXPERIENCE_LABELS, POSITION_LABELS, STOCK_LABELS } from '@/catalog/labels';
import { SourceBadge, type SourceMeta } from '@/components/ui/SourceBadge';

export function ProductSpecTable({ product }: { product: Product }) {
  const rows: Array<{ label: string; value: string; sourced: SourceMeta }> = [
    {
      label: 'Ervaringsniveau',
      value: EXPERIENCE_LABELS[product.experienceLevel.value],
      sourced: product.experienceLevel,
    },
    {
      label: 'Vaak gebruikt op positie',
      value: product.recommendedPositions.value.map((p) => POSITION_LABELS[p] ?? p).join(', '),
      sourced: product.recommendedPositions,
    },
  ];

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
          <tr key={row.label} className="border-b border-zinc-200">
            <th scope="row" className="w-1/3 py-3 pr-4 align-top text-sm font-semibold text-zinc-700">
              {row.label}
            </th>
            <td className="py-3">
              <p>{row.value}</p>
              <SourceBadge sourced={row.sourced} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
