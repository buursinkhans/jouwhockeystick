'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';

/**
 * Reports `offer_block_view` once, when "Waar te koop" comes into view. Only
 * this wrapper runs in the browser; the block itself stays server-rendered.
 */
export function OfferBlockView({
  placement,
  offerCount,
  pricedCount,
  children,
}: {
  placement: string;
  offerCount: number;
  pricedCount: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackEvent({ name: 'offer_block_view', placement, offerCount, pricedCount });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [placement, offerCount, pricedCount]);

  return <div ref={ref}>{children}</div>;
}
