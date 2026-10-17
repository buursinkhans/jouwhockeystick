import Link from 'next/link';
import type { Brand } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import {
  PARTNER_LINK_LABEL,
  PARTNER_LINK_URL,
  PASSASPORTS_ONLY_NOTE,
  PASSASPORTS_SELLER_NOTE,
} from '@/content/partnerLinks';
import { RetailerLink } from './RetailerLink';

/**
 * The outbound shop CTA for a product: a bol.com partner link to the
 * product page when known, otherwise to a search for this exact model, plus
 * the partner-link disclosure, plus a PassaSports partner link (via
 * TradeTracker) when PassaSports sells the stick. Each shop that sells it
 * gets a button.
 */
export function RetailerLinks({
  brand,
  productName,
  placement,
  bolProductUrl,
  notSoldAtBol = false,
  bolUnchecked = false,
  passaSportsProductUrl,
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
  /** Feed-imported stick, bol.com not checked: no bol.com button and no claim about bol.com. */
  bolUnchecked?: boolean;
  /** PassaSports product page: adds a PassaSports partner link next to (or instead of) bol.com. */
  passaSportsProductUrl?: string;
  className?: string;
  /** Stacks the buttons full-width instead of placing them side by side. */
  stack?: boolean;
}) {
  const layout = stack ? 'flex flex-col gap-2' : 'flex flex-wrap gap-3';
  const buttonWidth = stack ? 'w-full' : '';

  const atBol = !notSoldAtBol;
  const atPassaSports = passaSportsProductUrl !== undefined;

  if (!atBol && !atPassaSports) {
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
        {atBol && (
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
        )}
        {atPassaSports && (
          <RetailerLink
            retailer="passasports"
            brand={brand}
            productName={productName}
            placement={placement}
            productUrl={passaSportsProductUrl}
            variant="passa"
            className={buttonWidth}
          >
            Bekijk en koop bij PassaHockey
          </RetailerLink>
        )}
      </div>
      {/* Short disclosure at every shop button; the full text is on /methodiek. */}
      <p className="mt-1.5 text-xs text-lijngrijs">
        {!atBol && (
          <>{bolUnchecked ? PASSASPORTS_SELLER_NOTE : PASSASPORTS_ONLY_NOTE} </>
        )}
        <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
          {PARTNER_LINK_LABEL}
        </Link>
      </p>
    </div>
  );
}
