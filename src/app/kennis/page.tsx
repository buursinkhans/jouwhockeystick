import Link from 'next/link';
import { getAllArticles } from '@/content';
import { groupArticles, readingMinutes } from '@/content/kennisThemes';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Kennisbank',
  description:
    'Uitleg over hockeysticks: de lengte tabel, low bow of mid bow, sticks voor kinderen en beginners, en alle begrippen kort uitgelegd.',
  path: '/kennis',
});

const DUTCH_DATE = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function KennisIndexPage() {
  const groups = groupArticles(getAllArticles());

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
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

      <nav aria-label="Thema's" className="mt-6 flex flex-wrap gap-2">
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="inline-flex min-h-11 items-center rounded-full border border-rand bg-white px-4 text-sm font-medium text-inkt/80 hover:border-veld hover:text-veld"
          >
            {group.heading} <span className="ml-1 text-lijngrijs">({group.articles.length})</span>
          </a>
        ))}
      </nav>

      {groups.map((group) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`} className="mt-12 scroll-mt-24">
          <h2 id={`${group.id}-heading`} className="text-2xl font-bold">
            {group.heading}
          </h2>
          {group.intro && <p className="mt-1 text-inkt/80">{group.intro}</p>}
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {group.articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/kennis/${article.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-rand bg-white p-5 hover:border-veld"
                >
                  <h3 className="text-lg leading-snug font-semibold text-inkt">{article.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-inkt/80">{article.metaDescription}</p>
                  <p className="mt-auto pt-4 text-xs text-lijngrijs">
                    {readingMinutes(article)} min lezen · bijgewerkt op{' '}
                    <time dateTime={article.updatedAt}>{DUTCH_DATE.format(new Date(`${article.updatedAt}T00:00:00Z`))}</time>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
