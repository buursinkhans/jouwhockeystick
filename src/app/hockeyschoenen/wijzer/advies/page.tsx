import Link from 'next/link';
import { ShoeAdviceView } from '@/components/schoenenwijzer/ShoeAdviceView';
import { shoeArticleLinks } from '@/content/shoeArticles';
import { shoeAnswersSchema } from '@/shoe-advice/answers';
import { shoeAdviceCatalog } from '@/shoe-advice/catalog';
import { getShoeAdvice } from '@/shoe-advice/engine';
import { SHOE_SHARE_PATH } from '@/shoe-advice/share';
import { readShare, shareHref } from '@/lib/shareAdvice';
import { pageMetadata } from '@/lib/site';

// A shared advice is personal: never in Google, never in the sitemap.
export const metadata = pageMetadata({
  title: 'Gedeeld schoenadvies',
  description: 'Een schoenadvies dat iemand met je heeft gedeeld, berekend met de schoenenwijzer van jouwhockeystick.nl.',
  path: SHOE_SHARE_PATH,
  noIndex: true,
});

// Recalculated on every visit, so prices and stock are those of today.
export const dynamic = 'force-dynamic';

/** A shared shoe advice: the link holds the answers without question 7, so the fit particulars are never in it. */
export default async function SharedShoeAdvicePage({ searchParams }: { searchParams: Promise<{ a?: string | string[]; s?: string | string[] }> }) {
  const shared = readShare(await searchParams);
  const parsed = shared ? shoeAnswersSchema.safeParse(shared.answers) : null;

  if (!shared || !parsed?.success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold">Gedeeld schoenadvies</h1>
        <p className="mt-4 text-inkt/80">
          Deze link werkt niet (meer). Misschien is hij niet helemaal meegekopieerd. Je kunt de schoenenwijzer ook zelf invullen.
        </p>
        <Link href="/hockeyschoenen/wijzer" className="mt-6 inline-flex rounded-full bg-bal px-5 py-3 text-sm font-semibold text-inkt hover:bg-bal/90">
          Start de schoenenwijzer
        </Link>
      </div>
    );
  }

  const advice = getShoeAdvice(parsed.data, shoeAdviceCatalog());
  const slugs = advice.kind === 'advice' ? advice.advices.flatMap((a) => a.items.map((i) => i.shoe.slug)) : [];
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Gedeeld schoenadvies</h1>
      <p className="mt-2 text-inkt/80">
        Iemand heeft dit advies uit de{' '}
        <Link href="/hockeyschoenen/wijzer" className="font-semibold text-veld hover:underline">
          schoenenwijzer
        </Link>{' '}
        met je gedeeld. Prijzen en voorraad zijn die van vandaag.
      </p>
      <div className="mt-8">
        <ShoeAdviceView advice={advice} answers={parsed.data} articles={shoeArticleLinks()} shareHref={shareHref(parsed.data, slugs, SHOE_SHARE_PATH)} />
      </div>
    </div>
  );
}
