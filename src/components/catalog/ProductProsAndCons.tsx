import type { Product } from '@/catalog/types';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';

export function ProductProsAndCons({
  product,
  limit,
}: {
  product: Product;
  /** Caps how many items show per list — used for the compact card view. */
  limit?: number;
}) {
  const strengths = limit ? product.strengths.value.slice(0, limit) : product.strengths.value;
  const attention = limit
    ? product.pointsOfAttention.value.slice(0, limit)
    : product.pointsOfAttention.value;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sterke punten</p>
        <ul className="mt-2 space-y-1.5">
          {strengths.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-sm text-zinc-700">
              <CheckIcon size={14} className="mt-0.5 shrink-0 text-emerald-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Let op</p>
        <ul className="mt-2 space-y-1.5">
          {attention.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-sm text-zinc-700">
              <AlertIcon size={14} className="mt-0.5 shrink-0 text-amber-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
