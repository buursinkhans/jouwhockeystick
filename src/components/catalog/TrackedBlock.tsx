'use client';

import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';

/**
 * Reports clicks on links inside a content block of a catalog page
 * (`catalog_block_click`). The block itself stays server-rendered: only this
 * thin wrapper runs in the browser.
 */
export function TrackedBlock({
  page,
  block,
  children,
}: {
  page: 'sticks';
  block: 'intro' | 'levels' | 'faq';
  children: ReactNode;
}) {
  return (
    <div
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest('a');
        const href = link?.getAttribute('href');
        if (!href) return;
        // Shop buttons are counted as retailer_click; keep partner URLs out.
        const target =
          href.startsWith('/') || href.startsWith('#') ? href : 'winkel';
        trackEvent({ name: 'catalog_block_click', page, block, target });
      }}
    >
      {children}
    </div>
  );
}
