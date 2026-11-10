/**
 * Paired tests (docs/marketing/bouwplan-2.0.md, fase 3): the same subject
 * twice, one variable different, on the same weekday and time, 1 to 2 weeks
 * apart. One test question at a time, starting with the hook type. Pure.
 */
import type { LabelKey, Labels } from './learning';

/** The order of the test questions: one at a time, the hook type first. */
export const TEST_ORDER: readonly LabelKey[] = ['hook', 'vorm', 'serie', 'tijd'];

export type TestPost = { id: string; onderwerp: string; datum: string; tijd: string; labels: Labels };
export type Pair = { vraag: LabelKey; a: TestPost; b: TestPost };

const weekday = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay();
const days = (a: string, b: string) => Math.abs(Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

/** Why a pair is not a fair test, or null when it is. */
export function pairProblem(vraag: LabelKey, a: TestPost, b: TestPost): string | null {
  if (a.onderwerp.trim().toLowerCase() !== b.onderwerp.trim().toLowerCase()) return 'Het onderwerp is niet hetzelfde.';
  if (weekday(a.datum) !== weekday(b.datum)) return 'Ze staan niet op dezelfde weekdag.';
  if (a.tijd !== b.tijd && vraag !== 'tijd') return 'Ze staan niet op dezelfde tijd.';
  const gap = days(a.datum, b.datum);
  if (gap < 7 || gap > 14) return 'Ze liggen niet 1 tot 2 weken uit elkaar.';
  if ((a.labels[vraag] ?? '') === (b.labels[vraag] ?? '')) return `Het verschil waar de test over gaat (${vraag}) ontbreekt.`;
  const other = (Object.keys({ ...a.labels, ...b.labels }) as LabelKey[]).filter((k) => k !== vraag && k !== 'pagina' && (a.labels[k] ?? '') !== (b.labels[k] ?? ''));
  if (other.length) return `Er verschilt meer dan één ding: ook ${other.join(', ')}.`;
  return null;
}

/** The test question for now: the first in TEST_ORDER that is not decided yet. */
export function currentQuestion(decided: readonly LabelKey[]): LabelKey | null {
  return TEST_ORDER.find((k) => !decided.includes(k)) ?? null;
}

/** May a new pair start? Only when no test is running (one question at a time). */
export const canStart = (running: readonly Pair[]) => running.length === 0;

/** The card label for a post in a test: "Test A" or "Test B". */
export const testLabel = (pair: Pair, postId: string) => (pair.a.id === postId ? 'Test A' : pair.b.id === postId ? 'Test B' : null);
