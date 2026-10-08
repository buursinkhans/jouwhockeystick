import type { Metadata } from 'next';
import { absoluteUrl, pageMetadata, SITE_NAME } from '@/lib/site';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticleBySlug } from '@/content';
import { ArticleBody } from '@/components/article/ArticleBody';
import { ArticleMeta } from '@/components/article/ArticleMeta';
import { SourceList } from '@/components/article/SourceList';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return {};
  }
  return pageMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/kennis/${slug}`,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: { '@type': 'Organization', name: article.author },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    description: article.metaDescription,
    mainEntityOfPage: absoluteUrl(`/kennis/${article.slug}`),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennisbank', href: '/kennis' },
          { label: article.title, href: `/kennis/${article.slug}` },
        ]}
      />
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <div className="mt-2">
        <ArticleMeta article={article} />
      </div>
      <div className="mt-6">
        <ArticleBody article={article} />
      </div>
      <SourceList sources={article.sources} />
    </div>
  );
}
