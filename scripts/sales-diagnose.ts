// One-off diagnosis (read-only, manual): which fields does the TradeTracker reference report
// return for PassaHockey and HockeyCity, and how many sales does it count per place? Prints
// field names and counts only (names ending in "Count"), never amounts, sessions or secrets;
// the repository is public. Run with: npm run sales:diagnose -- 2026-11-18 2026-11-25
import { tradeTrackerCampaignRaw, tradeTrackerRaw, tradeTrackerSession, tradeTrackerTransactionsRaw } from '../src/analytics-report/partnerApi';
import { HOCKEYCITY_TRADETRACKER, PASSASPORTS_TRADETRACKER } from '../src/lib/retailers';

const [fromArg, toArg] = process.argv.slice(2);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
if (!fromArg || !toArg || !DATE.test(fromArg) || !DATE.test(toArg)) {
  process.stderr.write('Gebruik: sales:diagnose -- JJJJ-MM-DD JJJJ-MM-DD\n');
  process.exit(1);
}
const from: string = fromArg;
const to: string = toArg;

const tags = (xml: string) => [...xml.matchAll(/<([A-Za-z]+)(?:\s[^>]*)?>([^<]*)<\/\1>/g)].map((m) => [m[1]!, m[2]!.trim()] as const);

async function main() {
  const session = await tradeTrackerSession();
  for (const [naam, campaign] of [['PassaHockey', PASSASPORTS_TRADETRACKER], ['HockeyCity', HOCKEYCITY_TRADETRACKER]] as const) {
    const xml = await tradeTrackerRaw(session, campaign, { from, to });
    const blocks = xml.split(/<item\b[^>]*ReportReferenceElement[^>]*>/).slice(1);
    process.stdout.write(`\n## ${naam} ${from} t/m ${to}: ${blocks.length} referenties\n`);
    const names = new Set<string>();
    for (const block of blocks) {
      const all = tags(block);
      for (const [name] of all) names.add(name);
      const counts = all.filter(([name, value]) => /Count$/.test(name) && value !== '0' && value !== '');
      process.stdout.write(`- ${all.find(([n]) => n === 'reference')?.[1] || '(leeg)'}: ${counts.map(([n, v]) => `${n}=${v}`).join(', ') || 'alles 0'}\n`);
    }
    process.stdout.write(`Velden: ${[...names].join(', ')}\n`);

    // Campaign totals: do they include clicks and sales without a place reference?
    try {
      const total = await tradeTrackerCampaignRaw(session, campaign, { from, to });
      const counts = tags(total).filter(([n, v]) => /Count$/.test(n) && v !== '0' && v !== '');
      process.stdout.write(`Campagnetotaal: ${counts.map(([n, v]) => `${n}=${v}`).join(', ') || 'alles 0'}\n`);
    } catch (e) {
      process.stdout.write(`Campagnetotaal mislukt: ${e instanceof Error ? e.message : 'onbekende fout'}\n`);
    }

    // Transactions: status and reference per sale (no amounts).
    try {
      const xml = await tradeTrackerTransactionsRaw(session, campaign, { from, to });
      const items = xml.split(/<item\b[^>]*ConversionTransaction[^>]*>/).slice(1);
      process.stdout.write(`Transacties: ${items.length}\n`);
      for (const item of items) {
        const t = tags(item);
        const pick = (n: string) => t.find(([k]) => k === n)?.[1] || '-';
        process.stdout.write(`- ${pick('registrationDate').slice(0, 10)} | type=${pick('transactionType')} | status=${pick('transactionStatus')} | reference=${pick('reference')}\n`);
      }
    } catch (e) {
      process.stdout.write(`Transacties mislukt: ${e instanceof Error ? e.message : 'onbekende fout'}\n`);
    }
  }
}

main().catch((e: unknown) => {
  process.stderr.write(`Diagnose mislukt: ${e instanceof Error ? e.message : 'onbekende fout'}\n`);
  process.exit(1);
});
