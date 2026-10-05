import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { notFound } from 'next/navigation';
import { getAllBlogPosts, getBlogPostBySlug } from '@/content/blog';
import { ArticleBody } from '@/components/article/ArticleBody';
import { ArticleMeta } from '@/components/article/ArticleMeta';
import { SourceList } from '@/components/article/SourceList';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {};
  }
  return pageMetadata({
    title: post.title,
    description: post.metaDescription,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: { '@type': 'Organization', name: post.author },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    description: post.metaDescription,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <div className="mt-2">
        <ArticleMeta article={post} />
      </div>
      <div className="mt-6">
        <ArticleBody article={post} />
      </div>
      <SourceList sources={post.sources} />
    </div>
  );
}
