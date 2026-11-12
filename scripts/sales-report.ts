// Weekly sales report (counts only; the repository is public). Fetches clicks
// and orders per place on the site from the bol.com Affiliate Reporting API,
// the TradeTracker reference report, the Awin transactions (Plutosport) and the
// Daisycon transaction export (Daka), for the last 7 full days and the 7
// before, and prints a Markdown report. Each source fails on its own; secrets
// are never printed.
// Needs (GitHub Secrets): BOL_AFFILIATE_CLIENT_ID, BOL_AFFILIATE_CLIENT_SECRET,
// TRADETRACKER_CUSTOMER_ID, TRADETRACKER_PASSPHRASE, AWIN_API_TOKEN,
// DAISYCON_EXPORT_URL (the export URL with token and user name, without dates).
// Run with: npm run sales:report
import {
  awinClicks,
  awinSales,
  bolRows,
  daisyconSales,
  formatSalesReport,
  passaRows,
  type BolRow,
  type Counted,
  type PassaRow,
  type Period,
  type Source,
} from '../src/analytics-report/sales';
import {
  DAKA_DAISYCON,
  HOCKEYCITY_TRADETRACKER,
  PASSASPORTS_TRADETRACKER,
  PLUTOSPORT_AWIN,
} from '../src/lib/retailers';
import {
  awinAdvertiserRaw,
  awinTransactionsRaw,
  bolRaw,
  bolToken,
  daisyconRaw,
  tradeTrackerRaw,
  tradeTrackerSession,
} from '../src/analytics-report/partnerApi';

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

function periods(now: Date): { current: Period; previous: Period } {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const end = today - DAY;
  return {
    current: { from: iso(new Date(end - 6 * DAY)), to: iso(new Date(end)) },
    previous: {
      from: iso(new Date(end - 13 * DAY)),
      to: iso(new Date(end - 7 * DAY)),
    },
  };
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'onbekende fout';
}

// --- network calls (src/analytics-report/partnerApi.ts), parsed here ----

const bolReport = async (token: string, period: Period): Promise<BolRow[]> => bolRows(await bolRaw(token, period));
const tradeTrackerReport = async (
  session: string,
  campaign: { campaignId: string; affiliateSiteId: string },
  period: Period,
): Promise<PassaRow[]> => passaRows(await tradeTrackerRaw(session, campaign, period));
const awinSalesReport = async (period: Period): Promise<PassaRow[]> => awinSales(await awinTransactionsRaw(period));
async function awinClicksReport(period: Period): Promise<number> {
  const clicks = awinClicks(await awinAdvertiserRaw(period), PLUTOSPORT_AWIN.advertiserId);
  if (clicks === null) throw new Error(`geen rij voor adverteerder ${PLUTOSPORT_AWIN.advertiserId} in het Awin-rapport`);
  return clicks;
}
const daisyconReport = async (period: Period): Promise<PassaRow[]> =>
  daisyconSales(await daisyconRaw(period), DAKA_DAISYCON.programId);

// --- run ------------------------------------------------------------------

async function both<T>(
  load: () => Promise<(period: Period) => Promise<T[]>>,
  current: Period,
  previous: Period,
): Promise<{ current: Source<T>; previous: Source<T> }> {
  try {
    const fetchPeriod = await load();
    const [now, before] = await Promise.allSettled([
      fetchPeriod(current),
      fetchPeriod(previous),
    ]);
    const wrap = (r: PromiseSettledResult<T[]>): Source<T> =>
      r.status === 'fulfilled'
        ? { rows: r.value }
        : { error: message(r.reason) };
    return { current: wrap(now), previous: wrap(before) };
  } catch (error) {
    const failed = { error: message(error) };
    return { current: failed, previous: failed };
  }
}

async function counted(load: () => Promise<number>): Promise<Counted> {
  try {
    return { value: await load() };
  } catch (error) {
    return { error: message(error) };
  }
}

const { current, previous } = periods(new Date());
// One TradeTracker login for both campaigns.
const tradeTracker = tradeTrackerSession();
tradeTracker.catch(() => undefined);
const [bol, passa, hockeyCity, plutosport, plutoClicks, daka] = await Promise.all([
  both(
    async () => {
      const token = await bolToken();
      return (period: Period) => bolReport(token, period);
    },
    current,
    previous,
  ),
  both(
    async () => {
      const session = await tradeTracker;
      return (period: Period) =>
        tradeTrackerReport(session, PASSASPORTS_TRADETRACKER, period);
    },
    current,
    previous,
  ),
  both(
    async () => {
      const session = await tradeTracker;
      return (period: Period) =>
        tradeTrackerReport(session, HOCKEYCITY_TRADETRACKER, period);
    },
    current,
    previous,
  ),
  both(async () => awinSalesReport, current, previous),
  Promise.all([counted(() => awinClicksReport(current)), counted(() => awinClicksReport(previous))]),
  both(async () => daisyconReport, current, previous),
]);

process.stdout.write(
  formatSalesReport({
    current,
    previous,
    bol,
    passa,
    hockeyCity,
    plutosport: { ...plutosport, clicks: { current: plutoClicks[0], previous: plutoClicks[1] } },
    daka,
  }),
);
