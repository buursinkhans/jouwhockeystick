/**
 * For the workflow lessen.yml: adds the ticked lessons of a proposals issue to
 * docs/marketing/merkplatform.md. The issue body comes in through the
 * environment (ISSUE_BODY), never the shell. Prints the number of lessons added.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { addLessons, parseTicks } from '../src/marketing/voorstellenIssue';

const FILE = 'docs/marketing/merkplatform.md';
const { lessen } = parseTicks(process.env.ISSUE_BODY ?? '');
const before = readFileSync(FILE, 'utf8');
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());
const after = addLessons(before, lessen, date);
if (after !== before) writeFileSync(FILE, after);
console.log(String(lessen.filter((l) => !before.includes(`<!-- les:${l.id} -->`)).length));
