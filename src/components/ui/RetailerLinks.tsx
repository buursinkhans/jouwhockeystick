import Link from 'next/link';
import type { Brand } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import { PARTNER_LINK_LABEL, PARTNER_LINK_URL } from '@/content/partnerLinks';
import { RetailerLink } from './RetailerLink';

/**
 * The outbound shop CTA for a product: a bol.com partner link to the
 * product page when known, otherwise to a search for this exact model, plus the partner-link disclosure. bol.com is the
 * only shop for now — other shops come back once they have a partner
 * programme we can join.
 */
export function RetailerLinks({
  brand,
  productName,
  placement,
  bolProductUrl,
  className = '',
  stack = false,
}: {
  brand: Brand;
  productName: string;
  placement: RetailerPlacement;
  /** Direct bol.com product page, if known. */
  bolProductUrl?: string;
  className?: string;
  /** Stacks the buttons full-width instead of placing them side by side. */
  stack?: boolean;
}) {
  const layout = stack ? 'flex flex-col gap-2' : 'flex flex-wrap gap-3';
  const buttonWidth = stack ? 'w-full' : '';

  return (
    <div className={className}>
      <div className={layout}>
        <RetailerLink
          retailer="bolcom"
          brand={brand}
          productName={productName}
          placement={placement}
          productUrl={bolProductUrl}
          variant="primary"
          className={buttonWidth}
        >
          Bekijk en koop op bol.com
        </RetailerLink>
      </div>
      {/* Short disclosure at every shop button; the full text is on /methodiek. */}
      <p className="mt-1.5 text-xs text-lijngrijs">
        <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
          {PARTNER_LINK_LABEL}
        </Link>
      </p>
    </div>
  );
}
