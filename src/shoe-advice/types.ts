import type { Offer } from '@/catalog/offers/sort';
import type { Shoe, ShoeListing } from '@/catalog/shoes/types';
import type { SourceType } from '@/catalog/types';

/**
 * Version of the shoe advice rules, stored with every outcome (CLAUDE.md,
 * Adviesengine). Separate from the stick ruleSetVersion.
 */
export const SHOE_RULE_SET_VERSION = 'schoen-v1.0';

/** Laag A: a hard condition is met, a known conflict, or unknown (keuzemodel §6). */
export type HardStatus = 'voldoet' | 'voldoet-niet' | 'onbekend';

export type HardCondition = 'categorie' | 'water' | 'zand' | 'semi-water' | 'non-marking' | 'maat' | 'budget';

/** Laag C for one advised model. */
export type AdviceCertainty = 'goede-onderbouwing' | 'voorwaardelijk' | 'onvoldoende-informatie';

export type FitPart = 'voorvoet' | 'hiel' | 'wreef';

/** Why a model is in the selection: always tied to an answer and a sourced property. */
export type ReasonCode =
  | { code: 'CATEGORIE'; category: 'veld' | 'zaal'; source: SourceType }
  | { code: 'ONDERGROND'; surface: 'water' | 'zand' | 'semi-water'; source: SourceType; quote: string }
  | { code: 'NON_MARKING'; source: SourceType }
  | { code: 'PASVORM'; part: FitPart; fit: string; source: SourceType }
  | { code: 'MAAT_OP_VOORRAAD'; size: string; shops: string[] }
  | { code: 'BINNEN_BUDGET'; priceEur: number }
  | { code: 'DEMPING'; claim: string; why: 'comfort' | 'loopmeters' | 'belasting' }
  | { code: 'ONDERSTEUNING'; claim: string; why: 'stevig' | 'zijwaarts' | 'sprints' }
  | { code: 'SLIJTVAST'; claim: string; why: 'slijtvast' | 'belasting' }
  | { code: 'VOCHT'; kind: string; claim: string }
  | { code: 'GEWICHT'; grams: number; size: string }
  | { code: 'JUNIOR_MODEL' }
  | { code: 'VOORDELIGER'; priceEur: number; thanEur: number };

/** What the player still has to check (keuzemodel §8 "Wat je nog moet controleren"). */
export type CheckCode =
  | { code: 'ONDERGROND_ONBEKEND'; surface: 'water' | 'zand' | 'semi-water' }
  | { code: 'SPELER_ONDERGROND_ONBEKEND' }
  | { code: 'NON_MARKING_ONBEKEND' }
  | { code: 'NON_MARKING_INSCHATTING' }
  | { code: 'PASVORM_ONBEKEND'; part: FitPart }
  | { code: 'PASVORM_ALGEMEEN' }
  | { code: 'MAAT_NIET_BEVESTIGD'; size: string }
  | { code: 'MAAT_NOG_BEPALEN' }
  | { code: 'PRIJS_ONBEKEND' }
  | { code: 'WINKELBRON' };

/** "Mogelijk minder geschikt wanneer": limits and possible conflicts; unknowns are never strengths. */
export type LimitCode =
  | { code: 'PASVORM_CONFLICT'; part: FitPart; fit: string }
  | { code: 'BOVEN_BUDGET'; priceEur: number; maxEur: number }
  | { code: 'TWEEDE_ONDERGROND_ONBEKEND'; surface: 'water' | 'zand' | 'semi-water' }
  | { code: 'WATERAFSTOTEND_NIET_WATERDICHT' }
  | { code: 'ANDERE_LEEFTIJDSGROEP'; modelFor: 'junior' | 'senior' };

export type ShoeAdviceItem = {
  shoe: Shoe;
  /** First fit advice, an alternative with another fit or property, or a cheaper one (§8). */
  role: 'eerste' | 'alternatief' | 'voordeliger';
  certainty: AdviceCertainty;
  hard: Partial<Record<HardCondition, HardStatus>>;
  reasons: ReasonCode[];
  checks: CheckCode[];
  limits: LimitCode[];
  /** Lowest current feed price of one pair (in stock), or null. */
  priceEur: number | null;
  offers: Offer[];
  listings: readonly ShoeListing[];
  /** The shop photo, resolved on the server so the browser never loads the catalog. */
  imageUrl: string | null;
  sources: SourceType[];
  lastChecked: string | null;
};

export type NoMatch =
  | { reason: 'geen-kandidaat'; failed: HardCondition[] }
  | { reason: 'niet-bevestigd'; missing: 'ondergrond' | 'non-marking' };

export type CategoryAdvice = {
  category: 'veld' | 'zaal';
  /** At most three, only real candidates; never filled up. */
  items: ShoeAdviceItem[];
  noMatch: NoMatch | null;
};

export type ShoeAdvice =
  | { kind: 'keeper'; ruleSetVersion: string }
  | { kind: 'advice'; ruleSetVersion: string; advices: CategoryAdvice[] };

/** The catalog the rules read: shoes, their feed listings and their offers. Passed in, so tests can use their own. */
export type ShoeCatalog = {
  shoes: readonly Shoe[];
  listingsOf: (shoe: Shoe) => readonly ShoeListing[];
  offersOf: (shoe: Shoe) => Offer[];
};
