import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { buildProductSourceRecords } from './productSources';
import { contentClaimSchema, sourceRecordSchema, type ContentClaim, type SourceRecord } from './types';
import { isUsableInAdvice, needsRecheck, validateClaim } from './validation';

const NOW = new Date('2026-10-01T12:00:00.000Z');

function buildSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: 'src-1',
    sourceType: 'manufacturer',
    evidenceStrength: 'manufacturer_claim',
    title: 'Productpagina',
    publisher: 'Grays',
    checkedAt: '2026-09-26',
    url: 'https://www.grays-hockey.eu/',
    claimSummary: 'bow-profiel',
    relatedProductIds: ['test-product'],
    ...overrides,
  };
}

function buildClaim(overrides: Partial<ContentClaim> = {}): ContentClaim {
  return {
    id: 'claim-1',
    claimType: 'product_specification',
    text: 'Volgens de fabrikant heeft deze stick een Dynabow-profiel.',
    appliesTo: { productIds: ['test-product'] },
    sourceIds: ['src-1'],
    confidence: 'high',
    displayedLabel: 'Fabrikantgegevens',
    lastReviewedAt: '2026-10-01',
    reviewerId: 'redactie',
    ...overrides,
  };
}

describe('validateClaim', () => {
  it('accepts a product specification backed by a manufacturer source', () => {
    expect(validateClaim(buildClaim(), [buildSource()])).toEqual([]);
    expect(isUsableInAdvice(buildClaim(), [buildSource()], NOW)).toBe(true);
  });

  it('rejects a claim without a resolvable source', () => {
    expect(validateClaim(buildClaim({ sourceIds: ['missing'] }), [buildSource()])).toContain('missing_source');
  });

  it('rejects a product specification backed only by a retailer listing', () => {
    const source = buildSource({ sourceType: 'retailer_guide' });
    expect(validateClaim(buildClaim(), [source])).toEqual(['spec_needs_primary_source']);
  });

  it('requires a research source for a scientific claim', () => {
    const claim = buildClaim({ claimType: 'scientific_interpretation', displayedLabel: 'Onafhankelijke bron' });
    expect(validateClaim(claim, [buildSource()])).toEqual(['science_needs_research_source']);
    expect(validateClaim(claim, [buildSource({ sourceType: 'independent_research' })])).toEqual([]);
  });

  it('requires quote metadata with a disclosed brand relationship', () => {
    const claim = buildClaim({ claimType: 'player_experience', displayedLabel: 'Spelerquote' });
    expect(validateClaim(claim, [buildSource({ sourceType: 'player_quote' })])).toEqual([
      'quote_needs_metadata_and_disclosure',
    ]);
    const disclosed = buildSource({
      sourceType: 'player_quote',
      quoteMetadata: { speaker: 'Speler', quoteText: 'Quote', brandRelationship: 'ambassador' },
    });
    expect(validateClaim(claim, [disclosed])).toEqual([]);
  });

  it('requires protocol metadata for an own measurement and test context for a field test', () => {
    const measurement = buildClaim({ claimType: 'own_measurement', displayedLabel: 'Eigen meting' });
    const fieldTest = buildClaim({ claimType: 'field_test_observation', displayedLabel: 'Praktijktest' });
    const bare = buildSource({ sourceType: 'own_measurement' });
    const measured = buildSource({
      sourceType: 'own_measurement',
      ownTestMetadata: {
        testProtocolVersion: 'v1.0',
        testDate: '2026-10-01',
        sampleCount: 1,
        sampleDescription: '36,5 inch',
      },
    });

    expect(validateClaim(measurement, [bare])).toEqual(['own_measurement_needs_metadata']);
    expect(validateClaim(measurement, [measured])).toEqual([]);
    expect(validateClaim(fieldTest, [measured])).toEqual(['field_test_needs_metadata']);
  });

  it('rejects a manufacturer claim rephrased as proof or a guarantee', () => {
    const claim = buildClaim({
      claimType: 'manufacturer_claim',
      text: 'Deze stick is bewezen beter voor de backhand.',
    });
    expect(validateClaim(claim, [buildSource()])).toEqual(['absolute_claim_wording']);
  });
});

describe('needsRecheck', () => {
  it('flags a product source older than 18 months and keeps it out of automated advice', () => {
    const stale = buildSource({ checkedAt: '2025-03-01' });
    expect(needsRecheck(stale, NOW)).toBe(true);
    expect(needsRecheck(buildSource(), NOW)).toBe(false);
    expect(isUsableInAdvice(buildClaim(), [stale], NOW)).toBe(false);
  });
});

describe('buildProductSourceRecords', () => {
  it('produces schema-valid source records for every catalog product', () => {
    for (const product of getAllProducts()) {
      const records = buildProductSourceRecords(product);
      expect(records.length).toBeGreaterThan(0);
      for (const record of records) {
        expect(sourceRecordSchema.safeParse(record).success).toBe(true);
        expect(record.relatedProductIds).toEqual([product.slug]);
      }
    }
  });

  it('labels a bol.com listing as a retailer source, never as manufacturer data', () => {
    const adidas = getAllProducts().find((product) => product.slug === 'adidas-estro-4');
    const types = buildProductSourceRecords(adidas!).map((record) => record.sourceType);
    expect(types).toContain('retailer_guide');
    expect(types).not.toContain('manufacturer');
  });

  it('keeps the claim schema in line with the spec labels', () => {
    expect(contentClaimSchema.safeParse(buildClaim()).success).toBe(true);
    expect(contentClaimSchema.safeParse({ ...buildClaim(), displayedLabel: 'Marketing' }).success).toBe(false);
  });
});
