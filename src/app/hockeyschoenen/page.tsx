import Link from 'next/link';
import { SHOES_PATH, getCuratedShoes, getImportedShoes } from '@/catalog/shoes';
import type { Shoe } from '@/catalog/shoes/types';
import { InlineText } from '@/components/article/InlineText';
import { TrackedBlock } from '@/components/catalog/TrackedBlock';
import { FitCheck } from '@/components/shoes/FitCheck';
import { ImportedShoes } from '@/components/shoes/ImportedShoes';
import { ShoeCard } from '@/components/shoes/ShoeCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { CERTAINTY_TEXT, HOCKEYSCHOENEN } from '@/content/hockeyschoenen';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: HOCKEYSCHOENEN.seoTitle,
  description: HOCKEYSCHOENEN.metaDescription,
  path: SHOES_PATH,
});

type TypeFilter = 'veld' | 'zaal';
type AgeFilter = 'junior' | 'senior';

const asType = (value: string | undefined): TypeFilter | undefined => (value === 'veld' || value === 'zaal' ? value : undefined);
const asAge = (value: string | undefined): AgeFilter | undefined => (value === 'junior' || value === 'senior' ? value : undefined);

/** Filter links keep the other filter; the canonical stays /hockeyschoenen. */
function filterHref(type: TypeFilter | undefined, age: AgeFilter | undefined): string {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (age) params.set('leeftijd', age);
  const query = params.toString();
  return query ? `${SHOES_PATH}?${query}` : SHOES_PATH;
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${
        active ? 'border-veld bg-veld text-white' : 'border-lijngrijs text-inkt/80 hover:border-veld'
      }`}
    >
      {children}
    </Link>
  );
}

export default async function HockeyschoenenPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; leeftijd?: string }>;
}) {
  const params = await searchParams;
  const type = asType(params.type);
  const age = asAge(params.leeftijd);
  // A model with unknown field/indoor only shows without a type filter: unknown is never a match.
  const matches = (shoe: Shoe) => (!type || shoe.category.value === type) && (!age || shoe.ageGroup === age);
  const checked = getCuratedShoes().filter(matches);
  const feedCount = getImportedShoes().filter(matches).length;
  const { filters } = HOCKEYSCHOENEN;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Hockeyschoenen', href: SHOES_PATH },
        ]}
      />
      <h1 className="text-3xl font-extrabold sm:text-4xl">{HOCKEYSCHOENEN.title}</h1>
      <p className="mt-2 text-sm text-lijngrijs">
        Door {HOCKEYSCHOENEN.author} · gepubliceerd op{' '}
        <time dateTime={HOCKEYSCHOENEN.publishedAt}>{HOCKEYSCHOENEN.publishedAt}</time> · bijgewerkt op{' '}
        <time dateTime={HOCKEYSCHOENEN.updatedAt}>{HOCKEYSCHOENEN.updatedAt}</time>
      </p>
      <TrackedBlock page="hockeyschoenen" block="intro">
        <p className="mt-5 max-w-3xl text-lg text-inkt/80">
          <InlineText text={HOCKEYSCHOENEN.intro} />
        </p>
        <ButtonLink href="/hockeyschoenen/wijzer" className="mt-5">
          {HOCKEYSCHOENEN.wizardButton}
        </ButtonLink>
      </TrackedBlock>

      <TrackedBlock page="hockeyschoenen" block="filters">
        <nav aria-label={filters.legend} className="mt-8 space-y-2">
          <div className="flex flex-wrap gap-2">
            <FilterLink href={filterHref(undefined, age)} active={!type}>
              {filters.type.all}
            </FilterLink>
            <FilterLink href={filterHref('veld', age)} active={type === 'veld'}>
              {filters.type.veld}
            </FilterLink>
            <FilterLink href={filterHref('zaal', age)} active={type === 'zaal'}>
              {filters.type.zaal}
            </FilterLink>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterLink href={filterHref(type, undefined)} active={!age}>
              {filters.age.all}
            </FilterLink>
            <FilterLink href={filterHref(type, 'junior')} active={age === 'junior'}>
              {filters.age.junior}
            </FilterLink>
            <FilterLink href={filterHref(type, 'senior')} active={age === 'senior'}>
              {filters.age.senior}
            </FilterLink>
          </div>
        </nav>
      </TrackedBlock>

      <TrackedBlock page="hockeyschoenen" block="modellen">
        <section aria-labelledby="gecontroleerd-kop" className="mt-10">
          <h2 id="gecontroleerd-kop" className="text-2xl font-bold">
            {HOCKEYSCHOENEN.checked.heading} <span className="font-normal text-lijngrijs">({checked.length})</span>
          </h2>
          <p className="mt-2 max-w-3xl text-inkt/80">{HOCKEYSCHOENEN.checked.intro}</p>
          {checked.length === 0 ? (
            <p className="mt-4 text-inkt/80">{HOCKEYSCHOENEN.checked.none}</p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {checked.map((shoe) => (
                <li key={shoe.slug}>
                  <ShoeCard shoe={shoe} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="feed-kop" className="mt-12">
          <h2 id="feed-kop" className="text-2xl font-bold">
            {HOCKEYSCHOENEN.feed.heading} <span className="font-normal text-lijngrijs">({feedCount})</span>
          </h2>
          <p className="mt-2 max-w-3xl text-inkt/80">{HOCKEYSCHOENEN.feed.intro}</p>
          {feedCount === 0 ? (
            <p className="mt-4 text-inkt/80">{HOCKEYSCHOENEN.feed.none}</p>
          ) : (
            // Loaded after a click, like the imported sticks: not in the first page load.
            <ImportedShoes count={feedCount} type={type} age={age} />
          )}
        </section>
      </TrackedBlock>

      <section aria-labelledby="status-kop" className="mt-12 max-w-3xl">
        <h2 id="status-kop" className="text-2xl font-bold">
          {HOCKEYSCHOENEN.status.heading}
        </h2>
        <dl className="mt-3 space-y-3">
          {Object.values(CERTAINTY_TEXT).map(({ label, text }) => (
            <div key={label}>
              <dt className="font-semibold">{label}</dt>
              <dd className="text-inkt/80">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <TrackedBlock page="hockeyschoenen" block="pascontrole">
        <div className="max-w-3xl">
          <FitCheck />
        </div>
      </TrackedBlock>
    </div>
  );
}
