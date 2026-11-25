// Imports a Google Trends CSV export into data/trends/ (public index data, committed).
// Checks the file, says what it dropped and why, refuses a duplicate, and replaces an older
// export of the same comparison. Writes nothing when the file is not usable.
//
// Usage:
//   npm run trends:import -- <bestand.csv> --thema <naam> [--rol referentie|thema]
//       [--regio NL] [--zoektype web] [--categorie alle] [--geexporteerd JJJJ-MM-DD] [--proef]
// --proef: only check and report, write nothing.
// Defaults: rol is "referentie" for the theme "referentie", otherwise "thema"; the region and the
// export day come from the file name that Google gives (time_series_NL_..._20261125-2141.csv).
// Docs: docs/seo-trends-import.md
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import {
  ANCHOR_TERM,
  exportKey,
  importVerdict,
  parseTrendsCsv,
  peakMonths,
  seasonProfile,
  termOf,
  TrendExport,
} from '../src/seo/trends';
import { agendaMarkdown } from '../src/seo/seasonAgenda';
import { readTrendExports, writeTrendExport } from '../src/seo/trendsFiles';

const say = (text: string) => process.stdout.write(`${text}\n`);
const stop = (text: string): never => {
  process.stderr.write(`${text}\n`);
  process.exit(1);
};

function option(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 ? process.argv[at + 1] : undefined;
}

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function main() {
  const file = process.argv[2];
  if (!file || file.startsWith('--')) return stop('Geef het CSV-bestand mee: npm run trends:import -- bestand.csv --thema maat');
  const thema = option('thema');
  if (!thema) return stop('Geef een thema mee met --thema (bijvoorbeeld referentie, maat, merken, zaal of kopen).');

  const read = parseTrendsCsv(readFileSync(file, 'utf8'));
  if (!read.ok) return stop(`Niet bruikbaar: ${read.reden}`);
  // Terms are stored in lower case, so "Hockeystick" and "hockeystick" are the same term.
  const parsed = {
    ...read,
    termen: read.termen.map((t) => ({ ...t, term: t.term.toLowerCase() })),
    genegeerd: read.genegeerd.map((g) => ({ ...g, term: g.term.toLowerCase() })),
  };

  const name = basename(file);
  const geo = option('regio') ?? name.match(/_([A-Z]{2})_\d{8}/)?.[1] ?? 'NL';
  const exportedFromName = name.match(/_(\d{4})(\d{2})(\d{2})-\d{4}\.csv$/);
  const geexporteerd = option('geexporteerd') ?? (exportedFromName ? `${exportedFromName[1]}-${exportedFromName[2]}-${exportedFromName[3]}` : new Date().toISOString().slice(0, 10));
  const rol = (option('rol') as 'referentie' | 'thema' | undefined) ?? (thema === 'referentie' ? 'referentie' : 'thema');

  const hasAnchor = parsed.termen.some((t) => t.term.toLowerCase() === ANCHOR_TERM);
  if (rol === 'referentie' && !hasAnchor) return stop(`Een referentie-export moet de ankerterm "${ANCHOR_TERM}" bevatten.`);
  if (rol === 'thema' && hasAnchor) {
    return stop(`Een thema-export bevat de ankerterm "${ANCHOR_TERM}" niet: die is zo veel groter dat de kleine termen op 0 tot 5 uitkomen. Haal hem uit de vergelijking, of importeer dit als referentie.`);
  }

  const first = parsed.termen[0]?.punten[0]?.[0] ?? '';
  const last = parsed.termen[0]?.punten.at(-1)?.[0] ?? '';
  const incoming: TrendExport = TrendExport.parse({
    versie: 1,
    thema,
    rol,
    regio: geo,
    zoektype: option('zoektype') ?? 'web',
    categorie: option('categorie') ?? 'alle',
    granulariteit: parsed.granulariteit,
    periode: { start: first, end: last },
    geexporteerd,
    bron: 'Handmatige CSV-export van Google Trends (relatieve index, geen zoekaantallen)',
    termen: parsed.termen,
    genegeerd: parsed.genegeerd,
  });

  const loaded = readTrendExports();
  const verdict = importVerdict(incoming, loaded.exports);

  say(`Bestand: ${name}`);
  say(`Thema: ${thema} (${rol}), regio ${geo}, ${incoming.zoektype}, categorie ${incoming.categorie}`);
  say(`Periode: ${first} t/m ${last}, ${incoming.granulariteit}, ${parsed.termen[0]?.punten.length} punten, geëxporteerd op ${geexporteerd}`);
  say('Termen:');
  for (const t of parsed.termen) {
    const values = t.punten.map(([, v]) => v);
    const seen = termOf(t, geexporteerd.slice(0, 7));
    const peaks = seen.piekmaanden.length ? `, piek in ${seen.piekmaanden.map((m) => MONTHS[m - 1]).join(' ')}` : '';
    say(`  ${t.term}: gemiddeld ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}, hoogste ${Math.max(...values)}, gelijkenis tussen jaren ${seen.gelijkenis ?? '–'}, betrouwbaarheid ${seen.betrouwbaarheid}${peaks}`);
  }
  for (const g of parsed.genegeerd) say(`  Weggelaten: ${g.term} (${g.reden})`);
  if (rol === 'referentie') {
    const profile = seasonProfile(parsed.termen.find((t) => t.term === ANCHOR_TERM)?.punten ?? [], geexporteerd.slice(0, 7));
    say(profile ? `Jaarpatroon van ${ANCHOR_TERM}: piekmaanden ${peakMonths(profile).map((m) => MONTHS[m - 1]).join(', ')} (uit ${profile.jaren.length} volledige jaren)` : 'Nog geen jaarpatroon: er zijn minder dan twee volledige jaren.');
  }
  say(`Sleutel: ${exportKey(incoming)}`);
  say(`Uitkomst: ${verdict.action}. ${verdict.reden}`);

  if (verdict.action === 'dubbel') return stop('Niets geschreven.');
  if (process.argv.includes('--proef')) return say('Proef: niets geschreven.');
  const replaced = loaded.exports.find((e) => exportKey(e) === exportKey(incoming)) ?? null;
  say(`Geschreven: ${writeTrendExport(incoming, verdict.action === 'vervangen' ? replaced : null)}`);
  // The season agenda is generated from the exports: keep it in step, or its test fails.
  const agenda = agendaMarkdown(readTrendExports().exports);
  if (agenda) {
    writeFileSync('docs/marketing/seizoensagenda.md', agenda);
    say('Seizoensagenda bijgewerkt: docs/marketing/seizoensagenda.md');
  } else {
    say('Seizoensagenda niet bijgewerkt: er is nog geen bruikbare referentie-export.');
  }
}

main();
