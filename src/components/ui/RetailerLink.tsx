'use client';

import type { ReactNode } from 'react';
import {
  RETAILERS,
  type RetailerId,
  type RetailerPlacement,
} from '@/lib/retailers';
import { useAdviceClick } from '@/lib/analytics/adviceContext';
import { useVersusReeks } from '@/lib/analytics/versusContext';
import { isFromSearch } from '@/lib/analytics/searchContext';
import { trackEvent } from '@/lib/analytics/track';
import { buttonBaseClasses, buttonVariantClasses } from './Button';

type Props = {
  retailer: RetailerId;
  /** Stick or shoe brand (shoe brands are not in the stick Brand list). */
  brand: string;
  productName: string;
  placement: RetailerPlacement;
  /** Direct product page; without it the link goes to a search. */
  productUrl?: string;
  className?: string;
  variant?: keyof typeof buttonVariantClasses;
  /** In "Waar te koop": the place in the sorted list, the number of shops and whether an amount was shown. */
  offer?: { position: number; offerCount: number; priceShown: boolean };
  /** Accessible name when the visible text alone does not name the shop. */
  ariaLabel?: string;
  children: ReactNode;
};

export function RetailerLink({
  retailer,
  brand,
  productName,
  placement,
  productUrl,
  className = '',
  variant,
  offer,
  ariaLabel,
  children,
}: Props) {
  const advice = useAdviceClick();
  const versusReeks = useVersusReeks();
  const url = RETAILERS[retailer].getUrl({
    productName,
    brand,
    placement,
    productUrl,
  });

  if (!url) {
    return null;
  }

  const variantClass = variant
    ? `${buttonBaseClasses} ${buttonVariantClasses[variant]}`
    : '';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ariaLabel}
      className={`${variantClass} ${className}`.trim()}
      onClick={() => {
        // On a series comparison the click is also counted with its series (2026-11-22).
        if (versusReeks) {
          trackEvent({ name: 'versus_retailer_click', page: 'versus', reeks: versusReeks, retailer });
        }
        trackEvent({
          name: 'retailer_click',
          retailer,
          brand,
          productName,
          placement,
          linkType: productUrl ? 'product' : 'search',
          ...(offer && {
            position: offer.position,
            offerCount: offer.offerCount,
            priceShown: offer.priceShown,
          }),
          ...advice,
          ...(isFromSearch() && { fromSearch: true }),
        });
      }}
    >
      {children}
    </a>
  );
}
