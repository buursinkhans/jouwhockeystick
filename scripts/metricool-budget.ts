/**
 * For the Publiceerder (docs/marketing/publiceerder.md): may one more Metricool
 * post be created for a month?
 *   npm run --silent marketing:budget -- <input.json>
 * input.json: {"month": "YYYY-MM", "scheduled": [{uuid, moment}], "studio": [{uuid, moment}]}
 * Prints the decision as JSON; exit 0 when allowed, 3 when the allowance is used up.
 */
import { readFileSync } from 'node:fs';
import { budgetFor, usedInMonth, type PlannedPost } from '../src/marketing/metricoolBudget';

const file = process.argv[2];
if (!file) {
  console.error('Gebruik: npm run --silent marketing:budget -- <input.json>');
  process.exit(2);
}
const input = JSON.parse(readFileSync(file, 'utf8')) as { month: string; scheduled?: PlannedPost[]; studio?: PlannedPost[] };
if (!/^\d{4}-\d{2}$/.test(input.month)) {
  console.error('month moet JJJJ-MM zijn.');
  process.exit(2);
}
const decision = budgetFor(input.month, usedInMonth(input.month, input.scheduled ?? [], input.studio ?? []));
console.log(JSON.stringify(decision));
process.exit(decision.ok ? 0 : 3);
