import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { seriesForProduct, seriesPath } from '@/catalog/series';
import { seriesTitle } from '@/content/series';

/**
 * On the page of a stick that belongs to a series comparison (wave 1,
 * 2026-11-22): a plain text link to it. Only series that pass the gate
 * against thin pages (`seriesForProduct`), so it never links to a noindex page.
 */
export function SeriesLinks({ product }: { product: Product }) {
  const series = seriesForProduct(product);
  if (series.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="series-links-heading">
      <h2 id="series-links-heading" className="text-xl font-bold">
        Vergelijk met de rest van de reeks
      </h2>
      <ul className="mt-3 space-y-2">
        {series.map((evaluation) => (
          <li key={evaluation.series.slug}>
            <Link href={seriesPath(evaluation.series.slug)} className="font-semibold text-veld hover:underline">
              {seriesTitle(evaluation)}
            </Link>
            <span className="text-inkt/80"> met de tabel, de prijs per stick en de verschillen op een rij.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
