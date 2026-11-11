import { getTrustFacts } from '@/catalog/trustFacts';
import { COMPARISON_HEADING, COMPARISON_INTRO, ORDER_PROMISE, comparisonRows } from '@/content/trust';
import { PromiseList } from '@/components/trust/PromiseList';

/**
 * "Waarom jouwhockeystick.nl" on the homepage (redesign fase 4): counted
 * facts, the four promises with the page that shows each, and an honest
 * comparison with buying at one webshop. No reviews or user numbers: we
 * show only what the catalog and the feeds prove.
 */
export function WhyUs() {
  const facts = getTrustFacts();
  return (
    <section aria-labelledby="waarom-heading" className="bg-krijt">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="eyebrow">Waarom jouwhockeystick.nl</p>
        <h2 id="waarom-heading" className="mt-3 max-w-3xl text-3xl text-inkt sm:text-[2.5rem]">
          Advies waarin winkelvergoedingen niet meetellen, met alles om het te controleren
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-inkt/80">{ORDER_PROMISE}</p>

        <div className="mt-10">
          <PromiseList />
        </div>

        <div className="mt-14">
          <h3 className="text-2xl font-bold">{COMPARISON_HEADING}</h3>
          <p className="mt-2 max-w-2xl text-inkt/80">{COMPARISON_INTRO}</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-rand bg-white">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <caption className="sr-only">Eén webshop vergeleken met jouwhockeystick.nl</caption>
              <thead>
                <tr className="border-b border-rand bg-krijt">
                  <th scope="col" className="w-28 px-4 py-3 font-semibold text-lijngrijs">
                    <span className="sr-only">Onderwerp</span>
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-inkt/80">Bij één webshop</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-veld">Bij jouwhockeystick.nl</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows(facts).map((row) => (
                  <tr key={row.topic} className="border-b border-rand last:border-0">
                    <th scope="row" className="px-4 py-3 align-top font-semibold">{row.topic}</th>
                    <td className="px-4 py-3 align-top text-inkt/80">{row.webshop}</td>
                    <td className="px-4 py-3 align-top font-medium text-inkt">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-lijngrijs">
            Je koopt altijd bij de winkel zelf; die is de verkoper. Cijfers zijn geteld uit onze catalogus en de productfeeds van de winkels.
          </p>
      </div>
      </div>
    </section>
  );
}
