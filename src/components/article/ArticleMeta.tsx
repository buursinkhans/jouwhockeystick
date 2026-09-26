import type { Article } from '@/content/types';

export function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="text-sm text-zinc-500">
      Door {article.author} · gepubliceerd op{' '}
      <time dateTime={article.publishedAt}>{article.publishedAt}</time>
      {article.updatedAt !== article.publishedAt && (
        <>
          {' '}
          · gewijzigd op <time dateTime={article.updatedAt}>{article.updatedAt}</time>
        </>
      )}
    </p>
  );
}
