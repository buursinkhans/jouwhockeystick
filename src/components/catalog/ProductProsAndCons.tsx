import type { Product } from '@/catalog/types';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';

export function ProductProsAndCons({
  product,
  limit,
  stacked = false,
  compact = false,
}: {
  product: Product;
  /** Caps how many items show per list — used for the compact card view. */
  limit?: number;
  /** Always one column, for narrow cards. */
  stacked?: boolean;
  /** Smaller type and tighter spacing, for product cards (fase 7). */
  compact?: boolean;
}) {
  const label = `font-semibold uppercase tracking-[0.06em] text-lijngrijs ${compact ? 'text-[0.6875rem]' : 'text-xs'}`;
  const item = `flex items-start gap-1.5 text-inkt/80 ${compact ? 'text-[0.8125rem] leading-snug' : 'text-sm'}`;
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
        <p className={label}>
          Sterke punten
        </p>
        <ul className="mt-2 space-y-1.5">
          {strengths.map((text) => (
            <li
              key={text}
              className={item}
            >
              <CheckIcon size={14} className="mt-0.5 shrink-0 text-veld" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className={label}>
          Let op
        </p>
        <ul className="mt-2 space-y-1.5">
          {attention.map((text) => (
            <li
              key={text}
              className={item}
            >
              <AlertIcon size={14} className="mt-0.5 shrink-0 text-amber-700" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
