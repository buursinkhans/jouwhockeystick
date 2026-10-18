// Weekly sales report (counts only; the repository is public). Fetches clicks
// and orders per place on the site from the bol.com Affiliate Reporting API
// and the TradeTracker reference report, for the last 7 full days and the 7
// before, and prints a Markdown report. Each source fails on its own; secrets
// are never printed.
// Needs (GitHub Secrets): BOL_AFFILIATE_CLIENT_ID, BOL_AFFILIATE_CLIENT_SECRET,
// TRADETRACKER_CUSTOMER_ID, TRADETRACKER_PASSPHRASE.
// Run with: npm run sales:report
import {
  bolRows,
  formatSalesReport,
  passaRows,
  type BolRow,
  type PassaRow,
  type Period,
  type Source,
} from '../src/analytics-report/sales';
import { PASSASPORTS_TRADETRACKER } from '../src/lib/retailers';

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

// --- bol.com Affiliate Reporting API (OAuth client credentials) ----------

async function bolToken(): Promise<string> {
  const id = process.env.BOL_AFFILIATE_CLIENT_ID;
  const secret = process.env.BOL_AFFILIATE_CLIENT_SECRET;
  if (!id || !secret) throw new Error('sleutels ontbreken in GitHub Secrets');
  const response = await fetch(
    'https://login.bol.com/token?grant_type=client_credentials',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      },
    },
  );
  if (!response.ok) throw new Error(`inloggen gaf HTTP ${response.status}`);
  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error('geen token ontvangen');
  return body.access_token;
}

async function bolReport(token: string, period: Period): Promise<BolRow[]> {
  const url = new URL(
    'https://api.bol.com/marketing/affiliate/reports/v2/promotion-report',
  );
  url.searchParams.set('startDate', period.from);
  url.searchParams.set('endDate', period.to);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`rapport gaf HTTP ${response.status}`);
  return bolRows(await response.json());
}

// --- TradeTracker affiliate web service (SOAP, session cookie) -----------

const TT_ENDPOINT = 'https://ws.tradetracker.com/soap/affiliate';

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function soap(
  operation: string,
  body: string,
  cookie?: string,
): Promise<{ text: string; cookie?: string }> {
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://ws.tradetracker.com/soap/affiliate"><SOAP-ENV:Body><ns1:${operation}>${body}</ns1:${operation}></SOAP-ENV:Body></SOAP-ENV:Envelope>`;
  const response = await fetch(TT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `"http://ws.tradetracker.com/soap/affiliate/${operation}"`,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: envelope,
  });
  const text = await response.text();
  if (!response.ok || text.includes('Fault>')) {
    const fault = text.match(/<faultstring>([^<]*)<\/faultstring>/)?.[1];
    throw new Error(
      `${operation} gaf HTTP ${response.status}${fault ? `: ${fault}` : ''}`,
    );
  }
  const setCookies = response.headers.getSetCookie();
  return {
    text,
    cookie: setCookies.length
      ? setCookies.map((c) => c.split(';')[0]).join('; ')
      : undefined,
  };
}

async function tradeTrackerSession(): Promise<string> {
  const id = process.env.TRADETRACKER_CUSTOMER_ID;
  const passphrase = process.env.TRADETRACKER_PASSPHRASE;
  if (!id || !passphrase)
    throw new Error('sleutels ontbreken in GitHub Secrets');
  const { cookie } = await soap(
    'authenticate',
    `<customerID>${xmlEscape(id.trim())}</customerID><passphrase>${xmlEscape(passphrase.trim())}</passphrase><sandbox>false</sandbox><locale>nl_NL</locale><demo>false</demo>`,
  );
  if (!cookie) throw new Error('inloggen gaf geen sessie');
  return cookie;
}

async function passaReport(
  session: string,
  period: Period,
): Promise<PassaRow[]> {
  const { campaignId, affiliateSiteId } = PASSASPORTS_TRADETRACKER;
  const { text } = await soap(
    'getReportReference',
    `<affiliateSiteID>${affiliateSiteId}</affiliateSiteID><options><campaignID>${campaignId}</campaignID><dateFrom>${period.from}</dateFrom><dateTo>${period.to}</dateTo></options>`,
    session,
  );
  return passaRows(text);
}

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

const { current, previous } = periods(new Date());
const [bol, passa] = await Promise.all([
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
      const session = await tradeTrackerSession();
      return (period: Period) => passaReport(session, period);
    },
    current,
    previous,
  ),
]);

process.stdout.write(formatSalesReport({ current, previous, bol, passa }));
