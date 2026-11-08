import type { ReactNode } from 'react';
import { faqJsonLd, type FaqItem } from '@/lib/faqJsonLd';
import { jsonLdHtml } from '@/lib/jsonLd';
import { InlineText } from './InlineText';

/**
 * Frequently asked questions as visible H3 + answer, with FAQPage
 * structured data built from exactly that text (one source, decision log
 * 2026-11-08). Server-rendered, so the answers are in the HTML for search
 * engines and AI crawlers. `wrap` lets a page put the list inside its own
 * tracking block.
 */
export function FaqSection({
  id,
  heading,
  items,
  url,
  className = 'mt-12 max-w-3xl',
  wrap = (list) => list,
}: {
  id: string;
  heading: string;
  items: readonly FaqItem[];
  /** Absolute URL of the page, for the structured data. */
  url: string;
  className?: string;
  wrap?: (list: ReactNode) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className={className} aria-labelledby={id}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqJsonLd(items, url)) }} />
      <h2 id={id} className="text-2xl font-bold">
        {heading}
      </h2>
      {wrap(
        <div className="mt-5 space-y-6">
          {items.map((item) => (
            <div key={item.question}>
              <h3 className="text-lg font-bold">{item.question}</h3>
              <p className="mt-2 text-inkt/80">
                <InlineText text={item.answer} />
              </p>
            </div>
          ))}
        </div>,
      )}
    </section>
  );
}
