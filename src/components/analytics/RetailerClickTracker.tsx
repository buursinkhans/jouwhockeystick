'use client';

import { useEffect } from 'react';
import type { RetailerId, RetailerPlacement } from '@/lib/retailers';
import { trackEvent } from '@/lib/analytics/track';

const RETAILER_IDS: readonly RetailerId[] = ['bolcom', 'passasports'];
const PLACEMENTS: readonly RetailerPlacement[] = [
  'stickwijzer',
  'productpagina',
  'catalogus',
  'vergelijk',
  'zaalkeuze',
];

function isOneOf<T extends string>(
  value: string | undefined,
  options: readonly T[],
): value is T {
  return value !== undefined && (options as readonly string[]).includes(value);
}

/**
 * Sends `retailer_click` for every shop button (RetailerLink) on the site,
 * from its data attributes. One listener instead of a client component per
 * button keeps pages with long stick lists light (decision log 2026-10-23).
 */
export function RetailerClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[data-retailer]',
      );
      if (!link) return;
      const { retailer, brand, productName, placement, linkType } =
        link.dataset;
      if (
        !isOneOf(retailer, RETAILER_IDS) ||
        !isOneOf(placement, PLACEMENTS) ||
        !brand ||
        productName === undefined
      ) {
        return;
      }
      trackEvent({
        name: 'retailer_click',
        retailer,
        brand,
        productName,
        placement,
        linkType: linkType === 'product' ? 'product' : 'search',
      });
    }
    // Capture phase: the link opens a new tab, so this runs before anything else.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
