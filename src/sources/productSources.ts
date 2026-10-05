import type {
  Product,
  SourceType as CatalogSourceType,
  SourcedValue,
} from '@/catalog/types';
import type { EvidenceStrength, SourceRecord, SourceType } from './types';

const SOURCE_TYPE: Record<CatalogSourceType, SourceType> = {
  'brand-website': 'manufacturer',
  'partner-shop': 'retailer_guide',
  'fih-rules': 'governing_body',
  'editorial-estimate': 'editorial_analysis',
};

const EVIDENCE_STRENGTH: Record<CatalogSourceType, EvidenceStrength> = {
  'brand-website': 'manufacturer_claim',
  'partner-shop': 'context_only',
  'fih-rules': 'primary',
  'editorial-estimate': 'expert_opinion',
};

/**
 * Label shown next to a claim. A shop listing is not manufacturer data, so
 * it gets its own honest label instead of borrowing "Fabrikantgegevens".
 */
export const SOURCE_DISPLAY_LABEL: Record<SourceType, string> = {
  manufacturer: 'Fabrikantgegevens',
  official_distributor: 'Fabrikantgegevens',
  own_measurement: 'Eigen meting',
  field_test: 'Praktijktest',
  independent_research: 'Onafhankelijke bron',
  academic_thesis: 'Onafhankelijke bron',
  governing_body: 'Onafhankelijke bron',
  player_quote: 'Spelerquote',
  coach_interview: 'Spelerquote',
  editorial_analysis: 'Redactionele adviesregel',
  retailer_guide: 'Winkelgegevens (geen fabrikantbron)',
};

const SITE_NAME = 'jouwhockeystick.nl';

const FIELD_LABELS = {
  experienceLevel: 'doelgroep',
  bowProfile: 'bow-profiel',
  carbonPercentage: 'carbonpercentage',
  weightGrams: 'gewicht',
  lengthsInches: 'beschikbare lengtes',
  priceIndicativeEur: 'richtprijs',
  stock: 'voorraadindicatie',
  recommendedPositions: 'positie-inschatting',
  strengths: 'sterke punten',
  pointsOfAttention: 'aandachtspunten',
} as const;

type SourcedField = keyof typeof FIELD_LABELS;

function publisherFor(
  product: Product,
  sourced: SourcedValue<unknown>,
): string {
  if (sourced.source === 'editorial-estimate') {
    return SITE_NAME;
  }
  if (sourced.source === 'brand-website') {
    return product.brand;
  }
  if (sourced.sourceUrl) {
    return new URL(sourced.sourceUrl).hostname.replace(/^www\./, '');
  }
  return sourced.source === 'fih-rules' ? 'FIH' : 'Winkel';
}

export function sourceTypeOf(sourced: SourcedValue<unknown>): SourceType {
  return SOURCE_TYPE[sourced.source];
}

/** "Fabrikantgegevens — Grays", "Redactionele adviesregel — jouwhockeystick.nl", … */
export function sourceLine(
  product: Product,
  sourced: SourcedValue<unknown>,
): string {
  return `${SOURCE_DISPLAY_LABEL[sourceTypeOf(sourced)]} — ${publisherFor(product, sourced)}`;
}

/**
 * Builds standalone source records from the sourced values a product already
 * carries, grouped per source type and URL, so a result can list exactly
 * which source backs which specs without duplicating that data by hand.
 */
export function buildProductSourceRecords(product: Product): SourceRecord[] {
  const groups = new Map<
    string,
    {
      sourced: SourcedValue<unknown>;
      fields: SourcedField[];
      checkedAt: string;
    }
  >();

  for (const field of Object.keys(FIELD_LABELS) as SourcedField[]) {
    const sourced: SourcedValue<unknown> | undefined = product[field];
    if (!sourced) {
      continue;
    }
    const key = `${sourced.source}|${sourced.source === 'editorial-estimate' ? '' : (sourced.sourceUrl ?? '')}`;
    const group = groups.get(key);
    if (group) {
      group.fields.push(field);
      if (sourced.lastVerifiedAt > group.checkedAt) {
        group.checkedAt = sourced.lastVerifiedAt;
      }
    } else {
      groups.set(key, {
        sourced,
        fields: [field],
        checkedAt: sourced.lastVerifiedAt,
      });
    }
  }

  return Array.from(
    groups.values(),
    ({ sourced, fields, checkedAt }, index) => {
      const editorial = sourced.source === 'editorial-estimate';
      const record: SourceRecord = {
        id: `${product.slug}:${index + 1}`,
        sourceType: sourceTypeOf(sourced),
        evidenceStrength: EVIDENCE_STRENGTH[sourced.source],
        title: editorial
          ? `Redactionele inschatting bij ${product.name}`
          : `${product.name} — productpagina`,
        publisher: publisherFor(product, sourced),
        checkedAt,
        claimSummary: fields.map((field) => FIELD_LABELS[field]).join(', '),
        relatedProductIds: [product.slug],
      };
      if (!editorial && sourced.sourceUrl) {
        record.url = sourced.sourceUrl;
      }
      if (editorial) {
        record.limitations = [
          'Eigen inschatting op basis van de vermelde specificaties; geen meting of praktijktest.',
        ];
      }
      return record;
    },
  );
}
