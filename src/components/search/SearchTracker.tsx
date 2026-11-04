'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/track';

/** Reports one search_results event per search: the counts, never the typed text. */
export function SearchTracker({ queryLength, sticks, shoes }: { queryLength: number; sticks: number; shoes: number }) {
  useEffect(() => {
    if (queryLength > 0) trackEvent({ name: 'search_results', queryLength, sticks, shoes });
  }, [queryLength, sticks, shoes]);
  return null;
}
