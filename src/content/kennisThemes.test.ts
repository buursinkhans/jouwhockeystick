import { describe, expect, it } from 'vitest';
import { getArticlesIncludingScheduled } from './index';
import { groupArticles, readingMinutes } from './kennisThemes';
import type { Article } from './types';

const articles = getArticlesIncludingScheduled();

describe('groupArticles', () => {
  it('shows every article exactly once', () => {
    const shown = groupArticles(articles).flatMap((group) => group.articles.map((a) => a.slug));
    expect([...shown].sort()).toEqual(articles.map((a) => a.slug).sort());
  });

  it('puts an article without a theme under "Meer uitleg" instead of dropping it', () => {
    const newArticle = { ...articles[0]!, slug: 'nieuw-artikel' } as Article;
    const groups = groupArticles([...articles, newArticle]);
    expect(groups.at(-1)?.heading).toBe('Meer uitleg');
    expect(groups.at(-1)?.articles.map((a) => a.slug)).toEqual(['nieuw-artikel']);
  });
});

describe('readingMinutes', () => {
  it('is at least one minute and grows with the text', () => {
    expect(readingMinutes({ intro: 'kort', sections: [] })).toBe(1);
    const long = { intro: 'woord '.repeat(1000), sections: [] };
    expect(readingMinutes(long)).toBe(5);
  });
});
