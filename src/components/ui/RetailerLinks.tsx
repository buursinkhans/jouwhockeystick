import Link from 'next/link';
import type { Brand } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import {
  PARTNER_LINK_LABEL,
  PARTNER_LINK_URL,
  SHOP_SELLER_NAMES,
  notAtBolNote,
  sellerNote,
} from '@/content/partnerLinks';
import { RetailerLink } from './RetailerLink';

/**
 * The outbound shop CTA for a product: a bol.com partner link to the
 * product page when known, otherwise to a search for this exact model, plus
 * a PassaSports partner link (via TradeTracker) and a Plutosport partner
 * link (via Awin) when those shops sell the stick, plus the partner-link
 * disclosure. Each shop that sells it gets a button; no shop gets a more
 * prominent one because of its commission.
 */
export function RetailerLinks({
  brand,
  productName,
  placement,
  bolProductUrl,
  notSoldAtBol = false,
  bolUnchecked = false,
  passaSportsProductUrl,
  plutosportProductUrl,
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
  /** Plutosport product page ('zeker' feed match): adds a Plutosport partner link. */
  plutosportProductUrl?: string;
  className?: string;
  /** Stacks the buttons full-width instead of placing them side by side. */
  stack?: boolean;
}) {
  const layout = stack ? 'flex flex-col gap-2' : 'flex flex-wrap gap-3';
  const buttonWidth = stack ? 'w-full' : '';

  const atBol = !notSoldAtBol;
  const atPassaSports = passaSportsProductUrl !== undefined;
  const atPlutosport = plutosportProductUrl !== undefined;
  const otherShops = [
    ...(atPassaSports ? [SHOP_SELLER_NAMES.passasports] : []),
    ...(atPlutosport ? [SHOP_SELLER_NAMES.plutosport] : []),
  ];

  if (!atBol && otherShops.length === 0) {
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
            variant="shop"
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
            variant="shop"
            className={buttonWidth}
          >
            Bekijk en koop bij PassaHockey
          </RetailerLink>
        )}
        {atPlutosport && (
          <RetailerLink
            retailer="plutosport"
            brand={brand}
            productName={productName}
            placement={placement}
            productUrl={plutosportProductUrl}
            variant="shop"
            className={buttonWidth}
          >
            Bekijk en koop bij Plutosport
          </RetailerLink>
        )}
      </div>
      {/* Short disclosure at every shop button; the full text is on /methodiek. */}
      <p className="mt-1.5 text-xs text-lijngrijs">
        {!atBol && (
          <>{bolUnchecked ? sellerNote(otherShops) : notAtBolNote(otherShops)} </>
        )}
        <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
          {PARTNER_LINK_LABEL}
        </Link>
      </p>
    </div>
  );
}
