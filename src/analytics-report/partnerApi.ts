// Read-only calls to the partner networks: bol.com Affiliate Reporting API,
// TradeTracker (PassaHockey, HockeyCity), Awin (Plutosport) and the Daisycon
// export (Daka). They return the raw answers; the parsing lives in sales.ts
// (counts, weekly report) and salesMoney.ts (amounts, daily figures, sealed).
// Secrets come from the environment and never reach a message.
import { PLUTOSPORT_AWIN } from '../lib/retailers';
import type { Period } from './sales';

// --- bol.com Affiliate Reporting API (OAuth client credentials) ----------

export async function bolToken(): Promise<string> {
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

export async function bolRaw(token: string, period: Period): Promise<unknown> {
  const url = new URL(
    'https://api.bol.com/marketing/affiliate/reports/v2/promotion-report',
  );
  url.searchParams.set('startDate', period.from);
  url.searchParams.set('endDate', period.to);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`rapport gaf HTTP ${response.status}`);
  return response.json();
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

export async function tradeTrackerSession(): Promise<string> {
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

/** The reference report of one TradeTracker campaign: PassaHockey or HockeyCity. */
export async function tradeTrackerRaw(
  session: string,
  { campaignId, affiliateSiteId }: { campaignId: string; affiliateSiteId: string },
  period: Period,
): Promise<string> {
  const { text } = await soap(
    'getReportReference',
    `<affiliateSiteID>${affiliateSiteId}</affiliateSiteID><options><campaignID>${campaignId}</campaignID><dateFrom>${period.from}</dateFrom><dateTo>${period.to}</dateTo></options>`,
    session,
  );
  return text;
}

// --- Awin publisher API (a static bearer token of the owner's Awin user) ---

const AWIN_API = 'https://api.awin.com';

/** GET with the token in the header, never in the URL. Errors name the path and the HTTP status only. */
async function awinGet(path: string, params: Record<string, string>): Promise<unknown> {
  const token = process.env.AWIN_API_TOKEN;
  if (!token) throw new Error('sleutel ontbreekt in GitHub Secrets');
  const url = new URL(path, AWIN_API);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token.trim()}` },
  });
  if (!response.ok) throw new Error(`Awin ${path} gaf HTTP ${response.status}`);
  return response.json();
}

/** The Plutosport transactions of a period (raw). */
export async function awinTransactionsRaw(period: Period): Promise<unknown> {
  const { advertiserId, publisherId } = PLUTOSPORT_AWIN;
  return awinGet(`/publishers/${publisherId}/transactions/`, {
    startDate: `${period.from}T00:00:00`,
    endDate: `${period.to}T23:59:59`,
    timezone: 'UTC',
    advertiserId,
  });
}

/** The advertiser performance report of a period (raw): clicks per advertiser. */
export async function awinAdvertiserRaw(period: Period): Promise<unknown> {
  return awinGet(`/publishers/${PLUTOSPORT_AWIN.publisherId}/reports/advertiser`, {
    startDate: period.from,
    endDate: period.to,
    region: 'NL',
    timezone: 'UTC',
  });
}

// --- Daisycon transaction export (a URL with a fixed export token) ----------

/**
 * The Daka transaction export of a period (raw). The URL (with token and user name) is the
 * secret DAISYCON_EXPORT_URL, without dates; the dates are added here. It never goes
 * into a message: errors name the HTTP status only. The API itself needs OAuth with a
 * refresh token that works only once, which does not fit a weekly workflow.
 */
export async function daisyconRaw(period: Period): Promise<unknown> {
  const base = process.env.DAISYCON_EXPORT_URL;
  if (!base) throw new Error('export-url ontbreekt in GitHub Secrets');
  let url: URL;
  try {
    url = new URL(base.trim());
  } catch {
    throw new Error('DAISYCON_EXPORT_URL is geen geldige url');
  }
  url.searchParams.set('start_date', period.from);
  url.searchParams.set('end_date', period.to);
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Daisycon-export gaf HTTP ${response.status}`);
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error('Daisycon-export gaf geen JSON');
  }
  return body;
}
