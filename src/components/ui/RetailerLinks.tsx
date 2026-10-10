import Link from 'next/link';
import type { Brand } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import {
  PARTNER_LINK_LABEL,
  PARTNER_LINK_URL,
  PASSASPORTS_PENDING_LABEL,
  PASSASPORTS_PENDING_NOTE,
} from '@/content/partnerLinks';
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
  notSoldAtBol = false,
  passaSportsOnly = false,
  className = '',
  stack = false,
}: {
  brand: Brand;
  productName: string;
  placement: RetailerPlacement;
  /** Direct bol.com product page, if known. */
  bolProductUrl?: string;
  /** bol.com does not sell this model: show that instead of a link. */
  notSoldAtBol?: boolean;
  /** Only PassaSports sells it and the link there is not ready yet. */
  passaSportsOnly?: boolean;
  className?: string;
  /** Stacks the buttons full-width instead of placing them side by side. */
  stack?: boolean;
}) {
  const layout = stack ? 'flex flex-col gap-2' : 'flex flex-wrap gap-3';
  const buttonWidth = stack ? 'w-full' : '';

  if (notSoldAtBol && passaSportsOnly) {
    return (
      <div className={className}>
        <p className="text-sm font-semibold text-inkt">
          {PASSASPORTS_PENDING_LABEL}
        </p>
        <p className="mt-1 text-xs text-lijngrijs">
          {PASSASPORTS_PENDING_NOTE}
        </p>
      </div>
    );
  }

  if (notSoldAtBol) {
    return (
      <div className={className}>
        <p className="text-sm font-medium text-lijngrijs">
          Niet verkrijgbaar bij bol.com
        </p>
      </div>
    );
  }

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
