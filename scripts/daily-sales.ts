// Daily sales figures per partner (read-only), sealed. For today so far, yesterday, the
// last 7 days, the 7 before and this month: clicks, orders, order value and
// commission per partner. The result is sealed with VERKOOP_SLEUTEL
// (src/marketing/seal.ts) and written to the path in the first argument; the
// amounts never appear in plain text outside the runner (the repository is
// public). Without VERKOOP_SLEUTEL nothing is written. Each partner fails on
// its own; errors name only the partner and the HTTP status.
// Run with: npm run sales:daily -- verkoop.json
import { writeFileSync } from 'node:fs';
import {
  awinAdvertiserRaw,
  awinTransactionsRaw,
  bolRaw,
  bolToken,
  daisyconRaw,
  tradeTrackerRaw,
  tradeTrackerSession,
} from '../src/analytics-report/partnerApi';
import { awinClicks, type Period } from '../src/analytics-report/sales';
import { awinMoney, bolMoney, daisyconMoney, tradeTrackerMoney, type Money } from '../src/analytics-report/salesMoney';
import { DAKA_DAISYCON, HOCKEYCITY_TRADETRACKER, PASSASPORTS_TRADETRACKER, PLUTOSPORT_AWIN } from '../src/lib/retailers';
import { seal } from '../src/marketing/seal';

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const why = (e: unknown) => (e instanceof Error ? e.message : 'onbekende fout');

type Result = Money | { fout: string };
type PeriodKey = 'vandaag' | 'gisteren' | 'week' | 'vorigeWeek' | 'maand';

function periods(now: Date): Record<PeriodKey, Period> {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const y = today - DAY;
  const yd = new Date(y);
  return {
    vandaag: { from: iso(today), to: iso(today) },
    gisteren: { from: iso(y), to: iso(y) },
    week: { from: iso(y - 6 * DAY), to: iso(y) },
    vorigeWeek: { from: iso(y - 13 * DAY), to: iso(y - 7 * DAY) },
    maand: { from: iso(Date.UTC(yd.getUTCFullYear(), yd.getUTCMonth(), 1)), to: iso(y) },
  };
}

async function perPeriod(
  ps: Record<PeriodKey, Period>,
  load: () => Promise<(p: Period) => Promise<Money>>,
): Promise<Record<PeriodKey, Result>> {
  const keys = Object.keys(ps) as PeriodKey[];
  try {
    const run = await load();
    const out = {} as Record<PeriodKey, Result>;
    // One period at a time: the networks rate-limit.
    for (const k of keys) {
      try {
        out[k] = await run(ps[k]);
      } catch (e) {
        out[k] = { fout: why(e) };
      }
    }
    return out;
  } catch (e) {
    return Object.fromEntries(keys.map((k) => [k, { fout: why(e) }])) as Record<PeriodKey, Result>;
  }
}

async function main() {
  const passphrase = process.env.VERKOOP_SLEUTEL;
  if (!passphrase) {
    process.stderr.write('VERKOOP_SLEUTEL ontbreekt (GitHub Secrets): geen verkoopcijfers geschreven.\n');
    process.exitCode = 3;
    return;
  }
  const ps = periods(new Date());
  const tt = tradeTrackerSession();
  tt.catch(() => undefined);

  const partners = [
    {
      id: 'bol',
      naam: 'bol.com',
      periodes: await perPeriod(ps, async () => {
        const token = await bolToken();
        return async (p) => bolMoney(await bolRaw(token, p));
      }),
    },
    {
      id: 'passahockey',
      naam: 'PassaHockey',
      periodes: await perPeriod(ps, async () => {
        const s = await tt;
        return async (p) => tradeTrackerMoney(await tradeTrackerRaw(s, PASSASPORTS_TRADETRACKER, p));
      }),
    },
    {
      id: 'hockeycity',
      naam: 'HockeyCity',
      periodes: await perPeriod(ps, async () => {
        const s = await tt;
        return async (p) => tradeTrackerMoney(await tradeTrackerRaw(s, HOCKEYCITY_TRADETRACKER, p));
      }),
    },
    {
      id: 'plutosport',
      naam: 'Plutosport',
      periodes: await perPeriod(ps, async () => async (p) => {
        let kliks: number | null = null;
        try {
          kliks = awinClicks(await awinAdvertiserRaw(p), PLUTOSPORT_AWIN.advertiserId);
        } catch {
          kliks = null;
        }
        return awinMoney(await awinTransactionsRaw(p), kliks);
      }),
    },
    {
      id: 'daka',
      naam: 'Daka',
      periodes: await perPeriod(ps, async () => async (p) => daisyconMoney(await daisyconRaw(p), DAKA_DAISYCON.programId)),
    },
  ];

  const value = {
    versie: 1,
    gemaakt: new Date().toISOString(),
    periodes: ps,
    partners,
    noot: 'Inclusief orders die de partner nog moet goedkeuren; afgewezen orders tellen niet. Daka geeft geen kliks.',
  };
  writeFileSync(process.argv[2] ?? 'verkoop.json', `${JSON.stringify(seal(value, passphrase))}\n`);

  // Only names and errors in the log, never amounts.
  const failed = partners.flatMap((p) =>
    Object.entries(p.periodes)
      .filter(([, r]) => 'fout' in r)
      .map(([k, r]) => `${p.naam} (${k}): ${(r as { fout: string }).fout}`),
  );
  for (const line of failed) process.stderr.write(`${line}\n`);
  if (failed.length) process.exitCode = 2;
}

main().catch((e: unknown) => {
  process.stderr.write(`Verkoopcijfers mislukt: ${why(e)}\n`);
  process.exit(1);
});
