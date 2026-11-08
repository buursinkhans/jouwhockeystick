import { plainText } from '@/components/article/inlineMarkup';

/** A visible question with its answer; the answer may hold the site's inline markup (links, bold). */
export type FaqItem = { question: string; answer: string };

/**
 * FAQPage structured data from the questions that are visible on the page
 * (CLAUDE.md, GEO/SEO): the same text, without markup. Built from the same
 * array the page renders, so the two can never drift apart.
 */
export function faqJsonLd(items: readonly FaqItem[], url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: plainText(item.answer) },
    })),
  };
}
