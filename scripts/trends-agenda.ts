// Writes docs/marketing/seizoensagenda.md from the imported Google Trends exports (data/trends/).
// The file is generated, never edited by hand: a test fails when it differs from the data.
// Run with: npm run trends:agenda   (add --controle to only check, writing nothing)
import { readFileSync, writeFileSync } from 'node:fs';
import { agendaMarkdown } from '../src/seo/seasonAgenda';
import { readTrendExports } from '../src/seo/trendsFiles';

const FILE = 'docs/marketing/seizoensagenda.md';
const say = (text: string) => process.stdout.write(`${text}\n`);

const agenda = agendaMarkdown(readTrendExports().exports);
if (!agenda) {
  process.stderr.write('Geen bruikbare referentie-export in data/trends/: de seizoensagenda is niet gemaakt.\n');
  process.exit(1);
}
const current = (() => {
  try {
    return readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    return '';
  }
})();
if (process.argv.includes('--controle')) {
  say(current === agenda ? 'De seizoensagenda klopt met de gegevens.' : 'De seizoensagenda is verouderd: draai npm run trends:agenda.');
  process.exit(current === agenda ? 0 : 1);
}
writeFileSync(FILE, agenda);
say(`Geschreven: ${FILE}`);
