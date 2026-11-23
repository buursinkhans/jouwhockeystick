'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';

/**
 * Wraps a brand page (/merken/<merk>, decision log 2026-11-23): counts the view
 * once (`brand_view`) and a click on a stick (`brand_stick_click`), with the
 * path of the stick page as target. There is no shop button on this page: the
 * shop clicks happen on the stick page and count there as retailer_click. The
 * page itself stays server-rendered.
 */
export function BrandTracking({ merk, children }: { merk: string; children: ReactNode }) {
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    trackEvent({ name: 'brand_view', page: 'merk', merk });
  }, [merk]);
  return (
    <div
      onClickCapture={(event) => {
        const href = (event.target as HTMLElement).closest('a')?.getAttribute('href');
        if (href?.startsWith('/sticks/')) trackEvent({ name: 'brand_stick_click', page: 'merk', merk, target: href });
      }}
    >
      {children}
    </div>
  );
}
