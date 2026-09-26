import type { Product } from '@/catalog/types';
import { SourceBadge, type SourceMeta } from '@/components/ui/SourceBadge';

const EXPERIENCE_LABELS: Record<Product['experienceLevel']['value'], string> = {
  beginner: 'Beginner',
  gevorderd: 'Gevorderd',
  ervaren: 'Ervaren',
};

const BOW_LABELS: Record<Product['bowProfile']['value'], string> = {
  'low-bow': 'Low bow',
  'mid-bow': 'Mid bow',
  'late-bow': 'Late bow',
};

const STOCK_LABELS: Record<Product['stock']['value'], string> = {
  available: 'Beschikbaar',
  limited: 'Beperkt beschikbaar',
  unavailable: 'Niet beschikbaar',
};

const POSITION_LABELS: Record<string, string> = {
  keeper: 'Keeper',
  verdediger: 'Verdediger',
  middenvelder: 'Middenvelder',
  aanvaller: 'Aanvaller',
};

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
    {
      label: 'Bow-profiel',
      value: BOW_LABELS[product.bowProfile.value],
      sourced: product.bowProfile,
    },
    {
      label: 'Carbonpercentage',
      value: `${product.carbonPercentage.value}%`,
      sourced: product.carbonPercentage,
    },
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
  ];

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
