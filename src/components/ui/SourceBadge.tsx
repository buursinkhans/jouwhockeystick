import type { SourcedValue } from '@/catalog/types';

const SOURCE_LABELS: Record<SourcedValue<unknown>['source'], string> = {
  'brand-website': 'Merkwebsite',
  'partner-shop': 'Partnerwinkel',
  'fih-rules': 'FIH-reglement',
  'editorial-estimate': 'Redactionele inschatting',
};

export type SourceMeta = Omit<SourcedValue<unknown>, 'value'>;

export function SourceBadge({ sourced }: { sourced: SourceMeta }) {
  return (
    <p className="text-xs text-lijngrijs">
      Bron: {sourced.sourceLabel ?? SOURCE_LABELS[sourced.source]}
      {sourced.modelYear ? ` · Modeljaar ${sourced.modelYear}` : ''}
      {' · Laatst gecontroleerd op '}
      <time dateTime={sourced.lastVerifiedAt}>{sourced.lastVerifiedAt}</time>
    </p>
  );
}
