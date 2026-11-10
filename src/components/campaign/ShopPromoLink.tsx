'use client';

import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import { RETAILERS, shopPageTrackingUrl, type RetailerId, type RetailerPlacement } from '@/lib/retailers';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';

/**
 * A tracked button to a shop's own action page (/black-friday-hockey). Counted
 * as retailer_click with linkType 'actie', so it sits in the same report as
 * the product buttons. Renders nothing when the URL is not on the shop's domain.
 */
export function ShopPromoLink({
  retailer,
  url,
  placement,
  children,
}: {
  retailer: RetailerId;
  url: string;
  placement: RetailerPlacement;
  children: ReactNode;
}) {
  const href = shopPageTrackingUrl(retailer, url, placement);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${buttonBaseClasses} ${buttonVariantClasses.secondary}`}
      onClick={() =>
        trackEvent({
          name: 'retailer_click',
          retailer,
          brand: 'actie',
          productName: `${RETAILERS[retailer].label} actiepagina`,
          placement,
          linkType: 'actie',
        })
      }
    >
      {children}
    </a>
  );
}
