// bol.com feed check (test run): looks up every stick in the bol.com
// Marketing Catalog API and prints a Markdown report. Read-only — it never
// changes catalog data. Needs BOL_CLIENT_ID and BOL_CLIENT_SECRET.
// Run with: npm run bol:feed-check
import { getCatalogProducts } from '../src/catalog/index';
import type { Product } from '../src/catalog/types';

const API = 'https://api.bol.com/marketing/catalog/v1';
const TOKEN_URL = 'https://login.bol.com/token?grant_type=client_credentials';
/** The API allows 10 requests per second per endpoint; stay well below. */
const PAUSE_MS = 250;

type Json = Record<string, unknown>;

type BolProduct = {
  ean?: string;
  title?: string;
  url?: string;
  offer?: { price?: number; deliveryDescription?: string };
};

type Row =
  | {
      kind: 'linked';
      product: Product;
      ean: string | null;
      bol: BolProduct | null;
      error?: string;
    }
  | {
      kind: 'search';
      product: Product;
      candidates: BolProduct[];
      error?: string;
    };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Shape of a credential without revealing it: length, whitespace, UUID-like. */
function describeCredential(name: string, value: string): string {
  const trimmed = value.trim();
  const uuidLike =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    );
  const whitespace = trimmed.length !== value.length ? ', met spatie/enter aan begin of eind' : '';
  return `${name}: ${trimmed.length} tekens${uuidLike ? ', UUID-vorm' : ''}${whitespace}`;
}

async function requestToken(
  id: string,
  secret: string,
  style: 'basic' | 'form',
): Promise<Response> {
  if (style === 'basic') {
    return fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        Accept: 'application/json',
      },
      body: '',
    });
  }
  return fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ client_id: id, client_secret: secret }),
  });
}

async function getToken(): Promise<string> {
  const rawId = process.env.BOL_CLIENT_ID;
  const rawSecret = process.env.BOL_CLIENT_SECRET;
  if (!rawId || !rawSecret) {
    throw new Error(
      'BOL_CLIENT_ID en/of BOL_CLIENT_SECRET ontbreken (GitHub Secrets).',
    );
  }
  // Pasted secrets often carry a trailing newline or space.
  const id = rawId.trim();
  const secret = rawSecret.trim();

  const attempts: string[] = [];
  for (const style of ['basic', 'form'] as const) {
    const response = await requestToken(id, secret, style);
    if (response.ok) {
      const body = (await response.json()) as Json;
      if (typeof body.access_token === 'string') return body.access_token;
      attempts.push(`${style}: geen access_token in het antwoord`);
      continue;
    }
    // bol.com's error body (e.g. "invalid_client") contains no credentials.
    const detail = (await response.text()).slice(0, 300).replace(/\s+/g, ' ');
    attempts.push(`${style}: HTTP ${response.status} — ${detail || '(leeg)'}`);
  }
  throw new Error(
    [
      'Inloggen bij bol.com mislukt.',
      '',
      'Antwoorden van bol.com:',
      ...attempts.map((line) => `- ${line}`),
      '',
      'Vorm van de sleutels (waarden worden nooit getoond):',
      `- ${describeCredential('BOL_CLIENT_ID', rawId)}`,
      `- ${describeCredential('BOL_CLIENT_SECRET', rawSecret)}`,
    ].join('\n'),
  );
}

/** GET with one retry on 429. Returns null on 404 (unknown product). */
async function get(path: string, token: string): Promise<Json | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    await sleep(PAUSE_MS);
    const response = await fetch(`${API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Accept-Language': 'nl',
      },
    });
    if (response.status === 429 && attempt === 0) {
      await sleep(1500);
      continue;
    }
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status} op ${path}`);
    return (await response.json()) as Json;
  }
  throw new Error(`Rate limit op ${path}`);
}

/** bol.com product URLs end in the 16-digit bol product ID. */
export function bolProductIdFromUrl(url: string): string | null {
  return url.match(/\/(\d{16})\/?$/)?.[1] ?? null;
}

/** The to-ean response shape is not documented in detail; take the first EAN-like value. */
function findEan(body: Json): string | null {
  const match = JSON.stringify(body).match(/"(\d{13})"/);
  return match?.[1] ?? null;
}

function asBolProduct(value: unknown): BolProduct {
  return (typeof value === 'object' && value !== null ? value : {}) as BolProduct;
}

async function checkLinked(product: Product, url: string, token: string): Promise<Row> {
  const bolId = bolProductIdFromUrl(url);
  if (!bolId) {
    return { kind: 'linked', product, ean: null, bol: null, error: 'Geen bol-product-ID in de URL' };
  }
  try {
    const idBody = await get(`/products/${bolId}/to-ean`, token);
    const ean = idBody ? findEan(idBody) : null;
    if (!ean) {
      return { kind: 'linked', product, ean: null, bol: null, error: 'Product-ID onbekend bij bol.com' };
    }
    const body = await get(
      `/products/${ean}?country-code=NL&include-offer=true`,
      token,
    );
    return { kind: 'linked', product, ean, bol: body ? asBolProduct(body) : null };
  } catch (error) {
    return { kind: 'linked', product, ean: null, bol: null, error: String(error) };
  }
}

async function checkSearch(product: Product, token: string): Promise<Row> {
  const term = encodeURIComponent(`${product.name} hockeystick`);
  try {
    const body = await get(
      `/products/search?search-term=${term}&country-code=NL&page-size=3&include-offer=true`,
      token,
    );
    const results = Array.isArray(body?.results) ? body.results : [];
    return { kind: 'search', product, candidates: results.map(asBolProduct) };
  } catch (error) {
    return { kind: 'search', product, candidates: [], error: String(error) };
  }
}

const euro = (value: number | undefined) =>
  value === undefined ? '–' : `€${value.toFixed(2).replace('.', ',')}`;

function formatReport(rows: Row[], date: string): string {
  const linked = rows.filter((row) => row.kind === 'linked');
  const search = rows.filter((row) => row.kind === 'search');
  const found = linked.filter((row) => row.bol !== null);
  const lines = [
    `# bol.com feed — testrun ${date}`,
    '',
    'Alleen-lezen controle: er is niets aan de catalogus veranderd.',
    '',
    `- **${found.length} van ${linked.length}** sticks met directe link gevonden bij bol.com.`,
    `- **${search.length}** sticks zonder directe link: hieronder de beste zoekresultaten om te beoordelen.`,
    '',
    '## Sticks met directe link',
    '',
    '| Stick | EAN | Titel bij bol.com | Prijs bol.com | Richtprijs | Status |',
    '|---|---|---|---|---|---|',
  ];
  for (const row of linked) {
    const status = row.error
      ? `⚠️ ${row.error}`
      : row.bol?.offer?.price !== undefined
        ? '✅ te koop'
        : '⚠️ geen aanbod';
    lines.push(
      `| ${row.product.name} | ${row.ean ?? '–'} | ${row.bol?.title ?? '–'} | ${euro(row.bol?.offer?.price)} | ${euro(row.product.priceIndicativeEur.value)} | ${status} |`,
    );
  }
  lines.push('', '## Sticks zonder directe link: kandidaten', '');
  for (const row of search) {
    lines.push(`### ${row.product.name}`);
    if (row.error) lines.push(`⚠️ ${row.error}`);
    if (row.candidates.length === 0 && !row.error) lines.push('Geen resultaten.');
    for (const candidate of row.candidates) {
      lines.push(
        `- ${candidate.title ?? '(geen titel)'} — EAN ${candidate.ean ?? '–'}, ${euro(candidate.offer?.price)}${candidate.url ? ` — [bekijk](${candidate.url})` : ''}`,
      );
    }
    lines.push('');
  }
  lines.push(
    '_Kandidaten worden nooit automatisch gekoppeld: kies per stick de juiste, dan zet de agent hem in een PR._',
  );
  return lines.join('\n');
}

async function main() {
  const token = await getToken();
  const rows: Row[] = [];
  for (const product of getCatalogProducts()) {
    rows.push(
      product.bolProductUrl
        ? await checkLinked(product, product.bolProductUrl, token)
        : await checkSearch(product, token),
    );
  }
  console.log(formatReport(rows, new Date().toISOString().slice(0, 10)));
}

if (process.argv[1]?.endsWith('bol-feed-check.ts')) {
  main().catch((error: unknown) => {
    console.log(`# bol.com feed — testrun mislukt\n\n${String(error)}`);
    process.exitCode = 1;
  });
}
