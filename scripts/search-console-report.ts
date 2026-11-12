// Weekly Search Console report (read-only). Logs in as a Google service
// account (GSC_SERVICE_ACCOUNT_JSON), fetches the last 28 days and the 28
// before, and prints a Markdown report. Signs the login token with Node's own
// crypto — no Google client library needed.
// Run with: npm run seo:report
import { getToken, readServiceAccount } from '../src/seo/googleAuth';
import { formatReport, type Period, type SearchRow } from '../src/seo/searchConsole';

const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
/** Search Console data lags about two to three days. */
const LAG_DAYS = 3;
const PERIOD_DAYS = 28;
const SITE_CANDIDATES = ['sc-domain:jouwhockeystick.nl', 'https://jouwhockeystick.nl/'];

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

type QueryResult =
  | { ok: true; rows: SearchRow[] }
  | { ok: false; status: number; detail: string };

async function query(
  siteUrl: string,
  period: Period,
  token: string,
  dimensions: ['query', 'page'] | ['page'],
): Promise<QueryResult> {
  const response = await fetch(
    `${API}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: period.start,
        endDate: period.end,
        dimensions,
        rowLimit: 5000,
      }),
    },
  );
  if (!response.ok) {
    return { ok: false, status: response.status, detail: (await response.text()).slice(0, 200) };
  }
  const body = (await response.json()) as {
    rows?: { keys: string[]; clicks: number; impressions: number; position: number }[];
  };
  return {
    ok: true,
    rows: (body.rows ?? []).map((row) => ({
      query: dimensions.length === 2 ? (row.keys[0] ?? '') : '',
      page: (dimensions.length === 2 ? row.keys[1] : row.keys[0]) ?? '',
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    })),
  };
}

async function main() {
  const account = readServiceAccount();
  const token = await getToken(account);
  const current = { start: isoDate(LAG_DAYS + PERIOD_DAYS - 1), end: isoDate(LAG_DAYS) };
  const previous = {
    start: isoDate(LAG_DAYS + 2 * PERIOD_DAYS - 1),
    end: isoDate(LAG_DAYS + PERIOD_DAYS),
  };

  const candidates = process.env.GSC_SITE_URL ? [process.env.GSC_SITE_URL] : SITE_CANDIDATES;
  const failures: string[] = [];
  for (const siteUrl of candidates) {
    const nowPages = await query(siteUrl, current, token, ['page']);
    if (!nowPages.ok) {
      failures.push(`\`${siteUrl}\`: HTTP ${nowPages.status} ${nowPages.detail}`);
      continue;
    }
    const rowsOf = (result: QueryResult) => (result.ok ? result.rows : []);
    const [now, before, beforePages] = await Promise.all([
      query(siteUrl, current, token, ['query', 'page']),
      query(siteUrl, previous, token, ['query', 'page']),
      query(siteUrl, previous, token, ['page']),
    ]);
    console.log(
      formatReport({
        siteUrl,
        current,
        previous,
        currentRows: rowsOf(now),
        previousRows: rowsOf(before),
        currentPages: nowPages.rows,
        previousPages: rowsOf(beforePages),
      }),
    );
    return;
  }
  throw new Error(
    [
      'Geen toegang tot de Search Console-property.',
      `Voeg \`${account.client_email}\` toe als gebruiker (rechten: Beperkt) in Search Console.`,
      '',
      ...failures.map((line) => `- ${line}`),
    ].join('\n'),
  );
}

main().catch((error: unknown) => {
  console.log(`# Search Console-rapport mislukt\n\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
