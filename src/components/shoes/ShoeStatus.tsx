import { lastChecked, shoeCertainty, sourceKinds } from '@/catalog/shoes/certainty';
import type { Shoe } from '@/catalog/shoes/types';
import { CERTAINTY_TEXT, SOURCE_KIND_LABEL } from '@/content/hockeyschoenen';

/**
 * The certainty line of a model (laag C): status, source kinds and check
 * date. `compact` on cards: only the status label.
 */
export function ShoeStatus({ shoe, compact = false }: { shoe: Shoe; compact?: boolean }) {
  const certainty = shoeCertainty(shoe);
  const { label, text } = CERTAINTY_TEXT[certainty];
  const chip = (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        certainty === 'goede-onderbouwing' ? 'border-veld text-veld' : 'border-lijngrijs text-inkt/80'
      }`}
    >
      {label}
    </span>
  );
  if (compact) return chip;

  const kinds = sourceKinds(shoe).map((kind) => SOURCE_KIND_LABEL[kind]);
  const date = lastChecked(shoe);
  return (
    <div className="mt-4 rounded-2xl border border-rand bg-krijt p-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Basis en zekerheid:</span>
        {chip}
      </p>
      <p className="mt-2 text-sm text-inkt/80">{text}</p>
      <p className="mt-1 text-xs text-lijngrijs">
        Bron: {kinds.length ? kinds.join(' en ') : 'geen'}
        {date && (
          <>
            {' · gecontroleerd op '}
            <time dateTime={date}>{date}</time>
          </>
        )}
      </p>
    </div>
  );
}
