import { z } from 'zod';
import { adviceRouteSchema } from '@/advice-engine/answers';

/** Source and claim records (implementation spec §9.6). */
export const sourceTypeSchema = z.enum([
  'manufacturer',
  'official_distributor',
  'independent_research',
  'academic_thesis',
  'governing_body',
  'own_measurement',
  'field_test',
  'player_quote',
  'coach_interview',
  'retailer_guide',
  'editorial_analysis',
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const evidenceStrengthSchema = z.enum([
  'primary',
  'independent',
  'first_hand',
  'manufacturer_claim',
  'expert_opinion',
  'context_only',
]);
export type EvidenceStrength = z.infer<typeof evidenceStrengthSchema>;

export const sourceRecordSchema = z.object({
  id: z.string(),
  sourceType: sourceTypeSchema,
  evidenceStrength: evidenceStrengthSchema,
  title: z.string(),
  publisher: z.string(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  checkedAt: z.string(),
  url: z.string().url().optional(),
  doi: z.string().optional(),
  claimSummary: z.string(),
  limitations: z.array(z.string()).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  relatedQuestionIds: z.array(z.string()).optional(),
  relatedClaimIds: z.array(z.string()).optional(),
  disclosure: z
    .object({
      sponsored: z.boolean().optional(),
      brandAmbassador: z.boolean().optional(),
      affiliateRelationship: z.boolean().optional(),
      conflictOfInterestText: z.string().optional(),
    })
    .optional(),
  ownTestMetadata: z
    .object({
      testProtocolVersion: z.string(),
      testDate: z.string(),
      sampleCount: z.number().int().positive(),
      sampleDescription: z.string(),
      testerCount: z.number().int().positive().optional(),
      testerProfiles: z
        .array(
          z.object({
            role: z.enum(['player', 'coach', 'parent', 'reviewer']),
            level: z.string().optional(),
            ageBand: z.string().optional(),
          }),
        )
        .optional(),
      testConditions: z
        .object({
          fieldType: z.string().optional(),
          weather: z.string().optional(),
          ballType: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  quoteMetadata: z
    .object({
      speaker: z.string(),
      speakerRole: z.string().optional(),
      teamOrClub: z.string().optional(),
      quoteText: z.string(),
      quoteContext: z.string().optional(),
      brandRelationship: z
        .enum(['none_known', 'ambassador', 'sponsored', 'employee', 'unknown'])
        .optional(),
    })
    .optional(),
});
export type SourceRecord = z.infer<typeof sourceRecordSchema>;

export const claimTypeSchema = z.enum([
  'product_specification',
  'manufacturer_claim',
  'own_measurement',
  'field_test_observation',
  'general_technical_explanation',
  'scientific_interpretation',
  'player_experience',
  'editorial_advice_rule',
]);
export type ClaimType = z.infer<typeof claimTypeSchema>;

/** The only source labels a user ever sees next to a claim (spec §9.2). */
export const displayedLabelSchema = z.enum([
  'Fabrikantgegevens',
  'Eigen meting',
  'Praktijktest',
  'Onafhankelijke bron',
  'Spelerquote',
  'Redactionele adviesregel',
]);
export type DisplayedLabel = z.infer<typeof displayedLabelSchema>;

export const contentClaimSchema = z.object({
  id: z.string(),
  claimType: claimTypeSchema,
  text: z.string(),
  shortText: z.string().optional(),
  appliesTo: z.object({
    productIds: z.array(z.string()).optional(),
    productAttributes: z.array(z.string()).optional(),
    adviceRoutes: z.array(adviceRouteSchema).optional(),
    pageTypes: z
      .array(z.enum(['product', 'comparison', 'guide', 'advice_result']))
      .optional(),
  }),
  sourceIds: z.array(z.string()),
  confidence: z.enum(['high', 'moderate', 'limited']),
  displayedLabel: displayedLabelSchema,
  lastReviewedAt: z.string(),
  reviewerId: z.string(),
});
export type ContentClaim = z.infer<typeof contentClaimSchema>;
