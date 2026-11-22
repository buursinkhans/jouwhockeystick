'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { VersusReeks } from '@/lib/analytics/versusContext';
import { trackEvent } from '@/lib/analytics/track';

/**
 * Wraps a series comparison (/vergelijk/<reeks>, wave 1, 2026-11-22): counts
 * the view once (`versus_view`) and tells the shop buttons inside which series
 * they sit in, so a click is also counted as `versus_retailer_click`. The page
 * itself stays server-rendered.
 */
export function VersusTracking({ reeks, children }: { reeks: string; children: ReactNode }) {
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    trackEvent({ name: 'versus_view', page: 'versus', reeks });
  }, [reeks]);
  return <VersusReeks.Provider value={reeks}>{children}</VersusReeks.Provider>;
}
