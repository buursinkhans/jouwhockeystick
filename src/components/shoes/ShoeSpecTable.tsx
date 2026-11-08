import type { SourcedValue } from '@/catalog/types';
import type { Shoe } from '@/catalog/shoes/types';
import { CATEGORY_LABEL, PROPERTY_LABEL, SOURCE_KIND_LABEL, SUITABILITY_LABEL } from '@/content/hockeyschoenen';

type Key = keyof typeof PROPERTY_LABEL;

/** The rows that matter for this kind of shoe: surfaces for field, non-marking for indoor (keuzemodel §2 order). */
function rowsFor(shoe: Shoe): Key[] {
  const surfaces: Key[] = ['surfaceWater', 'surfaceSand', 'surfaceSemiWaterHybrid'];
  const where: Key[] =
    shoe.category.value === 'veld' ? surfaces : shoe.category.value === 'zaal' ? ['indoorNonMarking'] : [...surfaces, 'indoorNonMarking'];
  return [
    'category',
    ...where,
    'fitForefoot',
    'fitHeel',
    'fitInstep',
    'cushioning',
    'support',
    'protection',
    'moistureProtection',
    'durability',
    'weight',
    'removableInsole',
    'sizesAndWidths',
  ];
}

const quote = (text: string) => `“${text}”`;

/** The value in words; never an invented score. */
function valueText(key: Key, value: unknown): string {
  switch (key) {
    case 'category':
      return CATEGORY_LABEL[value as 'veld' | 'zaal'];
    case 'surfaceWater':
    case 'surfaceSand':
    case 'surfaceSemiWaterHybrid':
      return SUITABILITY_LABEL[value as 'bevestigd' | 'ongeschikt'];
    case 'indoorNonMarking':
      return value === 'bevestigd' ? 'Bevestigd' : 'Nee';
    case 'fitForefoot':
    case 'fitHeel':
    case 'fitInstep': {
      const fit = value as { code: string; description: string };
      return `${fit.code[0]!.toUpperCase()}${fit.code.slice(1)}: ${quote(fit.description)}`;
    }
    case 'weight': {
      const weight = value as { grams: number; size: string; method: string };
      return `${weight.grams} g (maat ${weight.size}, ${weight.method})`;
    }
    case 'sizesAndWidths': {
      const sizes = value as { sizes: string[]; widths?: string[] };
      return `${sizes.sizes.join(', ')}${sizes.widths?.length ? ` · breedtes: ${sizes.widths.join(', ')}` : ''}`;
    }
    case 'removableInsole':
      return value ? 'Ja' : 'Nee';
    case 'moistureProtection': {
      const moisture = value as { kind: string; claim: string };
      const kind = moisture.kind === 'anders' ? '' : `${moisture.kind[0]!.toUpperCase()}${moisture.kind.slice(1)}: `;
      return `${kind}${quote(moisture.claim)}`;
    }
    default:
      return quote(String(value));
  }
}

function SourceLine({ claim }: { claim: SourcedValue<unknown> }) {
  return (
    <p className="mt-0.5 text-xs text-lijngrijs">
      {SOURCE_KIND_LABEL[claim.source]}: {claim.sourceLabel}
      {claim.sourceUrl && (
        <>
          {' · '}
          <a href={claim.sourceUrl} className="underline hover:text-veld" rel="nofollow noopener" target="_blank">
            bron
          </a>
        </>
      )}
      {claim.modelYear ? ` · modeljaar ${claim.modelYear}` : ''}
      {' · gecontroleerd op '}
      <time dateTime={claim.lastVerifiedAt}>{claim.lastVerifiedAt}</time>
    </p>
  );
}

/** "Wat de bron zegt": every property with its value or "Onbekend", and where it comes from. */
export function ShoeSpecTable({ shoe }: { shoe: Shoe }) {
  return (
    <dl className="mt-3 divide-y divide-rand rounded-2xl border border-rand bg-white">
      {rowsFor(shoe).map((key) => {
        const claim = shoe[key] as { value: unknown } | SourcedValue<unknown>;
        const known = claim.value !== 'onbekend' && 'source' in claim;
        return (
          <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
            <dt className="text-sm font-semibold">{PROPERTY_LABEL[key]}</dt>
            <dd className="text-sm">
              {known ? (
                <>
                  <span>
                    {claim.source === 'editorial-estimate' && key === 'indoorNonMarking'
                      ? 'Aangenomen (inschatting, niet bevestigd)'
                      : valueText(key, claim.value)}
                  </span>
                  <SourceLine claim={claim} />
                </>
              ) : (
                <span className="text-inkt/60">Onbekend</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
