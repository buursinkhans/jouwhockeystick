import { z } from 'zod';
import {
  experienceLevelSchema,
  positionSchema,
  type BowProfile,
  type Product,
} from '@/catalog/types';

export const buyerTypeSchema = z.enum(['zelf', 'kind']);
export type BuyerType = z.infer<typeof buyerTypeSchema>;

/** Raw answers as submitted by the stickwijzer form. */
export const quizAnswersSchema = z
  .object({
    buyerType: buyerTypeSchema,
    age: z.number().int().min(3).max(99).optional(),
    playerHeightCm: z.number().min(80).max(220),
    experienceLevel: experienceLevelSchema,
    currentStickExperience: z.enum(['nog-geen-stick', 'basis', 'ruime-ervaring']),
    position: positionSchema,
    desiredPlayActions: z.array(z.enum(['dribbelen', 'passen', 'shot', 'verdedigen'])).min(1),
    comfortPreference: z.enum(['licht-wendbaar', 'stevig-krachtig', 'geen-voorkeur']),
    budgetMaxEur: z.number().positive(),
  })
  .refine((data) => data.buyerType !== 'kind' || data.age !== undefined, {
    message: 'Geef de leeftijd van je kind op.',
    path: ['age'],
  });
export type QuizAnswers = z.infer<typeof quizAnswersSchema>;

/**
 * Normalized, engine-facing profile. Kept separate from QuizAnswers so the
 * advice engine never has to deal with raw UI input (e.g. height in cm).
 */
export type QuizProfile = {
  buyerType: BuyerType;
  age: number | null;
  lengthRangeInches: [number, number];
  experienceLevel: z.infer<typeof experienceLevelSchema>;
  currentStickExperience: QuizAnswers['currentStickExperience'];
  position: z.infer<typeof positionSchema>;
  desiredPlayActions: QuizAnswers['desiredPlayActions'];
  comfortPreference: QuizAnswers['comfortPreference'];
  preferredBowProfile: BowProfile | null;
  budgetMaxEur: number;
};

export const reasonCodeSchema = z.enum([
  'EXPERIENCE_MATCH',
  'PLAYSTYLE_MATCH',
  'COMFORT_MATCH',
  'BUDGET_FIT',
  'POSITION_ALIGNMENT',
  'UPGRADE_PATH',
  'STOCK_AVAILABLE',
]);
export type ReasonCode = z.infer<typeof reasonCodeSchema>;

export const cautionCodeSchema = z.enum([
  'HIGH_CARBON_FOR_BEGINNER',
  'HIGH_CARBON_FOR_YOUNG_PLAYER',
  'EXPERIENCE_GAP',
]);
export type CautionCode = z.infer<typeof cautionCodeSchema>;

export type ScoredProduct = {
  product: Product;
  score: number;
  reasonCodes: ReasonCode[];
  cautions: CautionCode[];
};

export type AdviceResult = {
  ruleSetVersion: string;
  generatedAt: string;
  profile: QuizProfile;
  recommended: ScoredProduct | null;
  alternatives: ScoredProduct[];
  isUncertain: boolean;
  excludedCount: number;
};
