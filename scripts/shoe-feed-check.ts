// Hockey shoes in the partner feeds (read-only; step 2 of the /hockeyschoenen
// plan, issue #100). Reads the PassaHockey feed (TradeTracker, public URL) and
// the Plutosport feed (Awin; URL with API key in AWIN_PLUTOSPORT_FEED_URL),
// keeps the hockey shoes and writes a Dutch Markdown report: how many models,
// field/indoor, junior, brands, prices, stock and EANs per shop. Changes
// nothing in the catalog or on the site.
// Usage: npm run shoes:feed-check -- [report.md] [passa.xml] [pluto.csv(.gz)]
// With file arguments it reads those files instead of downloading.
import { writeFileSync } from 'node:fs';
import { shoeOverlap, summarizeShoes } from '../src/catalog/shoeFeed';
import { readPassa, readPlutosport, redact, type FeedResult } from './shoe-feeds';

const LIST_LIMIT = 40;

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const percent = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '–');
const cell = (text: string) => text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();

function shopSection(shop: string, result: FeedResult): string[] {
  if ('error' in result) return [`## ${shop}`, '', `**Niet gemeten:** ${result.error}`, ''];
  const s = summarizeShoes(result.models);
  const lines = [`## ${shop}`, '', result.note, ''];
  if (s.models === 0) return [...lines, '**Geen hockeyschoenen gevonden.**', ''];
  lines.push(
    `- **Modellen:** ${s.models} (${s.inStock} op voorraad)`,
    `- **Veld / zaal / onbekend:** ${s.veld} / ${s.zaal} / ${s.onbekend}`,
    `- **Junior (herkend aan de naam):** ${s.junior}`,
    `- **Met EAN:** ${s.withEan} (${percent(s.withEan, s.models)}), nodig om modellen tussen winkels te koppelen`,
    s.price
      ? `- **Prijs per model op voorraad (laagste maat):** ${euro(s.price.min)} tot ${euro(s.price.max)}, mediaan ${euro(s.price.median)} (25–75%: ${euro(s.price.p25)}–${euro(s.price.p75)})`
      : '- **Prijs:** niets op voorraad.',
    `- **Merken:** ${s.brands.map((b) => `${b.brand} (${b.models})`).join(', ')}`,
    '',
    '<details><summary>Categorieën in de feed (om het filter te controleren)</summary>',
    '',
    ...s.categories.slice(0, 25).map((c) => `- ${cell(c.text)} (${c.models})`),
    '',
    '</details>',
    '',
    `<details><summary>Modellen (eerste ${Math.min(LIST_LIMIT, s.models)} van ${s.models})</summary>`,
    '',
    '| Model | Merk | Veld/zaal | Junior | Maten | Prijs | Voorraad |',
    '|---|---|---|---|---|---|---|',
    ...result.models
      .slice(0, LIST_LIMIT)
      .map(
        (m) =>
          `| [${cell(m.name)}](${m.url}) | ${cell(m.brand) || '–'} | ${m.discipline} | ${m.junior ? 'ja' : ''} | ${cell(m.sizes.join(', ')) || '–'} | ${m.priceMin === m.priceMax ? euro(m.priceMin) : `${euro(m.priceMin)}–${euro(m.priceMax)}`} | ${m.inStock ? 'ja' : 'nee'} |`,
      ),
    '',
    '</details>',
    '',
  );
  return lines;
}

function report(date: string, passa: FeedResult, pluto: FeedResult): string {
  const count = (r: FeedResult) => ('error' in r ? null : r.models.length);
  const passaCount = count(passa);
  const plutoCount = count(pluto);
  const overlap = 'error' in passa || 'error' in pluto ? null : shoeOverlap(passa.models, pluto.models);
  const verdict =
    passaCount === null && plutoCount === null
      ? 'Geen van beide feeds kon worden gelezen.'
      : (passaCount ?? 0) + (plutoCount ?? 0) >= 25
        ? 'Genoeg schoenen in de feeds om de schoenencatalogus (stap 3) grotendeels uit de feeds te vullen, met specs van de merksites.'
        : 'Te weinig schoenen in de feeds: de schoenencatalogus (stap 3) moet grotendeels met de hand of via bol.com worden gevuld.';
  return [
    `# Hockeyschoenen in de partnerfeeds (${date})`,
    '',
    'Stap 2 van het plan voor `/hockeyschoenen` (#100). Alleen lezen: dit rapport verandert niets aan de catalogus of de site. Prijzen zijn feedprijzen op de meetdatum; zet ze nooit als korting op de site.',
    '',
    '## Samenvatting',
    '',
    `- **PassaHockey:** ${passaCount === null ? 'niet gemeten' : `${passaCount} modellen`}`,
    `- **Plutosport:** ${plutoCount === null ? 'niet gemeten' : `${plutoCount} modellen`}`,
    `- **Bij allebei (zelfde EAN):** ${overlap === null ? 'niet te bepalen' : `${overlap} van de Plutosport-modellen staan ook bij PassaHockey`}`,
    `- **Conclusie:** ${verdict}`,
    '- **Filter:** alleen producten in een hockeyschoenen-categorie van de winkel (of met "hockeyschoen" in de naam). Zaalhockeyschoenen zijn wat de winkel zelf onder zaalhockey zet; dat kunnen ook algemene indoorschoenen zijn.',
    '- **Niet gemeten:** bol.com (de bol-API zoekt op trefwoord; dat volgt pas als de sectie doorgaat).',
    '',
    ...shopSection('PassaHockey (TradeTracker)', passa),
    ...shopSection('Plutosport (Awin)', pluto),
    '_Automatisch gegenereerd door `scripts/shoe-feed-check.ts`._',
  ].join('\n');
}

async function main() {
  const [mdPath = 'shoes.md', passaPath, plutoPath] = process.argv.slice(2);
  const [passa, pluto] = await Promise.all([readPassa(passaPath), readPlutosport(plutoPath)]);
  writeFileSync(mdPath, report(new Date().toISOString().slice(0, 10), passa, pluto));
  for (const [shop, r] of [
    ['PassaHockey', passa],
    ['Plutosport', pluto],
  ] as const) {
    console.log('error' in r ? `${shop}: ${r.error}` : `${shop}: ${r.models.length} schoenmodellen`);
  }
  if ('error' in passa && 'error' in pluto) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
