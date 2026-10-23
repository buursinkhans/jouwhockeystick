import { productPath } from '@/catalog/paths';
import Link from 'next/link';
import type { ProductFamily } from '@/catalog/family';
import { EXPERIENCE_LABELS } from '@/catalog/labels';
import type { Product } from '@/catalog/types';

/**
 * The models of one brand family side by side (e.g. Grays JB 6 → JB 12+),
 * built from catalog data only, so prices and carbon stay current. Answers
 * the question "what is the difference between the JB 6 and the JB 10?".
 */
export function FamilyTable({
  current,
  family,
}: {
  current: Product;
  family: ProductFamily;
}) {
  const shortName = (p: Product) =>
    p.name.replace(/(\s+composite)?(\s+hockey\s*stick)?\s*$/i, '');

  return (
    <section className="mt-10" aria-labelledby="family-heading">
      <h2 id="family-heading" className="text-xl font-bold">
        De {family.family}-lijn van {family.brand}
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-inkt/80">
        Deze sticks horen bij dezelfde krommingsfamilie van {family.brand}. Ze
        verschillen vooral in carbonpercentage, het niveau waarvoor ze bedoeld
        zijn en de prijs. Meer carbon maakt een stick doorgaans stijver, wat kan
        passen bij ervaren spelers; het is niet automatisch beter.{' '}
        <Link
          href="/kennis/meer-carbon-hockeystick-beter"
          className="text-veld underline underline-offset-2"
        >
          Lees waarom
        </Link>
        .
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <caption className="sr-only">
            Modellen in de {family.family}-lijn van {family.brand}
          </caption>
          <thead>
            <tr className="border-b border-rand text-lijngrijs">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Model
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Carbon
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Niveau
              </th>
              <th scope="col" className="py-2 font-semibold">
                Richtprijs
              </th>
            </tr>
          </thead>
          <tbody>
            {family.members.map((p) => {
              const isCurrent = p.slug === current.slug;
              return (
                <tr
                  key={p.slug}
                  className={`border-b border-rand ${isCurrent ? 'bg-krijt font-semibold' : ''}`}
                >
                  <th scope="row" className="py-2 pr-3 font-normal">
                    {isCurrent ? (
                      <span className="font-semibold">
                        {shortName(p)}{' '}
                        <span className="text-lijngrijs">(deze stick)</span>
                      </span>
                    ) : (
                      <Link
                        href={productPath(p)}
                        className="text-veld hover:underline"
                      >
                        {shortName(p)}
                      </Link>
                    )}
                  </th>
                  <td className="py-2 pr-3">
                    {p.carbonPercentage
                      ? `${p.carbonPercentage.value}%`
                      : 'niet vermeld'}
                  </td>
                  <td className="py-2 pr-3">
                    {EXPERIENCE_LABELS[p.experienceLevel.value]}
                  </td>
                  <td className="py-2">
                    €{p.priceIndicativeEur.value.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-lijngrijs">
        Richtprijzen en specificaties uit onze catalogus, met de bron per
        gegeven op de pagina van elke stick. Geen live winkelprijzen.
      </p>
    </section>
  );
}
