import type { Article } from '@/content/types';

export function SourceList({ sources }: { sources: Article['sources'] }) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <div className="mt-10 border-t border-zinc-200 pt-6">
      <h2 className="text-lg font-semibold">Bronnen</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
        {sources.map((source) => (
          <li key={source.label}>
            {source.url ? (
              <a href={source.url} className="hover:underline">
                {source.label}
              </a>
            ) : (
              source.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
