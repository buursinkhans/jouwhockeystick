import { buildCompareTable } from '@/catalog/compare';
import type { SeriesStick } from '@/catalog/series';
import type { Product, SourcedValue } from '@/catalog/types';
import { TermHelp } from '@/components/ui/TermHelp';

/** Short source names in a cell; the note under the table says what they mean. */
const SOURCE_SHORT: Record<SourcedValue<unknown>['source'], string> = {
  'brand-website': 'Merksite',
  'partner-shop': 'Partnerwinkel',
  'fih-rules': 'FIH',
  'editorial-estimate': 'Inschatting',
};

/**
 * The rows of the series table: the values come from buildCompareTable (the
 * same ones as /vergelijk), the source of each value from the product's own
 * sourced field. A row only shows when buildCompareTable has it.
 */
const ROWS: {
  /** The label in buildCompareTable. */
  from: string;
  label: string;
  source: (product: Product) => SourcedValue<unknown> | undefined;
  term?: 'bow' | 'carbon' | 'level';
}[] = [
  { from: 'Ervaringsniveau', label: 'Niveau', source: (p) => p.experienceLevel, term: 'level' },
  { from: 'Bow-profiel', label: 'Kromming (bow)', source: (p) => p.bowProfile, term: 'bow' },
  { from: 'Carbonpercentage', label: 'Carbon', source: (p) => p.carbonPercentage, term: 'carbon' },
  { from: 'Gewicht', label: 'Gewicht', source: (p) => p.weightGrams },
  { from: 'Beschikbare lengtes', label: 'Lengtes in onze catalogus', source: (p) => p.lengthsInches },
  { from: 'Adviesprijs', label: 'Richtprijs', source: (p) => p.priceIndicativeEur },
];

export function SeriesSpecTable({ members, caption }: { members: readonly SeriesStick[]; caption: string }) {
  const table = buildCompareTable(members.map((m) => m.product));
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-rand">
              <th scope="col" className="py-2 pr-4 pl-2 text-sm font-semibold text-lijngrijs">
                Eigenschap
              </th>
              {members.map((m) => (
                <th key={m.product.slug} scope="col" className="py-2 pr-3 text-sm font-bold">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const cells = table.find((r) => r.label === row.from);
              if (!cells) return null;
              const differs = new Set(cells.values).size > 1;
              return (
                <tr key={row.label} className={`border-b border-rand ${differs ? 'bg-krijt' : ''}`}>
                  <th scope="row" className="w-1/4 py-3 pr-4 pl-2 align-top text-sm font-semibold text-inkt/80">
                    {row.label}
                    {differs && <span className="sr-only"> (verschilt)</span>}
                    {row.term && <TermHelp terms={[row.term]} label="Uitleg" />}
                  </th>
                  {members.map((m, i) => {
                    const sourced = row.source(m.product);
                    return (
                      <td key={m.product.slug} className={`py-3 pr-3 align-top ${differs ? 'font-semibold' : ''}`}>
                        {cells.values[i]}
                        {sourced && (
                          <span className="block text-xs font-normal text-lijngrijs">{SOURCE_SHORT[sourced.source]}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-lijngrijs">
        Onder elk gegeven staat de bron: de merksite, een partnerwinkel of onze eigen inschatting. De exacte bron en de
        datum van de laatste controle staan per gegeven op de pagina van elke stick. De richtprijs is geen winkelprijs;
        die staat hieronder.
      </p>
    </div>
  );
}
