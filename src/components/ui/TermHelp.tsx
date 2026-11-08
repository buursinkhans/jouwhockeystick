import Link from 'next/link';
import { TERMS, type TermKey } from '@/content/terms';

/**
 * A technical term in plain words, folded (UX phase 1, 2026-11-08). A native
 * <details>: works without JavaScript, by keyboard and on a phone, where a
 * hover tooltip would not. The text is in the HTML for search engines too.
 */
export function TermHelp({ terms, label = 'Wat betekent dit?' }: { terms: readonly TermKey[]; label?: string }) {
  return (
    <details className="group mt-1 text-sm">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 font-semibold text-veld [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-veld text-[10px] leading-none">
          ?
        </span>
        {label}
      </summary>
      <div className="space-y-2 pb-2 text-inkt/80">
        {terms.map((key) => (
          <p key={key}>
            {terms.length > 1 && <span className="font-semibold text-inkt">{TERMS[key].term}: </span>}
            {TERMS[key].plain}{' '}
            <Link href={TERMS[key].href} className="text-veld underline hover:no-underline">
              Meer uitleg
            </Link>
          </p>
        ))}
      </div>
    </details>
  );
}
