// Runs the stickwijzer on the fixed bench profiles (src/advice-engine/benchProfiles.ts)
// and writes the outcome as JSON. With a baseline file it also writes a Dutch Markdown
// comparison, old next to new, per profile (decision log 2026-11-08).
// Usage: npm run stickwijzer:bench -- <out.json> [baseline.json] [report.md]
import { readFileSync, writeFileSync } from 'node:fs';
import { getAllProducts } from '../src/catalog/index';
import { getAdvice } from '../src/advice-engine/engine';
import { BENCH_PROFILES } from '../src/advice-engine/benchProfiles';
import { RULE_SET_VERSION } from '../src/advice-engine/ruleSetVersion';

type Outcome = {
  label: string;
  level: string;
  results: { role: string; name: string; price: number }[];
  noMatch: string | null;
  brandMiss: string | null;
};
type Snapshot = { ruleSetVersion: string; profiles: Record<string, Outcome> };

const [outPath, baselinePath, reportPath] = process.argv.slice(2);
if (!outPath) throw new Error('Usage: stickwijzer-bench <out.json> [baseline.json] [report.md]');

// A fixed date: the catalog's active products and price freshness must not differ between two runs.
const now = new Date('2026-11-08T12:00:00Z');
const products = getAllProducts(now, { includeImported: true });

const snapshot: Snapshot = { ruleSetVersion: RULE_SET_VERSION, profiles: {} };
for (const profile of BENCH_PROFILES) {
  const advice = getAdvice(profile.answers, products, { now });
  snapshot.profiles[profile.id] = {
    label: profile.label,
    level: advice.playerLevel.band,
    results: advice.results.map((item) => ({
      role: item.role,
      name: item.product.name,
      price: item.product.priceIndicativeEur.value,
    })),
    noMatch: advice.noMatchReason,
    brandMiss: advice.brandPreference && !advice.brandPreference.matched ? (advice.brandPreference.missReason ?? 'onbekend') : null,
  };
}
writeFileSync(outPath, `${JSON.stringify(snapshot, null, 1)}\n`);

if (baselinePath && reportPath) {
  const old = JSON.parse(readFileSync(baselinePath, 'utf8')) as Snapshot;
  const LEVEL: Record<string, string> = { starter: 'starter', developing: 'ontwikkelend', advanced: 'gevorderd' };
  const ROLE: Record<string, string> = {
    best_match: 'beste match',
    safe_choice: 'veilige keuze',
    ambitious_choice: 'ambitieus',
    same_brand: 'zelfde merk',
    other_brand: 'ander merk',
  };
  const list = (o: Outcome | undefined) =>
    !o
      ? '—'
      : o.results.length === 0
        ? `geen advies (${o.noMatch ?? 'onbekend'})`
        : o.results.map((r) => `${ROLE[r.role] ?? r.role}: ${r.name} (€${r.price})`).join('<br>');
  const rows = BENCH_PROFILES.map(({ id }) => {
    const a = old.profiles[id];
    const b = snapshot.profiles[id]!;
    const changed = JSON.stringify(a) !== JSON.stringify(b);
    const level = a && a.level !== b.level ? `${LEVEL[a.level]} → **${LEVEL[b.level]}**` : LEVEL[b.level];
    return `| ${changed ? '**' : ''}${b.label}${changed ? '**' : ''} | ${level} | ${list(a)} | ${list(b)} |`;
  });
  writeFileSync(
    reportPath,
    [
      `## Stickwijzer: ${old.ruleSetVersion} naast ${snapshot.ruleSetVersion}`,
      '',
      'Fictieve vaste profielen, zelfde catalogus. Vet = uitkomst veranderd.',
      '',
      '| Profiel | Niveau | Oud | Nieuw |',
      '|---|---|---|---|',
      ...rows,
      '',
    ].join('\n'),
  );
}
console.log(`${BENCH_PROFILES.length} profielen, regels ${RULE_SET_VERSION}`);
