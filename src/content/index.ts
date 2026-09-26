import type { Article } from './types';
import { hoeKiesJeDeJuisteHockeystick } from './articles/hoe-kies-je-de-juiste-hockeystick';

const ALL_ARTICLES: Article[] = [hoeKiesJeDeJuisteHockeystick];

export function getAllArticles(): Article[] {
  return ALL_ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ALL_ARTICLES.find((article) => article.slug === slug);
}
