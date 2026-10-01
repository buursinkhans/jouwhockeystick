import type { ContentClaim, SourceRecord, SourceType } from './types';

export type ClaimIssue =
  | 'missing_source'
  | 'spec_needs_primary_source'
  | 'science_needs_research_source'
  | 'quote_needs_metadata_and_disclosure'
  | 'own_measurement_needs_metadata'
  | 'field_test_needs_metadata'
  | 'absolute_claim_wording';

/** Season-bound sources are re-checked at least every 18 months (spec §9.3). */
export const RECHECK_AFTER_MONTHS = 18;

const SPEC_SOURCE_TYPES: readonly SourceType[] = ['manufacturer', 'official_distributor', 'own_measurement'];
const RESEARCH_SOURCE_TYPES: readonly SourceType[] = ['independent_research', 'academic_thesis'];

/** A manufacturer claim may never be rephrased as proof or a guarantee. */
const ABSOLUTE_WORDING = /\b(bewezen beter|objectief beter|gegarandeerd|garantie)\b/i;

export function needsRecheck(source: SourceRecord, now: Date = new Date()): boolean {
  if (!source.relatedProductIds || source.relatedProductIds.length === 0) {
    return false;
  }
  const checkedAt = new Date(source.checkedAt);
  if (Number.isNaN(checkedAt.getTime())) {
    return true;
  }
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - RECHECK_AFTER_MONTHS);
  return checkedAt < cutoff;
}

/** Validation rules from spec §9.7. An empty list means the claim may be published. */
export function validateClaim(claim: ContentClaim, sources: SourceRecord[]): ClaimIssue[] {
  const issues: ClaimIssue[] = [];
  const linked = claim.sourceIds
    .map((id) => sources.find((source) => source.id === id))
    .filter((source): source is SourceRecord => source !== undefined);

  if (linked.length === 0 || linked.length !== claim.sourceIds.length) {
    issues.push('missing_source');
  }

  const hasType = (types: readonly SourceType[]) => linked.some((source) => types.includes(source.sourceType));

  if (claim.claimType === 'product_specification' && !hasType(SPEC_SOURCE_TYPES)) {
    issues.push('spec_needs_primary_source');
  }
  if (claim.claimType === 'scientific_interpretation' && !hasType(RESEARCH_SOURCE_TYPES)) {
    issues.push('science_needs_research_source');
  }
  if (
    (claim.claimType === 'player_experience' || claim.displayedLabel === 'Spelerquote') &&
    !linked.some((source) => source.quoteMetadata?.brandRelationship !== undefined)
  ) {
    issues.push('quote_needs_metadata_and_disclosure');
  }
  if (
    claim.displayedLabel === 'Eigen meting' &&
    !linked.some((source) => source.ownTestMetadata !== undefined)
  ) {
    issues.push('own_measurement_needs_metadata');
  }
  if (
    claim.displayedLabel === 'Praktijktest' &&
    !linked.some(
      (source) =>
        source.ownTestMetadata?.testerCount !== undefined &&
        source.ownTestMetadata.testConditions !== undefined,
    )
  ) {
    issues.push('field_test_needs_metadata');
  }
  if (claim.claimType === 'manufacturer_claim' && ABSOLUTE_WORDING.test(claim.text)) {
    issues.push('absolute_claim_wording');
  }

  return issues;
}

/** An unverified claim must never surface as a reason in an automated advice. */
export function isUsableInAdvice(claim: ContentClaim, sources: SourceRecord[], now: Date = new Date()): boolean {
  const linked = sources.filter((source) => claim.sourceIds.includes(source.id));
  return validateClaim(claim, sources).length === 0 && !linked.some((source) => needsRecheck(source, now));
}
