'use client';

import { trackEvent } from '@/lib/analytics/track';
import { MAX_COMPARE, toggleCompare, useCompareSelection } from './compareStore';

/** "Vergelijk" checkbox on a stick card (UX phase 2, 2026-11-08); above the card's stretched link. */
export function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const selection = useCompareSelection();
  const checked = selection.includes(slug);
  const full = !checked && selection.length >= MAX_COMPARE;
  return (
    <label
      className={`relative z-10 inline-flex min-h-11 items-center gap-2 text-sm ${full ? 'cursor-not-allowed text-lijngrijs' : 'cursor-pointer text-inkt'}`}
      title={full ? `Je kunt maximaal ${MAX_COMPARE} sticks vergelijken` : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={full}
        onChange={() => {
          toggleCompare(slug);
          trackEvent({ name: 'compare_select', action: checked ? 'remove' : 'add', count: selection.length + (checked ? -1 : 1) });
        }}
        className="h-5 w-5 accent-veld"
        aria-label={`Vergelijk ${name}`}
      />
      <span aria-hidden="true">{full ? `Vergelijk (max. ${MAX_COMPARE})` : 'Vergelijk deze stick'}</span>
    </label>
  );
}
