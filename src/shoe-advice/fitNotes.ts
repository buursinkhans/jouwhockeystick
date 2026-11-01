/**
 * Question 7 of the keuzemodel (§5): fit particulars. Handled only in the
 * browser: the answer is never sent to our server, never in analytics, the
 * share link or a log (decision log 2026-11-01). It does not change the
 * selection; it adds fixed texts and turns the certainty to conditional where
 * an insole or brace has to be tried in the shoe. No diagnosis, no cure claim.
 */
import type { AdviceCertainty } from './types';

export const FIT_PARTICULARS = ['inlegzool-brace', 'pijn-blessure', 'blaren-schuiven', 'geen'] as const;
export type FitParticular = (typeof FIT_PARTICULARS)[number];

export type FitNotes = {
  /** Shown above the advice. */
  notices: string[];
  /** Extra checks for every advised model. */
  checks: string[];
  /** With an own insole or brace a "goede onderbouwing" becomes conditional. */
  certainty: (certainty: AdviceCertainty) => AdviceCertainty;
};

/** Fixed text for pain or an injury: a referral, never a diagnosis or a corrective choice. */
export const PAIN_NOTICE =
  'Je gaf aan dat je terugkerende pijn of een recente blessure hebt. Een schoenadvies online kan daar geen rekening mee houden en is geen oplossing voor klachten. Laat je voet en je klachten beoordelen door bijvoorbeeld je huisarts, een fysiotherapeut of een podotherapeut, en neem hun advies mee als je gaat passen.';

export function fitNotes(particulars: readonly FitParticular[]): FitNotes {
  const set = new Set(particulars.filter((p) => p !== 'geen'));
  const notices: string[] = [];
  const checks: string[] = [];
  if (set.has('pijn-blessure')) notices.push(PAIN_NOTICE);
  if (set.has('inlegzool-brace')) {
    checks.push('Pas de schoen met je eigen inlegzolen of brace: of die erin passen, is online niet te zien.');
  }
  if (set.has('blaren-schuiven')) {
    checks.push('Let bij het passen op de plek waar je nu blaren, drukplekken of schuiven hebt. De oorzaak staat daarmee nog niet vast.');
  }
  return {
    notices,
    checks,
    certainty: (certainty) => (set.has('inlegzool-brace') && certainty === 'goede-onderbouwing' ? 'voorwaardelijk' : certainty),
  };
}
