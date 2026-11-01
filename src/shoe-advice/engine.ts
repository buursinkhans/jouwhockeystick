/**
 * The shoe advice rules (docs/spec/hockeyschoenen-keuzemodel.md §6, decision
 * log 2026-11-01), in three layers:
 * - A, hard conditions: field or indoor, surface or non-marking, size and
 *   stock, budget. Met, known conflict (excluded) or unknown (only shown
 *   conditionally, with the check to do).
 * - B, personal fit, as an ordered comparison in the keuzemodel's order: fit
 *   problems, surfaces, load and comfort, movement, other preferences. No
 *   weights: a later step only decides when every earlier step is equal, so
 *   a preference never makes up for a fit conflict. Unknown never counts.
 *   The position is not used at all (context only, no double counting).
 * - C, certainty per advised model.
 * Pure: the catalog is passed in. Question 7 is not an input (fitNotes.ts).
 */
import { isPriceFresh } from '@/catalog/offers/sort';
import { lastChecked, sourceKinds } from '@/catalog/shoes/certainty';
import type { Shoe } from '@/catalog/shoes/types';
import type { SourcedValue } from '@/catalog/types';
import { BUDGET_MAX, type FitIssue, type ShoeAnswers } from './answers';
import {
  SHOE_RULE_SET_VERSION,
  type AdviceCertainty,
  type CategoryAdvice,
  type CheckCode,
  type FitPart,
  type HardCondition,
  type HardStatus,
  type LimitCode,
  type ReasonCode,
  type ShoeAdvice,
  type ShoeAdviceItem,
  type ShoeCatalog,
} from './types';

type Surface = 'water' | 'zand' | 'semi-water';
type Known<T> = SourcedValue<T>;

const known = <T>(claim: { value: unknown }): claim is Known<T> => claim.value !== 'onbekend' && 'source' in claim;

/** Shoe sizes as one comparable key: "41,5", "41 1/2" and "41.5" are the same size. */
export function sizeKey(size: string): string {
  return size
    .trim()
    .toLowerCase()
    .replace(/^eu\s*/, '')
    .replace(/\s+1\/2$/, '.5')
    .replace(/\s+1\/3$/, '.33')
    .replace(/\s+2\/3$/, '.67')
    .replace(',', '.')
    .replace(/\.0$/, '');
}

/** The surfaces the answers make a hard condition: the main one(s), then the second one apart. */
function requiredSurfaces(answers: ShoeAnswers): { main: Surface[]; second: Surface | null } {
  const main: Surface[] =
    answers.surface === 'bijna-alleen-water' || answers.surface === 'vooral-water'
      ? ['water']
      : answers.surface === 'gemengd'
        ? ['water', 'zand']
        : answers.surface === 'vooral-zand-semi'
          ? ['zand']
          : [];
  const second = answers.secondSurface && answers.secondSurface !== 'geen' ? answers.secondSurface : null;
  return { main, second: second && !main.includes(second) ? second : null };
}

const surfaceClaim = (shoe: Shoe, surface: Surface) =>
  surface === 'water' ? shoe.surfaceWater : surface === 'zand' ? shoe.surfaceSand : shoe.surfaceSemiWaterHybrid;

const statusOf = (claim: { value: unknown }): HardStatus =>
  claim.value === 'bevestigd' ? 'voldoet' : claim.value === 'onbekend' ? 'onbekend' : 'voldoet-niet';

/** Which part of the foot each fit answer is about, and the fit that helps or hurts there. */
const FIT_RULES: Partial<Record<FitIssue, { part: FitPart; helps: 'ruim' | 'smal'; hurts: 'ruim' | 'smal' }>> = {
  'krap-voorvoet': { part: 'voorvoet', helps: 'ruim', hurts: 'smal' },
  'ruim-hiel': { part: 'hiel', helps: 'smal', hurts: 'ruim' },
  // Sliding feet: a heel that holds is what to look at first.
  schuiven: { part: 'hiel', helps: 'smal', hurts: 'ruim' },
  'druk-wreef': { part: 'wreef', helps: 'ruim', hurts: 'smal' },
};
const fitClaim = (shoe: Shoe, part: FitPart) => (part === 'voorvoet' ? shoe.fitForefoot : part === 'hiel' ? shoe.fitHeel : shoe.fitInstep);

type Candidate = {
  shoe: Shoe;
  hard: Partial<Record<HardCondition, HardStatus>>;
  reasons: ReasonCode[];
  checks: CheckCode[];
  limits: LimitCode[];
  priceEur: number | null;
  aboveBudget: boolean;
  /** Layer B counts, in order of weight. */
  fitConflicts: number;
  fitMatches: number;
  surfaceMatches: number;
  /** Junior model for a child or youth player, senior model for an adult: only when all claims are equal. */
  ageMatch: boolean;
  loadMatches: number;
  movementMatches: number;
  preferenceMatches: number;
  primaryConfirmed: boolean;
  primaryRequired: boolean;
};

function lowestPrice(catalog: ShoeCatalog, shoe: Shoe, now: Date): number | null {
  const prices = catalog
    .offersOf(shoe)
    .filter((o) => o.inStock && isPriceFresh(o, now) && o.priceEur !== null)
    .map((o) => o.priceEur as number);
  return prices.length ? Math.min(...prices) : null;
}

function evaluate(shoe: Shoe, category: 'veld' | 'zaal', answers: ShoeAnswers, catalog: ShoeCatalog, now: Date): Candidate | null {
  const hard: Candidate['hard'] = {};
  const reasons: ReasonCode[] = [];
  const checks: CheckCode[] = [];
  const limits: LimitCode[] = [];

  // A1. Field or indoor. An unknown kind is no candidate: it might be the wrong kind of shoe.
  if (!known<'veld' | 'zaal'>(shoe.category) || shoe.category.value !== category) return null;
  hard.categorie = 'voldoet';
  reasons.push({ code: 'CATEGORIE', category, source: shoe.category.source });

  // A2. Surface (field) or non-marking sole (indoor).
  let primaryConfirmed = false;
  let primaryRequired = true;
  let surfaceMatches = 0;
  if (category === 'veld') {
    const { main, second } = requiredSurfaces(answers);
    if (main.length === 0) {
      primaryRequired = false;
      checks.push({ code: 'SPELER_ONDERGROND_ONBEKEND' });
    }
    for (const surface of main) {
      const claim = surfaceClaim(shoe, surface);
      const status = statusOf(claim);
      hard[surface] = status;
      if (status === 'voldoet-niet') return null;
      if (status === 'voldoet' && known(claim)) {
        primaryConfirmed = true;
        surfaceMatches += 1;
        reasons.push({ code: 'ONDERGROND', surface, source: claim.source, quote: claim.sourceLabel ?? '' });
      } else {
        checks.push({ code: 'ONDERGROND_ONBEKEND', surface });
      }
    }
    if (second) {
      const claim = surfaceClaim(shoe, second);
      const status = statusOf(claim);
      hard[second] = status;
      if (status === 'voldoet-niet') return null;
      if (status === 'voldoet' && known(claim)) {
        surfaceMatches += 1;
        reasons.push({ code: 'ONDERGROND', surface: second, source: claim.source, quote: claim.sourceLabel ?? '' });
      } else {
        limits.push({ code: 'TWEEDE_ONDERGROND_ONBEKEND', surface: second });
      }
    }
  } else {
    const status: HardStatus =
      shoe.indoorNonMarking.value === 'bevestigd' ? 'voldoet' : shoe.indoorNonMarking.value === 'nee' ? 'voldoet-niet' : 'onbekend';
    hard['non-marking'] = status;
    if (status === 'voldoet-niet') return null;
    if (status === 'voldoet' && known(shoe.indoorNonMarking)) {
      primaryConfirmed = true;
      reasons.push({ code: 'NON_MARKING', source: shoe.indoorNonMarking.source });
    } else {
      checks.push({ code: 'NON_MARKING_ONBEKEND' });
    }
  }

  // A3. Size and stock: only what the feed confirms per size; never a promise.
  const listings = catalog.listingsOf(shoe);
  if (answers.size) {
    const key = sizeKey(answers.size);
    const inStock = listings.filter((l) => l.inStock && l.sizesInStock.some((s) => sizeKey(s) === key));
    const listsSizes = listings.some((l) => l.sizes.length > 0);
    if (inStock.length) {
      hard.maat = 'voldoet';
      reasons.push({ code: 'MAAT_OP_VOORRAAD', size: answers.size, shops: inStock.map((l) => l.shop) });
    } else if (listsSizes) {
      return null;
    } else {
      hard.maat = 'onbekend';
      checks.push({ code: 'MAAT_NIET_BEVESTIGD', size: answers.size });
    }
  } else {
    checks.push({ code: 'MAAT_NOG_BEPALEN' });
  }

  // A4. Budget: above it only with permission, and then only as an alternative.
  const priceEur = lowestPrice(catalog, shoe, now);
  const maxEur = answers.budget ? BUDGET_MAX[answers.budget] : null;
  let aboveBudget = false;
  if (priceEur === null) {
    hard.budget = 'onbekend';
    checks.push({ code: 'PRIJS_ONBEKEND' });
  } else if (maxEur !== null && priceEur > maxEur) {
    if (!answers.allowAboveBudget) return null;
    aboveBudget = true;
    hard.budget = 'voldoet';
    limits.push({ code: 'BOVEN_BUDGET', priceEur, maxEur });
  } else {
    hard.budget = 'voldoet';
    if (maxEur !== null) reasons.push({ code: 'BINNEN_BUDGET', priceEur });
  }

  // B1. Fit problems, per part of the foot; several at once (keuzemodel §5 question 5).
  let fitConflicts = 0;
  let fitMatches = 0;
  const issues = answers.fitIssues ?? [];
  const parts = new Set<FitPart>();
  for (const issue of issues) {
    const rule = FIT_RULES[issue];
    if (!rule || parts.has(rule.part)) continue;
    parts.add(rule.part);
    const claim = fitClaim(shoe, rule.part);
    if (!known<{ code: string; description: string }>(claim)) {
      checks.push({ code: 'PASVORM_ONBEKEND', part: rule.part });
      continue;
    }
    if (claim.value.code === rule.hurts) {
      fitConflicts += 1;
      limits.push({ code: 'PASVORM_CONFLICT', part: rule.part, fit: claim.value.description });
    } else if (claim.value.code === rule.helps) {
      fitMatches += 1;
      reasons.push({ code: 'PASVORM', part: rule.part, fit: claim.value.description, source: claim.source });
    }
  }
  if (parts.size === 0 && [shoe.fitForefoot, shoe.fitHeel, shoe.fitInstep].every((c) => c.value === 'onbekend')) {
    checks.push({ code: 'PASVORM_ALGEMEEN' });
  }

  // B3. Load and comfort: frequent or long use asks for cushioning and durability claims.
  const heavyUse = answers.frequency === '4x-plus' || answers.session === 'lang';
  let loadMatches = 0;
  if (heavyUse && known<string>(shoe.cushioning)) {
    loadMatches += 1;
    reasons.push({ code: 'DEMPING', claim: shoe.cushioning.value, why: 'belasting' });
  }
  if (answers.frequency === '4x-plus' && known<string>(shoe.durability)) {
    loadMatches += 1;
    reasons.push({ code: 'SLIJTVAST', claim: shoe.durability.value, why: 'belasting' });
  }

  // B4. Movement style as the player describes it (never derived from the position).
  let movementMatches = 0;
  const movements = answers.movements ?? [];
  if ((movements.includes('zijwaarts') || movements.includes('sprints')) && known<string>(shoe.support)) {
    movementMatches += 1;
    reasons.push({ code: 'ONDERSTEUNING', claim: shoe.support.value, why: movements.includes('zijwaarts') ? 'zijwaarts' : 'sprints' });
  }
  if (movements.includes('loopmeters') && known<string>(shoe.cushioning) && !heavyUse) {
    movementMatches += 1;
    reasons.push({ code: 'DEMPING', claim: shoe.cushioning.value, why: 'loopmeters' });
  }

  // B5. Other preferences, last; each claim counts once.
  let preferenceMatches = 0;
  const said = new Set(reasons.map((r) => r.code));
  for (const preference of answers.preferences ?? []) {
    if (preference === 'comfort' && known<string>(shoe.cushioning) && !said.has('DEMPING')) {
      preferenceMatches += 1;
      reasons.push({ code: 'DEMPING', claim: shoe.cushioning.value, why: 'comfort' });
    }
    if (preference === 'stevig' && known<string>(shoe.support) && !said.has('ONDERSTEUNING')) {
      preferenceMatches += 1;
      reasons.push({ code: 'ONDERSTEUNING', claim: shoe.support.value, why: 'stevig' });
    }
    if (preference === 'slijtvast' && known<string>(shoe.durability) && !said.has('SLIJTVAST')) {
      preferenceMatches += 1;
      reasons.push({ code: 'SLIJTVAST', claim: shoe.durability.value, why: 'slijtvast' });
    }
    if (preference === 'licht' && known<{ grams: number; size: string; method: string }>(shoe.weight)) {
      preferenceMatches += 1;
      reasons.push({ code: 'GEWICHT', grams: shoe.weight.value.grams, size: shoe.weight.value.size });
    }
    if (preference === 'vocht' && category === 'veld' && known<{ kind: string; claim: string }>(shoe.moistureProtection)) {
      preferenceMatches += 1;
      reasons.push({ code: 'VOCHT', kind: shoe.moistureProtection.value.kind, claim: shoe.moistureProtection.value.claim });
      if (shoe.moistureProtection.value.kind === 'waterafstotend') limits.push({ code: 'WATERAFSTOTEND_NIET_WATERDICHT' });
    }
  }

  // The model for the player's age group first when claims are equal; never an exclusion and never a price step up.
  const child = answers.player === 'kind' || answers.player === 'jeugd';
  const ageMatch = child ? shoe.ageGroup === 'junior' : shoe.ageGroup === 'senior';
  if (child && ageMatch) reasons.push({ code: 'JUNIOR_MODEL' });
  if (!ageMatch) limits.push({ code: 'ANDERE_LEEFTIJDSGROEP', modelFor: shoe.ageGroup });

  if (sourceKinds(shoe).includes('partner-shop')) checks.push({ code: 'WINKELBRON' });

  return {
    shoe,
    hard,
    reasons,
    checks,
    limits,
    priceEur,
    aboveBudget,
    fitConflicts,
    fitMatches,
    surfaceMatches,
    ageMatch,
    loadMatches,
    movementMatches,
    preferenceMatches,
    primaryConfirmed,
    primaryRequired,
  };
}

const unknownCount = (c: Candidate) => Object.values(c.hard).filter((s) => s === 'onbekend').length;

/** Layer B as an ordered comparison: the first difference decides; equal on all counts, the cheaper first. */
function compareCandidates(a: Candidate, b: Candidate): number {
  const steps = [
    Number(a.aboveBudget) - Number(b.aboveBudget),
    Number(b.primaryConfirmed) - Number(a.primaryConfirmed),
    unknownCount(a) - unknownCount(b),
    a.fitConflicts - b.fitConflicts,
    b.fitMatches - a.fitMatches,
    b.surfaceMatches - a.surfaceMatches,
    Number(b.ageMatch) - Number(a.ageMatch),
    b.loadMatches - a.loadMatches,
    b.movementMatches - a.movementMatches,
    b.preferenceMatches - a.preferenceMatches,
    (a.priceEur ?? Number.POSITIVE_INFINITY) - (b.priceEur ?? Number.POSITIVE_INFINITY),
  ];
  return steps.find((step) => step !== 0) ?? a.shoe.slug.localeCompare(b.shoe.slug);
}

function certaintyOf(c: Candidate): AdviceCertainty {
  if (c.primaryRequired && !c.primaryConfirmed) return 'onvoldoende-informatie';
  const fitKnown = [c.shoe.fitForefoot, c.shoe.fitHeel, c.shoe.fitInstep].some((part) => part.value !== 'onbekend');
  const fitChecksOpen = c.checks.some((check) => check.code === 'PASVORM_ONBEKEND');
  return unknownCount(c) === 0 && c.primaryRequired && fitKnown && !fitChecksOpen && c.fitConflicts === 0
    ? 'goede-onderbouwing'
    : 'voorwaardelijk';
}

/** What makes a model a relevantly different alternative: its confirmed properties, not its brand. */
function profile(shoe: Shoe): string {
  return JSON.stringify([
    shoe.surfaceWater.value,
    shoe.surfaceSand.value,
    shoe.surfaceSemiWaterHybrid.value,
    shoe.indoorNonMarking.value,
    shoe.fitForefoot.value,
    shoe.fitHeel.value,
    shoe.fitInstep.value,
    known(shoe.moistureProtection) ? shoe.moistureProtection.value : null,
    known(shoe.cushioning),
    known(shoe.support),
    known(shoe.durability),
  ]);
}

function adviseFor(category: 'veld' | 'zaal', answers: ShoeAnswers, catalog: ShoeCatalog, now: Date): CategoryAdvice {
  const evaluated = catalog.shoes.map((shoe) => evaluate(shoe, category, answers, catalog, now));
  const candidates = evaluated.filter((c): c is Candidate => c !== null).sort(compareCandidates);

  if (candidates.length === 0) {
    const ofKind = catalog.shoes.filter((s) => s.category.value === category).length;
    const failed: HardCondition[] = ofKind === 0 ? ['categorie'] : [answers.size ? 'maat' : null, 'budget'].filter((c): c is HardCondition => c !== null);
    return { category, items: [], noMatch: { reason: 'geen-kandidaat', failed } };
  }
  // Only real candidates: when any model has the surface or non-marking confirmed, the rest drop out.
  const real = candidates.filter((c) => certaintyOf(c) !== 'onvoldoende-informatie');
  if (real.length === 0) {
    return { category, items: [], noMatch: { reason: 'niet-bevestigd', missing: category === 'veld' ? 'ondergrond' : 'non-marking' } };
  }

  const first = real[0]!;
  const picked: { c: Candidate; role: ShoeAdviceItem['role'] }[] = [{ c: first, role: 'eerste' }];
  const alternative = real.slice(1).find((c) => profile(c.shoe) !== profile(first.shoe));
  if (alternative) picked.push({ c: alternative, role: 'alternatief' });
  if (first.priceEur !== null) {
    const cheaper = real
      .filter((c) => !picked.some((p) => p.c === c) && !c.aboveBudget && c.priceEur !== null && c.priceEur < first.priceEur!)
      .sort((a, b) => a.priceEur! - b.priceEur! || compareCandidates(a, b))[0];
    if (cheaper) {
      cheaper.reasons.push({ code: 'VOORDELIGER', priceEur: cheaper.priceEur!, thanEur: first.priceEur });
      picked.push({ c: cheaper, role: 'voordeliger' });
    }
  }

  return {
    category,
    noMatch: null,
    items: picked.map(({ c, role }) => ({
      shoe: c.shoe,
      role,
      certainty: certaintyOf(c),
      hard: c.hard,
      reasons: c.reasons,
      checks: c.checks,
      limits: c.limits,
      priceEur: c.priceEur,
      offers: catalog.offersOf(c.shoe),
      listings: catalog.listingsOf(c.shoe),
      imageUrl: c.shoe.imageUrl ?? catalog.listingsOf(c.shoe).find((l) => l.imageUrl)?.imageUrl ?? null,
      sources: sourceKinds(c.shoe),
      lastChecked: lastChecked(c.shoe),
    })),
  };
}

export function getShoeAdvice(answers: ShoeAnswers, catalog: ShoeCatalog, now: Date = new Date()): ShoeAdvice {
  if (answers.player === 'keeper') return { kind: 'keeper', ruleSetVersion: SHOE_RULE_SET_VERSION };
  const categories: ('veld' | 'zaal')[] = answers.purpose === 'beide' ? ['veld', 'zaal'] : [answers.purpose];
  return {
    kind: 'advice',
    ruleSetVersion: SHOE_RULE_SET_VERSION,
    advices: categories.map((category) => adviseFor(category, answers, catalog, now)),
  };
}
