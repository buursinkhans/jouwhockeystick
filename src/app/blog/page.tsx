import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllBlogPosts } from '@/content/blog';

export const metadata = pageMetadata({
  title: 'Blog',
  description:
    'Praktische artikelen over het kiezen en gebruiken van een hockeystick.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-lijngrijs">
        Praktische artikelen over het kiezen en gebruiken van een hockeystick.
      </p>

      <ul className="mt-8 space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-rand pb-6">
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-1 text-xs text-lijngrijs">
              Door {post.author} ·{' '}
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </p>
            <p className="mt-2 text-sm text-inkt/80">{post.intro}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
