import Link from 'next/link';
import { getFieldProducts, getIndoorProducts } from '@/catalog';
import { comparableSticks, pricedShoes } from '@/catalog/comparable';
import { productPath } from '@/catalog/paths';
import { getCuratedShoes, shoePath } from '@/catalog/shoes';
import { isJuniorStick } from '@/catalog/similar';
import type { Product } from '@/catalog/types';
import type { Shoe } from '@/catalog/shoes/types';
import { BLACK_FRIDAY, BLACK_FRIDAY_EDITION, BLACK_FRIDAY_PROMOS, formatNlDate } from '@/content/blackFriday';
import { FaqSection } from '@/components/article/FaqSection';
import { ShopPromoLink } from '@/components/campaign/ShopPromoLink';
import { ProductCard } from '@/components/catalog/ProductCard';
import { TrackedBlock } from '@/components/catalog/TrackedBlock';
import { ShoeCard } from '@/components/shoes/ShoeCard';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import { PartnerLinkNote } from '@/components/ui/PartnerLinkNote';
import { CheckIcon } from '@/components/ui/icons';
import { amsterdamDate, campaignPhase, sortShopPromos, type PromoState } from '@/lib/campaign';
import { itemListJsonLd, jsonLdHtml } from '@/lib/jsonLd';
import { RETAILERS } from '@/lib/retailers';
import { absoluteUrl, pageMetadata, SITE_NAME } from '@/lib/site';

export const metadata = pageMetadata({
  title: BLACK_FRIDAY.seoTitle,
  description: BLACK_FRIDAY.metaDescription,
  path: BLACK_FRIDAY.path,
});

// The phase (before, during, after) and the 14-day rules depend on the date: rebuild once a day.
export const revalidate = 86400;

const STATE_CLASS: Record<PromoState, string> = {
  actueel: 'bg-veld text-white',
  binnenkort: 'bg-mist text-veld',
  geen: 'bg-krijt text-inkt/80',
  onbekend: 'bg-krijt text-inkt/80',
  afgelopen: 'bg-krijt text-lijngrijs',
};

const label = (retailer: keyof typeof RETAILERS) => RETAILERS[retailer].label;

/**
 * /black-friday-hockey (decision log 2026-11-10): a yearly page with the
 * shops' actions as we checked them, sticks and shoes with a current price at
 * several shops, short buying advice and a FAQ. Server-rendered; the only
 * browser code is the click tracking. Never a percentage, a former price or a
 * countdown (CLAUDE.md, Commerce).
 */
export default function BlackFridayPage() {
  const now = new Date();
  const today = amsterdamDate(now);
  const phase = campaignPhase(BLACK_FRIDAY_EDITION, today);
  const url = absoluteUrl(BLACK_FRIDAY.path);

  const field = getFieldProducts(now);
  const groups: { id: string; heading: string; products: Product[]; more: { href: string; label: string } }[] = [
    { id: 'bf-sticks', heading: BLACK_FRIDAY.products.sticksHeading, products: comparableSticks(field.filter((p) => !isJuniorStick(p)), now), more: { href: '/sticks', label: BLACK_FRIDAY.products.more.sticks } },
    { id: 'bf-junior', heading: BLACK_FRIDAY.products.juniorHeading, products: comparableSticks(field.filter(isJuniorStick), now), more: { href: '/kennis/hockeystick-kinderen-en-beginners', label: 'Sticks voor kinderen' } },
    { id: 'bf-zaal', heading: BLACK_FRIDAY.products.zaalHeading, products: comparableSticks(getIndoorProducts(now), now), more: { href: '/zaalsticks', label: BLACK_FRIDAY.products.more.zaal } },
  ];
  const shoes: Shoe[] = pricedShoes(getCuratedShoes(), now);

  const rows = sortShopPromos(BLACK_FRIDAY_PROMOS, today, phase, label);
  const checkedDates = BLACK_FRIDAY_PROMOS.map((p) => p.verifiedAt).filter((d): d is string => d !== null);
  const lastCheck = checkedDates.length ? checkedDates.reduce((a, b) => (b > a ? b : a)) : null;

  // Describes only what is on the page: the collection, its author and dates.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: BLACK_FRIDAY.title,
    description: BLACK_FRIDAY.metaDescription,
    url,
    inLanguage: 'nl-NL',
    datePublished: BLACK_FRIDAY.publishedAt,
    dateModified: lastCheck && lastCheck > BLACK_FRIDAY.updatedAt ? lastCheck : BLACK_FRIDAY.updatedAt,
    author: { '@type': 'Organization', name: BLACK_FRIDAY.author },
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };
  // The sticks and shoes on the page, as links (no Product markup on an overview, as on /sticks).
  const itemList = itemListJsonLd(
    `Hockeysticks en hockeyschoenen om te vergelijken, Black Friday ${BLACK_FRIDAY_EDITION.year}`,
    url,
    [
      ...groups.flatMap((g) => g.products.map((p) => ({ name: p.name, url: absoluteUrl(productPath(p)) }))),
      ...shoes.map((s) => ({ name: `${s.brand} ${s.model}`, url: absoluteUrl(shoePath(s)) })),
    ],
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(itemList) }} />
      <PageHeader
        eyebrow={`Black Friday ${BLACK_FRIDAY_EDITION.year}`}
        title={BLACK_FRIDAY.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: BLACK_FRIDAY.navLabel, href: BLACK_FRIDAY.path },
        ]}
      >
        <p className="max-w-3xl text-lg text-inkt/80">{BLACK_FRIDAY.intro[phase]}</p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-inkt" aria-label="Op deze pagina">
          <li className="flex items-center gap-1.5">
            <CheckIcon size={16} className="text-veld" />
            {BLACK_FRIDAY.dateLine[phase]}
          </li>
          {lastCheck && phase !== 'afgelopen' && (
            <li className="flex items-center gap-1.5">
              <CheckIcon size={16} className="text-veld" />
              Acties nagekeken op <time dateTime={lastCheck}>{formatNlDate(lastCheck)}</time>
            </li>
          )}
        </ul>
        <p className="mt-5 max-w-3xl border-l-4 border-veld pl-4 font-semibold text-inkt">{BLACK_FRIDAY.promise}</p>
        <p className="mt-5 text-sm text-lijngrijs">
          Door {BLACK_FRIDAY.author} · gepubliceerd op <time dateTime={BLACK_FRIDAY.publishedAt}>{BLACK_FRIDAY.publishedAt}</time> · bijgewerkt op{' '}
          <time dateTime={BLACK_FRIDAY.updatedAt}>{BLACK_FRIDAY.updatedAt}</time>
        </p>
      </PageHeader>

      <PageBody>
        <section aria-labelledby="bf-routes-heading">
          <h2 id="bf-routes-heading" className="text-2xl font-bold">
            {BLACK_FRIDAY.routes.heading}
          </h2>
          <TrackedBlock page="black-friday" block="routes">
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {BLACK_FRIDAY.routes.items.map((route) => (
                <li key={route.href}>
                  <a href={route.href} className="card card-link flex h-full flex-col p-4 sm:p-5">
                    <span className="text-base font-bold text-inkt sm:text-lg">{route.title}</span>
                    <span className="mt-1 text-sm text-inkt/80">{route.body}</span>
                    <span className="mt-auto pt-3 text-sm font-semibold text-veld" aria-hidden="true">
                      Bekijk ↓
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </TrackedBlock>
        </section>

        <section className="mt-16" aria-labelledby="bf-shops-heading">
          <h2 id="bf-shops-heading" className="scroll-mt-24 text-2xl font-bold">
            {BLACK_FRIDAY.shops.heading}
          </h2>
          <p className="mt-1 max-w-3xl text-inkt/80">{phase === 'afgelopen' ? BLACK_FRIDAY.shops.afgelopen : BLACK_FRIDAY.shops.intro}</p>
          <ul className="mt-5 grid gap-4">
            {rows.map(({ promo, state }) => {
              const showDetails = state !== 'afgelopen' && state !== 'onbekend';
              return (
                <li key={promo.retailer} className="card p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="text-lg font-bold">{label(promo.retailer)}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATE_CLASS[state]}`}>{BLACK_FRIDAY.shops.stateLabel[state]}</span>
                    {showDetails && <span className="text-sm text-inkt/80">{BLACK_FRIDAY.shops.kindLabel[promo.kind]}</span>}
                  </div>
                  {state === 'afgelopen' ? null : <p className="mt-2 max-w-3xl text-inkt/80">{promo.summary}</p>}
                  {showDetails && (promo.startsAt || promo.endsAt) && (
                    <p className="mt-2 text-sm font-semibold text-inkt">
                      {promo.startsAt && <>Vanaf {formatNlDate(promo.startsAt)}</>}
                      {promo.startsAt && promo.endsAt && ' · '}
                      {promo.endsAt && <>Tot en met {formatNlDate(promo.endsAt)}</>}
                    </p>
                  )}
                  {showDetails && promo.conditions && <p className="mt-2 max-w-3xl text-sm text-inkt/80">{promo.conditions}</p>}
                  {(showDetails || promo.verifiedAt) && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {showDetails && (
                      <ShopPromoLink retailer={promo.retailer} url={promo.url} placement="blackfriday">
                        Bekijk bij {label(promo.retailer)}
                      </ShopPromoLink>
                    )}
                    {promo.verifiedAt && (
                      <p className="text-xs text-lijngrijs">
                        Nagekeken op <time dateTime={promo.verifiedAt}>{formatNlDate(promo.verifiedAt)}</time> op de site van de winkel
                      </p>
                    )}
                  </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 max-w-3xl text-xs text-lijngrijs">{BLACK_FRIDAY.shops.order}</p>
          <PartnerLinkNote />
        </section>

        {groups.map((group) => (
          <section key={group.id} className="mt-16" aria-labelledby={group.id}>
            <h2 id={group.id} className="scroll-mt-24 text-2xl font-bold">
              {group.heading}
            </h2>
            <p className="mt-1 max-w-3xl text-inkt/80">{BLACK_FRIDAY.products.intro}</p>
            {group.products.length > 0 ? (
              <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.products.map((product) => (
                  <li key={product.slug} className="h-full">
                    <ProductCard product={product} placement="blackfriday" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-inkt/80">{BLACK_FRIDAY.products.empty}</p>
            )}
            <TrackedBlock page="black-friday" block="routes">
              <p className="mt-4">
                <Link href={group.more.href} className="font-semibold text-veld underline underline-offset-2 hover:text-inkt">
                  {group.more.label}
                </Link>
              </p>
            </TrackedBlock>
          </section>
        ))}
        <p className="mt-4 max-w-3xl text-xs text-lijngrijs">{BLACK_FRIDAY.products.selection}</p>

        <section className="mt-16" aria-labelledby="bf-schoenen">
          <h2 id="bf-schoenen" className="scroll-mt-24 text-2xl font-bold">
            {BLACK_FRIDAY.products.shoesHeading}
          </h2>
          <p className="mt-1 max-w-3xl text-inkt/80">{BLACK_FRIDAY.products.shoesIntro}</p>
          {shoes.length > 0 && (
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shoes.map((shoe) => (
                <li key={shoe.slug} className="h-full">
                  <ShoeCard shoe={shoe} placement="blackfriday" />
                </li>
              ))}
            </ul>
          )}
          <TrackedBlock page="black-friday" block="routes">
            <p className="mt-4">
              <Link href="/hockeyschoenen" className="font-semibold text-veld underline underline-offset-2 hover:text-inkt">
                {BLACK_FRIDAY.products.more.schoenen}
              </Link>
            </p>
          </TrackedBlock>
        </section>

        <section className="mt-16 rounded-3xl border border-rand bg-krijt p-6 sm:p-8" aria-labelledby="bf-advies-heading">
          <h2 id="bf-advies-heading" className="text-2xl font-bold">
            {BLACK_FRIDAY.advice.heading}
          </h2>
          <p className="mt-1 max-w-3xl text-inkt/80">{BLACK_FRIDAY.advice.intro}</p>
          <TrackedBlock page="black-friday" block="advies">
            <ul className="mt-5 grid gap-5 sm:grid-cols-2">
              {BLACK_FRIDAY.advice.items.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-veld text-white">
                    <CheckIcon size={14} />
                  </span>
                  <p className="text-inkt/80">
                    <span className="block font-bold text-inkt">{item.title}</span>
                    {item.body}{' '}
                    <Link href={item.href} className="font-semibold text-veld underline underline-offset-2 hover:text-inkt">
                      {item.link}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-inkt/80">
              {BLACK_FRIDAY.advice.stickwijzer}{' '}
              <Link href="/stickwijzer" className="font-semibold text-veld underline underline-offset-2 hover:text-inkt">
                Doe de stickwijzer
              </Link>
            </p>
          </TrackedBlock>
        </section>

        <FaqSection
          id="bf-faq-heading"
          heading={BLACK_FRIDAY.faq.heading}
          items={BLACK_FRIDAY.faq.items}
          url={url}
          wrap={(list) => (
            <TrackedBlock page="black-friday" block="faq">
              {list}
            </TrackedBlock>
          )}
        />

        <section className="mt-12 max-w-3xl" aria-labelledby="bf-transparantie-heading">
          <h2 id="bf-transparantie-heading" className="text-xl font-bold">
            Hoe deze pagina werkt
          </h2>
          <p className="mt-2 text-inkt/80">{BLACK_FRIDAY.transparency}</p>
          <p className="mt-2 text-sm">
            <Link href="/methodiek" className="font-semibold text-veld underline underline-offset-2 hover:text-inkt">
              Zo werkt ons advies
            </Link>
          </p>
        </section>
      </PageBody>
    </>
  );
}
