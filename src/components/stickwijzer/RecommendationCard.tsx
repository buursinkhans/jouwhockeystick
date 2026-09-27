import Link from 'next/link';
import type { CautionCode, ReasonCode } from '@/advice-engine/types';
import type { Product } from '@/catalog/types';
import { Card } from '@/components/ui/Card';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { BolComLink } from '@/components/ui/BolComLink';
import { ProductImage } from '@/components/catalog/ProductImage';
import { ProductSpecTable } from '@/components/catalog/ProductSpecTable';
import { ReasonList } from './ReasonList';
import { CautionList } from './CautionList';

/**
 * The whole card links through to the product page (not just the name), so
 * the explanation/reasons are part of the click target too. The bol.com
 * link is a separate, higher-stacked control so it doesn't create a nested
 * anchor inside the card-covering link.
 */
export function RecommendationCard({
  product,
  reasonCodes,
  cautions,
  label,
}: {
  product: Product;
  reasonCodes: ReasonCode[];
  cautions: CautionCode[];
  /** e.g. "Advies" for the top recommendation — omitted for alternatives. */
  label?: string;
}) {
  return (
    <Card className="relative">
      <Link
        href={`/sticks/${product.slug}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`Bekijk details van ${product.name}`}
      >
        <span className="sr-only">{product.name}</span>
      </Link>

      <div className="flex items-start gap-4">
        <ProductImage product={product} className="h-16 w-16 shrink-0" />
        <div>
          {label && (
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{label}</p>
          )}
          <h3 className={label ? 'mt-1 text-xl font-bold' : 'font-semibold'}>{product.name}</h3>
          <p className="mt-2 text-sm text-zinc-600">{product.summary}</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Waarom dit past
      </p>
      <ReasonList reasonCodes={reasonCodes} />
      <CautionList cautions={cautions} />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Specificaties
      </p>
      <div className="mt-2">
        <ProductSpecTable product={product} />
      </div>

      <p className="mt-4 text-lg font-bold">€{product.priceIndicativeEur.value.toFixed(2)}</p>
      <ProductNotice />

      <div className="relative z-20 mt-4">
        <BolComLink brand={product.brand} productName={product.name} variant="primary">
          Bekijk en koop op bol.com
        </BolComLink>
      </div>
    </Card>
  );
}
