import { pageMetadata, CONTACT_EMAIL, SITE_URL } from '@/lib/site';
import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
import { CLUBS_PAGE } from '@/content/clubs';
import { formatInch } from '@/content/stickwijzer/resultCopy';
import { ButtonLink } from '@/components/ui/Button';

export const metadata = pageMetadata({
  title: CLUBS_PAGE.title,
  description: CLUBS_PAGE.metaDescription,
  path: '/clubs',
});

const CM_PER_INCH = 2.54;

export default function ClubsPage() {
  const lastIndex = LENGTH_GUIDE.length - 1;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 print:max-w-none print:py-0">
      <h1 className="text-3xl font-bold">{CLUBS_PAGE.title}</h1>
      <p className="mt-2 text-sm text-lijngrijs print:hidden">
        Door {CLUBS_PAGE.author} · gepubliceerd op{' '}
        <time dateTime={CLUBS_PAGE.publishedAt}>{CLUBS_PAGE.publishedAt}</time>{' '}
        · laatst gewijzigd op{' '}
        <time dateTime={CLUBS_PAGE.updatedAt}>{CLUBS_PAGE.updatedAt}</time>
      </p>
      <div className="mt-6 space-y-4 text-inkt print:hidden">
        {CLUBS_PAGE.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <ButtonLink href="/stickwijzer">Naar de stickwijzer</ButtonLink>
        <ButtonLink href="#lengtetabel" variant="secondary">
          Naar de lengtetabel
        </ButtonLink>
      </div>

      <section aria-labelledby="nieuwsbrief" className="mt-10 print:hidden">
        <h2 id="nieuwsbrief" className="text-xl font-bold">
          {CLUBS_PAGE.newsletterHeading}
        </h2>
        <p className="mt-3 text-inkt/80">{CLUBS_PAGE.newsletterIntro}</p>
        <blockquote className="mt-4 space-y-3 rounded-md border border-rand bg-white p-4 text-inkt">
          {CLUBS_PAGE.newsletterText.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </blockquote>
      </section>

      <section aria-labelledby="lengtetabel" className="mt-10 print:mt-6">
        <h2 id="lengtetabel" className="text-xl font-bold">
          {CLUBS_PAGE.tableHeading}
        </h2>
        <p className="mt-3 text-inkt/80 print:hidden">{CLUBS_PAGE.tableIntro}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm print:text-base">
            <caption className="sr-only">
              Sticklengte per lichaamslengte
            </caption>
            <thead>
              <tr className="border-b border-lijngrijs">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Lichaamslengte
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Sticklengte
                </th>
                <th scope="col" className="py-2 font-semibold">
                  In centimeters
                </th>
              </tr>
            </thead>
            <tbody>
              {LENGTH_GUIDE.map((band, index) => (
                <tr key={band.minCm} className="border-b border-rand">
                  <td className="py-2 pr-4">
                    {index === lastIndex
                      ? `${band.minCm} cm en langer`
                      : `${band.minCm}–${band.maxCm} cm`}
                  </td>
                  <td className="py-2 pr-4">
                    {band.sizes.map(formatInch).join(' of ')}
                  </td>
                  <td className="py-2">
                    {band.sizes
                      .map((inch) => `ca. ${Math.round(inch * CM_PER_INCH)} cm`)
                      .join(' / ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-inkt/80">{CLUBS_PAGE.tableNote}</p>
        <p className="mt-2 hidden text-sm print:block">
          Persoonlijk stickadvies: {SITE_URL.replace('https://', '')}/stickwijzer
        </p>
      </section>

      <section aria-labelledby="wie" className="mt-10 print:hidden">
        <h2 id="wie" className="text-xl font-bold">
          {CLUBS_PAGE.honestyHeading}
        </h2>
        <div className="mt-3 space-y-3 text-inkt/80">
          {CLUBS_PAGE.honesty.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
