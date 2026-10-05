import Link from 'next/link';
import { EXPERIENCE_LABELS } from '@/catalog/labels';
import type { Product } from '@/catalog/types';
import { LESS_SUITABLE_FOR } from '@/content/stickwijzer/resultCopy';
import {
  SOURCE_DISPLAY_LABEL,
  buildProductSourceRecords,
} from '@/sources/productSources';

const SUITABLE_FOR: Record<Product['experienceLevel']['value'], string> = {
  beginner:
    'Een logische richting voor beginnende spelers die aan aannemen, passen en dribbelen werken.',
  gevorderd:
    'Een logische richting voor spelers die de basis beheersen en zich verder ontwikkelen.',
  ervaren:
    'Een logische richting voor ervaren spelers die gericht op hun acties kiezen.',
};

/**
 * "Voor wie wel / voor wie niet" plus the full source list — the fixed,
 * citable page order for product pages (implementation spec §9.9).
 */
export function ProductFitAndSources({ product }: { product: Product }) {
  const level = product.experienceLevel.value;
  const sources = buildProductSourceRecords(product);
  const lastChecked = sources.reduce(
    (latest, source) => (source.checkedAt > latest ? source.checkedAt : latest),
    '',
  );

  return (
    <>
      <h2 className="mt-10 text-xl font-bold">Voor wie is deze stick?</h2>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="font-semibold">
            Past doorgaans bij: {EXPERIENCE_LABELS[level].toLowerCase()}
          </dt>
          <dd className="text-zinc-700">{SUITABLE_FOR[level]}</dd>
        </div>
        <div>
          <dt className="font-semibold">Minder passend</dt>
          <dd className="text-zinc-700">{LESS_SUITABLE_FOR[level]}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-zinc-600">
        Dit is onze redactionele inschatting op basis van de vermelde
        specificaties, geen garantie. De{' '}
        <Link
          href="/stickwijzer"
          className="font-semibold text-emerald-800 hover:underline"
        >
          stickwijzer
        </Link>{' '}
        weegt ook lengte, speelwensen en budget mee.
      </p>

      <h2 className="mt-10 text-xl font-bold">Bronnen en methode</h2>
      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
        {sources.map((source) => (
          <li key={source.id}>
            <span className="font-semibold">
              {SOURCE_DISPLAY_LABEL[source.sourceType]}
            </span>{' '}
            — {source.publisher}: {source.claimSummary}. Gecontroleerd op{' '}
            <time dateTime={source.checkedAt}>{source.checkedAt}</time>.
            {source.url && (
              <>
                {' '}
                <a
                  href={source.url}
                  rel="noopener noreferrer"
                  className="text-emerald-800 underline"
                >
                  Bron bekijken
                </a>
              </>
            )}
          </li>
        ))}
        <li>
          <span className="font-semibold">Eigen meting</span> — niet gemeten.
        </li>
        <li>
          <span className="font-semibold">Praktijktest</span> — nog niet getest.
        </li>
      </ul>
      <p className="mt-3 text-sm text-zinc-600">
        Gegevens laatst gecontroleerd op{' '}
        <time dateTime={lastChecked}>{lastChecked}</time>.{' '}
        <Link
          href="/methodiek"
          className="font-semibold text-emerald-800 hover:underline"
        >
          Hoe komt ons advies tot stand?
        </Link>
      </p>
    </>
  );
}
