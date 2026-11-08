import type { Article } from './types';
import { getAllArticles } from './index';

/**
 * The shoe articles of the content briefs (#127–#132, phase 4 of #100), by
 * agreed slug. The shoe pages and the schoenenwijzer link to them as soon as
 * they are live, without another code change (decision log 2026-11-01).
 * Server only: pages pass the links on as props.
 */
export const SHOE_ARTICLE_SLUGS = [
  'welke-hockeyschoenen-heb-je-nodig',
  'hockeyschoenen-waterveld-zandveld',
  'hockeyschoenen-kinderen-maat',
  'hockeyschoenen-smalle-brede-voet',
  'zaalhockeyschoenen-of-indoorschoenen',
  'hockeyschoenen-versleten',
] as const;

export type ShoeArticleLink = { href: string; title: string };

/** The shoe articles a visitor can read now, in the order above; none until they are live. */
export function shoeArticleLinks(articles: readonly Pick<Article, 'slug' | 'title'>[] = getAllArticles()): ShoeArticleLink[] {
  return SHOE_ARTICLE_SLUGS.flatMap((slug) => {
    const article = articles.find((a) => a.slug === slug);
    return article ? [{ href: `/kennis/${slug}`, title: article.title }] : [];
  });
}

/** One shoe article by its agreed slug, when it is live; otherwise null. */
export function shoeArticleLink(
  slug: (typeof SHOE_ARTICLE_SLUGS)[number],
  articles: readonly Pick<Article, 'slug' | 'title'>[] = getAllArticles(),
): ShoeArticleLink | null {
  return shoeArticleLinks(articles).find((link) => link.href === `/kennis/${slug}`) ?? null;
}
