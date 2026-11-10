/**
 * Helpers for the Onderzoeker and the Social-planner (docs/marketing/onderzoeker.md).
 * No dependencies beyond Node, so they run in a claude.ai cloud session.
 *   kalender <van> <tot> <markt>      per week (Monday): moments, Push block and phase (pulse/push)
 * The site comes from MARKETING_SITE, else marketing/sites/standaard.txt.
 *   score <ideeen.json>               the ten best ideas with points and reasons
 *   lessen <resultaten.json> <vandaag> lesson candidates (at least 5 posts per variant)
 *   paar <paar.json>                  is a paired test fair? {vraag, a, b}
 *   issue <week> <voorstellen.json> <lessen.json>  the body of the proposals issue
 *   vinkjes <body.md>                 the ticked proposals and lessons
 *   kpi <weken.json>                  per market: the KPIs of the last week and the comparison with the 4 weeks before
 */
import { readFileSync } from 'node:fs';
import { pairProblem } from '../src/marketing/abtest';
import { momentsOn, pushOn } from '../src/marketing/calendar';
import { loadSiteConfig, market } from '../src/marketing/siteConfig';
import { kpis, weekComparison, type WeekNumbers } from '../src/marketing/kpi';
import { lessons, type Result } from '../src/marketing/learning';
import { rankIdeas, type IdeaFacts } from '../src/marketing/research';
import { buildIssueBody, parseTicks } from '../src/marketing/voorstellenIssue';

const [cmd, a, b, c] = process.argv.slice(2);
const json = (file: string | undefined) => JSON.parse(readFileSync(file ?? '', 'utf8')) as unknown;
const day = /^\d{4}-\d{2}-\d{2}$/;

const config = loadSiteConfig();

function weeks(from: string, to: string, marketId: string) {
  const m = market(config, marketId);
  const out = [];
  const d = new Date(`${from}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  for (; d.toISOString().slice(0, 10) <= to; d.setUTCDate(d.getUTCDate() + 7)) {
    const mon = d.toISOString().slice(0, 10);
    const thu = new Date(d.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);
    const push = pushOn(thu, m, config.seizoenStart);
    out.push({ van: mon, momenten: momentsOn(thu, m, config.seizoenStart).map((x) => x.naam), push: push ? { naam: push.naam, vervolgstap: push.vervolgstap } : null, fase: push ? 'push' : 'pulse' });
  }
  return out;
}

try {
  if (cmd === 'kalender') {
    if (!day.test(a ?? '') || !day.test(b ?? '') || !c) throw new Error('Gebruik: kalender <JJJJ-MM-DD> <JJJJ-MM-DD> <markt>');
    console.log(JSON.stringify(weeks(a!, b!, c), null, 2));
  } else if (cmd === 'score') {
    console.log(JSON.stringify(rankIdeas(json(a) as IdeaFacts[], config), null, 2));
  } else if (cmd === 'lessen') {
    if (!day.test(b ?? '')) throw new Error('Gebruik: lessen <resultaten.json> <JJJJ-MM-DD>');
    console.log(JSON.stringify(lessons(json(a) as Result[], b!), null, 2));
  } else if (cmd === 'paar') {
    const p = json(a) as { vraag: Parameters<typeof pairProblem>[0]; a: Parameters<typeof pairProblem>[1]; b: Parameters<typeof pairProblem>[2] };
    const problem = pairProblem(p.vraag, p.a, p.b);
    console.log(JSON.stringify({ eerlijk: problem === null, probleem: problem }));
  } else if (cmd === 'issue') {
    console.log(buildIssueBody(a ?? '', json(b) as Parameters<typeof buildIssueBody>[1], json(c) as Parameters<typeof buildIssueBody>[2]));
  } else if (cmd === 'kpi') {
    const weeks = json(a) as WeekNumbers[];
    const markets = [...new Set(weeks.map((w) => w.markt))];
    const out = markets.map((m) => {
      const own = weeks.filter((w) => w.markt === m).sort((x, y) => x.week.localeCompare(y.week)).map(kpis);
      return { markt: m, week: own.at(-1), vergelijking: weekComparison(own, config.noordster.naam) };
    });
    console.log(JSON.stringify(out, null, 2));
  } else if (cmd === 'vinkjes') {
    console.log(JSON.stringify(parseTicks(readFileSync(a ?? '', 'utf8'))));
  } else {
    throw new Error('Gebruik: kalender | score | lessen | paar | issue | vinkjes | kpi');
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
