import type { Product } from '@/catalog/types';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';

export function ProductProsAndCons({
  product,
  limit,
  stacked = false,
}: {
  product: Product;
  /** Caps how many items show per list — used for the compact card view. */
  limit?: number;
  /** Always one column, for narrow cards. */
  stacked?: boolean;
}) {
  const strengths = limit
    ? product.strengths.value.slice(0, limit)
    : product.strengths.value;
  const attention = limit
    ? product.pointsOfAttention.value.slice(0, limit)
    : product.pointsOfAttention.value;

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${stacked ? '' : 'sm:grid-cols-2'}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-lijngrijs">
          Sterke punten
        </p>
        <ul className="mt-2 space-y-1.5">
          {strengths.map((item) => (
            <li
              key={item}
              className="flex items-start gap-1.5 text-sm text-inkt/80"
            >
              <CheckIcon size={14} className="mt-0.5 shrink-0 text-veld" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-lijngrijs">
          Let op
        </p>
        <ul className="mt-2 space-y-1.5">
          {attention.map((item) => (
            <li
              key={item}
              className="flex items-start gap-1.5 text-sm text-inkt/80"
            >
              <AlertIcon size={14} className="mt-0.5 shrink-0 text-amber-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
