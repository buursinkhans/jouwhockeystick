'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics/track';
import { MAX_COMPARE, clearCompare, compareUrl, useCompareSelection } from './compareStore';

/**
 * A bar at the bottom of the screen once sticks are ticked to compare (UX
 * phase 2, 2026-11-08). Not on /vergelijk itself, where the table is.
 */
export function CompareBar() {
  const selection = useCompareSelection();
  const pathname = usePathname();
  if (selection.length === 0 || pathname === '/vergelijk') return null;
  const ready = selection.length >= 2;
  return (
    <div role="region" aria-label="Sticks vergelijken" className="fixed inset-x-0 bottom-0 z-40 border-t border-rand bg-white/95 shadow-header backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-inkt" aria-live="polite">
          {selection.length} van {MAX_COMPARE} sticks gekozen
          {!ready && <span className="text-lijngrijs"> · kies er nog één</span>}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={clearCompare} className="min-h-11 px-3 text-sm font-semibold text-veld hover:underline">
            Wis
          </button>
          {ready ? (
            <Link
              href={compareUrl(selection)}
              onClick={() => trackEvent({ name: 'compare_open', count: selection.length })}
              className={`${buttonBaseClasses} ${buttonVariantClasses.primary}`}
            >
              Vergelijk {selection.length} sticks
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
