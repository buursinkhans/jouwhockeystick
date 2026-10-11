import { formatDutchDate, isPublished } from '@/content/schedule';
import type { Article } from '@/content/types';

/** Shown only on previews, above content that is not live yet. */
export function ScheduledNotice({ article }: { article: Article }) {
  if (isPublished(article)) return null;
  return (
    <p
      role="note"
      className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <strong>Gepland voor {formatDutchDate(article.publishedAt)}.</strong>{' '}
      Deze pagina is nog niet live en alleen in de preview te zien.
    </p>
  );
}
