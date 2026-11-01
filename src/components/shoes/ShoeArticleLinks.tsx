import Link from 'next/link';
import type { ShoeArticleLink } from '@/content/shoeArticles';

/** "Meer weten over hockeyschoenen": the live shoe articles; nothing while there are none. */
export function ShoeArticleLinks({ links, headingLevel = 2 }: { links: readonly ShoeArticleLink[]; headingLevel?: 2 | 3 }) {
  if (links.length === 0) return null;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section aria-labelledby="schoenartikelen-kop" className="mt-10">
      <Heading id="schoenartikelen-kop" className={headingLevel === 2 ? 'text-2xl font-bold' : 'text-xl font-bold'}>
        Meer weten over hockeyschoenen
      </Heading>
      <ul className="mt-3 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-11 items-center font-semibold text-veld hover:underline">
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
