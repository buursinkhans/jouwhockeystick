// Weekly shortlist for the Catalogus-verrijker: the imported PassaHockey
// sticks that matter most, most popular first. Popularity = how often the
// stickwijzer advises the stick (over a fixed set of player profiles) plus a
// bonus when it is among bol.com's most popular hockey sticks (market-scan
// snapshot, optional). Read-only. See docs/catalogus-verrijker.md.
// Run with: npm run catalog:enrich-list -- [snapshot.json] verrijken.md
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { AdviceAnswers } from '../src/advice-engine/answers';
import { getAdvice } from '../src/advice-engine/engine';
import {
  buildDevelopAnswers,
  buildPerformanceAnswers,
  buildStartAnswers,
} from '../src/advice-engine/testFixtures';
import { rankForEnrichment, type AdviceCount } from '../src/catalog/enrichList';
import { getAllProducts, getImportedProducts } from '../src/catalog/index';
import type { MarketSnapshot } from '../src/market/marketScan';

const WEEKLY = 20;

function profiles(): AdviceAnswers[] {
  const budgets = ['lt_75', '75_125', '125_175', '175_250', 'gt_250'] as const;
  const goals = [
    ['passing', 'first_touch'],
    ['dribble_3d', 'aerial'],
    ['hit', 'allround'],
    ['dragflick', 'hit'],
  ] as const;
  const feels = ['soft', 'balanced', 'direct'] as const;
  const adult = { advice_goal: 'self', age_band: '18_plus' } as const;
  const list: AdviceAnswers[] = [];
  for (const budget_band of budgets) {
    for (const height_cm of [115, 125, 135, 145, 155]) {
      list.push(buildStartAnswers({ budget_band, height_cm }));
      for (const g of goals)
        for (const feel_preference of feels)
          list.push(buildDevelopAnswers({ budget_band, height_cm, primary_goals: [...g], feel_preference }));
    }
    for (const height_cm of [165, 172, 178, 185, 192]) {
      list.push(buildStartAnswers({ ...adult, budget_band, height_cm }));
      for (const g of goals)
        for (const feel_preference of feels) {
          list.push(buildDevelopAnswers({ ...adult, budget_band, height_cm, primary_goals: [...g], feel_preference }));
          list.push(buildPerformanceAnswers({ ...adult, budget_band, height_cm, primary_goals: [...g], feel_preference }));
        }
    }
  }
  return list;
}

const args = process.argv.slice(2);
const out = args.at(-1) ?? 'verrijken.md';
const snapshotPath = args.length > 1 ? args[0] : undefined;

const now = new Date();
const catalog = getAllProducts(now, { includeImported: true });
const counts = new Map<string, AdviceCount>();
for (const answers of profiles()) {
  getAdvice(answers, catalog, { now }).results.forEach((result, i) => {
    if (result.product.feedImport === undefined) return;
    const c = counts.get(result.product.slug) ?? { inAdvice: 0, bestMatch: 0 };
    c.inAdvice++;
    if (i === 0) c.bestMatch++;
    counts.set(result.product.slug, c);
  });
}

let bolTitles: string[] = [];
if (snapshotPath && existsSync(snapshotPath)) {
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as MarketSnapshot;
  bolTitles = snapshot.bol.flatMap((list) => list.items.map((item) => item.title));
}

const ranked = rankForEnrichment(getImportedProducts(), counts, bolTitles).slice(0, WEEKLY);
const lines = [
  `# Te verrijken deze week (${ranked.length})`,
  '',
  'Data, geen opdracht. Populairste eerst: hoe vaak de stickwijzer de stick adviseert (en hoe vaak als beste match), plus of hij bij de populairste hockeysticks op bol.com staat.',
  bolTitles.length ? '' : '_Geen marktmeting beschikbaar: alleen het stickwijzer-signaal telt._',
  '',
  '| # | Stick | Slug | In advies | Beste match | Populair op bol.com | Prijs | Carbon | Kromming | Niveau (geschat) | PassaHockey |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...ranked.map(
    (c, i) =>
      `| ${i + 1} | ${c.product.name} | \`${c.product.slug}\` | ${c.inAdvice} | ${c.bestMatch} | ${c.bolPopular ? 'ja' : '–'} | €${c.product.priceIndicativeEur.value} | ${c.product.carbonPercentage?.value ?? '–'}${c.product.carbonPercentage ? '%' : ''} | ${c.product.bowProfile?.value ?? '–'} | ${c.product.experienceLevel.value} | ${c.product.passaSportsProductUrl ?? '–'} |`,
  ),
];
writeFileSync(out, lines.filter((l, i, all) => !(l === '' && all[i - 1] === '')).join('\n') + '\n');
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `todo=${ranked.length}\n`);
console.log(`${ranked.length} sticks op de lijst → ${out}`);
