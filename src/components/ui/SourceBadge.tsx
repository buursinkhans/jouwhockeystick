import type { SourcedValue } from '@/catalog/types';
import { InfoIcon } from './icons';

const SOURCE_LABELS: Record<SourcedValue<unknown>['source'], string> = {
  'brand-website': 'Merkwebsite',
  'partner-shop': 'Partnerwinkel',
  'fih-rules': 'FIH-reglement',
  'editorial-estimate': 'Redactionele inschatting',
};

export type SourceMeta = Omit<SourcedValue<unknown>, 'value'>;

/**
 * The source under a spec. A value from a shop instead of the brand gets a
 * quiet info icon and says so in words (2026-11-05): a fact about the source,
 * not a warning, so it sits at the spec and not at the shop buttons.
 */
export function SourceBadge({ sourced }: { sourced: SourceMeta }) {
  const fromShop = sourced.source === 'partner-shop';
  return (
    <p className="flex items-start gap-1 text-xs text-lijngrijs">
      {fromShop && <InfoIcon size={13} className="mt-px shrink-0" />}
      <span>
        {fromShop && <span className="font-semibold">Van de winkel. </span>}
        Bron: {sourced.sourceLabel ?? SOURCE_LABELS[sourced.source]}
        {sourced.modelYear ? ` · Modeljaar ${sourced.modelYear}` : ''}
        {' · Laatst gecontroleerd op '}
        <time dateTime={sourced.lastVerifiedAt}>{sourced.lastVerifiedAt}</time>
      </span>
    </p>
  );
}
