import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';

/** Same widths as the page body below it, so the left edges line up (docs/designsysteem.md §4). */
const WIDTHS = { lezen: 'max-w-3xl', tussen: 'max-w-4xl', product: 'max-w-5xl' } as const;

/**
 * The band every main page opens with (redesign fase 5): breadcrumb, eyebrow,
 * one H1 and the intro on a krijt-to-white surface, so a page starts as a
 * page and not as a document. The intro must still answer the page's main
 * question in its first 80 words (CLAUDE.md, GEO/SEO).
 */
export function PageHeader({
  title,
  eyebrow,
  breadcrumbs,
  width = 'product',
  children,
}: {
  title: string;
  eyebrow?: string;
  breadcrumbs?: Crumb[];
  width?: keyof typeof WIDTHS;
  /** Intro, meta lines and anything else above the page body. */
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-rand/70 bg-gradient-to-b from-krijt to-white">
      <div className={`mx-auto ${WIDTHS[width]} px-4 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-12`}>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`text-3xl text-inkt sm:text-4xl ${eyebrow ? 'mt-3' : ''}`}>{title}</h1>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

/** The page body under a PageHeader, at the same width. */
export function PageBody({ width = 'product', children }: { width?: keyof typeof WIDTHS; children: ReactNode }) {
  return <div className={`mx-auto ${WIDTHS[width]} px-4 pt-10 pb-14 sm:px-6`}>{children}</div>;
}
