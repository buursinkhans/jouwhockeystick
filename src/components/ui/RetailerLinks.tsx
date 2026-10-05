import type { Brand } from '@/catalog/types';
import { RetailerLink } from './RetailerLink';

/**
 * Renders the outbound retailer CTAs for a product. bol.com links straight
 * to a search for this exact model. PassaSports only has a verified
 * brand-category page (no confirmed per-product URLs), so its button is
 * phrased accordingly ("bekijk het {brand}-assortiment") rather than
 * implying it goes straight to this exact stick.
 */
export function RetailerLinks({
  brand,
  productName,
  className = '',
  stack = false,
}: {
  brand: Brand;
  productName: string;
  className?: string;
  /** Stacks the buttons full-width instead of placing them side by side. */
  stack?: boolean;
}) {
  const layout = stack ? 'flex flex-col gap-2' : 'flex flex-wrap gap-3';
  const buttonWidth = stack ? 'w-full' : '';

  return (
    <div className={`${layout} ${className}`.trim()}>
      <RetailerLink
        retailer="bolcom"
        brand={brand}
        productName={productName}
        variant="primary"
        className={buttonWidth}
      >
        Bekijk en koop op bol.com
      </RetailerLink>
      <RetailerLink
        retailer="passasports"
        brand={brand}
        productName={productName}
        variant="secondary"
        className={buttonWidth}
      >
        Bekijk {brand}-assortiment bij PassaSports
      </RetailerLink>
    </div>
  );
}
