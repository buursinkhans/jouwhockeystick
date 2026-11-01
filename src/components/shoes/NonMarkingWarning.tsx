import { nonMarkingStatus } from '@/catalog/shoes/certainty';
import type { Shoe } from '@/catalog/shoes/types';
import { NON_MARKING_WARNING } from '@/content/hockeyschoenen';

/**
 * On every indoor shoe whose non-marking sole the brand or a shop has not
 * confirmed: our estimate from the photo, or unknown (owner's decision,
 * decision log 2026-11-01). Nothing for confirmed soles or field shoes.
 */
export function NonMarkingWarning({ shoe, compact = false }: { shoe: Shoe; compact?: boolean }) {
  const status = nonMarkingStatus(shoe);
  if (status === null || status === 'bevestigd') return null;
  const text = NON_MARKING_WARNING[status];
  return (
    <p role="note" className={compact ? 'mt-2 text-xs text-amber-900' : 'mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900'}>
      {compact ? text.split('. ')[0] + '.' : text}
    </p>
  );
}
