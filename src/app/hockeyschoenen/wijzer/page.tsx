import { getCuratedShoes, getShoeListings } from '@/catalog/shoes';
import { bySize } from '@/catalog/shoeFeed';
import { ShoeQuiz } from '@/components/schoenenwijzer/ShoeQuiz';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { shoeArticleLinks } from '@/content/shoeArticles';
import { sizeKey } from '@/shoe-advice/engine';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Schoenenwijzer: welke hockeyschoenen passen bij jou?',
  description:
    'Beantwoord acht vragen over veld of zaal, je ondergrond, je pasvorm en je spel. Je krijgt maximaal drie hockeyschoenen met de redenen, wat je nog moet controleren en de bron.',
  path: '/hockeyschoenen/wijzer',
});

/** The sizes the shops list for the checked models, once each ("41,5" and "41 1/2" are one size). */
function sizeOptions(): string[] {
  const byKey = new Map<string, string>();
  for (const shoe of getCuratedShoes()) {
    for (const listing of getShoeListings(shoe.slug)) {
      for (const size of listing.sizes) if (!byKey.has(sizeKey(size))) byKey.set(sizeKey(size), size);
    }
  }
  return [...byKey.values()].sort(bySize);
}

export default function SchoenenwijzerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Hockeyschoenen', href: '/hockeyschoenen' },
          { label: 'Schoenenwijzer', href: '/hockeyschoenen/wijzer' },
        ]}
      />
      <h1 className="text-3xl font-extrabold sm:text-4xl">Schoenenwijzer</h1>
      <p className="mt-3 text-lg text-inkt/80">
        Welke hockeyschoenen passen bij jou? Eerst kijken we naar veld of zaal en je ondergrond, dan naar je pasvorm, je gebruik en je
        spel. Je krijgt maximaal drie modellen, met waarom ze in je selectie staan en wat je bij het passen nog moet controleren. Het
        is een pasadvies, geen garantie en geen medisch advies.
      </p>
      <div className="mt-8">
        <ShoeQuiz sizes={sizeOptions()} articles={shoeArticleLinks()} />
      </div>
    </div>
  );
}
