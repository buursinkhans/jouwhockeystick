import Link from 'next/link';
import { getAllArticles } from '@/content';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Kennisbank',
  description:
    'Uitleg over hockeysticks: de lengte tabel, low bow of mid bow, sticks voor kinderen en beginners, en alle begrippen kort uitgelegd.',
  path: '/kennis',
});

export default function KennisIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennisbank', href: '/kennis' },
        ]}
      />
      <h1 className="text-3xl font-bold">Kennisbank</h1>
      <p className="mt-2 text-inkt/80">
        Uitleg over de keuzes achter een hockeystick. Wil je weten hoe je alles
        samen afweegt? Lees{' '}
        <Link
          href="/blog/hockeystick-kopen"
          className="text-veld underline underline-offset-2"
        >
          hockeystick kopen: zo kies je een stick die bij je past
        </Link>{' '}
        of doe de{' '}
        <Link
          href="/stickwijzer"
          className="text-veld underline underline-offset-2"
        >
          stickwijzer
        </Link>
        .
      </p>

      <ul className="mt-8 space-y-6">
        {articles.map((article) => (
          <li key={article.slug} className="border-b border-rand pb-6">
            <h2 className="text-xl font-semibold">
              <Link
                href={`/kennis/${article.slug}`}
                className="hover:underline"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-inkt/80">
              {article.metaDescription}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
