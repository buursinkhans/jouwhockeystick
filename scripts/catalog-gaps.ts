// Catalog gaps (read-only): popular sticks on bol.com that are not in the
// catalog yet, from the weekly market-scan snapshot. For each candidate it
// also fetches bol.com's product data (offer, and specifications when the
// API returns them), so the catalog agent has a sourced starting point.
// Usage: npm run catalog:gaps -- <snapshot.json> <gaps.json> <gaps.md>
// Uses BOL_CLIENT_ID and BOL_CLIENT_SECRET when set; works without them.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { getCatalogProducts } from '../src/catalog/index';
import { findCatalogGaps, type CatalogGap } from '../src/catalog/gaps';
import type { MarketSnapshot } from '../src/market/marketScan';

const API = 'https://api.bol.com/marketing/catalog/v1';
const MAX_DETAILS = 6;
const MAX_DETAIL_CHARS = 6000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function bolToken(): Promise<string | null> {
  const id = process.env.BOL_CLIENT_ID?.trim();
  const secret = process.env.BOL_CLIENT_SECRET?.trim();
  if (!id || !secret) return null;
  const response = await fetch('https://login.bol.com/token?grant_type=client_credentials', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      Accept: 'application/json',
    },
    body: '',
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { access_token?: string };
  return body.access_token ?? null;
}

/** bol.com product data for one EAN; tries with specifications first, then without. */
async function bolDetails(ean: string, token: string): Promise<unknown> {
  for (const extra of ['&include-specifications=true&include-image=true', '']) {
    await sleep(300);
    const response = await fetch(`${API}/products/${ean}?country-code=NL&include-offer=true${extra}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Accept-Language': 'nl' },
    });
    if (response.ok) return response.json();
  }
  return null;
}

const euro = (n?: number) => (n === undefined ? '–' : `€${n.toFixed(2).replace('.', ',')}`);

function report(date: string, gaps: (CatalogGap & { bolData?: string })[]): string {
  const lines = [
    `# Ontbrekende sticks (${date})`,
    '',
    'Populaire sticks op bol.com die (nog) niet in onze catalogus lijken te staan, op volgorde van hun beste positie. De match is automatisch: controleer zelf of een model er niet onder een andere naam al in staat.',
    '',
  ];
  if (gaps.length === 0) lines.push('Geen: alle populaire sticks staan al in de catalogus.');
  for (const [i, gap] of gaps.entries()) {
    lines.push(
      `## ${i + 1}. ${gap.title}`,
      '',
      `- Beste positie: #${gap.bestRank} (${gap.queries.map((q) => `"${q}"`).join(', ')})`,
      `- EAN: ${gap.ean} · prijs bij meting: ${euro(gap.price)}`,
      ...(gap.url ? [`- bol.com: ${gap.url}`] : []),
      ...(gap.variants.length ? [`- Andere listings van dit model: ${gap.variants.join(' · ')}`] : []),
      '',
    );
    if (gap.bolData) lines.push('<details><summary>Productgegevens bol.com-API</summary>', '', '```json', gap.bolData, '```', '', '</details>', '');
  }
  return lines.join('\n');
}

async function main() {
  const [snapshotPath, jsonPath = 'gaps.json', mdPath = 'gaps.md'] = process.argv.slice(2);
  if (!snapshotPath) throw new Error('Gebruik: npm run catalog:gaps -- <snapshot.json> <gaps.json> <gaps.md>');
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as MarketSnapshot;
  const gaps: (CatalogGap & { bolData?: string })[] = findCatalogGaps(snapshot, getCatalogProducts());

  const token = await bolToken().catch(() => null);
  if (token) {
    for (const gap of gaps.slice(0, MAX_DETAILS)) {
      const data = await bolDetails(gap.ean, token).catch(() => null);
      if (data) gap.bolData = JSON.stringify(data, null, 1).slice(0, MAX_DETAIL_CHARS);
    }
  }

  writeFileSync(jsonPath, JSON.stringify(gaps, null, 1));
  writeFileSync(mdPath, report(snapshot.date, gaps));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `gaps=${gaps.length}\n`);
  console.log(`${gaps.length} ontbrekende sticks; bol.com-gegevens ${token ? 'opgehaald' : 'niet opgehaald (geen sleutels)'}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
