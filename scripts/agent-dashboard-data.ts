// Collects the data for the agents dashboard (the "Agent-regiekamer") as JSON
// files: the agent registry with run stats, recent runs, agent pull requests
// and a few outcome figures. Read-only: uses the GitHub API through `gh` and
// the catalog in this repo.
// Run with: npm run dashboard:data -- <output-dir>
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCatalogProducts } from '../src/catalog/index';
import { getDiscipline } from '../src/catalog/discipline';

const REPO = 'buursinkhans/jouwhockeystick';
const DAYS = 30;

type Agent = {
  id: string;
  naam: string;
  rol: string;
  soort: 'Script' | 'AI (Claude)';
  start: string;
  workflow: string | null;
  /** Fixed status for agents without runs; derived from runs otherwise. */
  status?: string;
};

/** Every agent, built or planned (planned = the marketing blueprint). */
const AGENTS: Agent[] = [
  { id: 'catalogus', naam: 'Catalogus-controle', rol: 'Bewaking', soort: 'Script', start: 'Elke maandag', workflow: 'catalog-health.yml' },
  { id: 'kwaliteit', naam: 'Kwaliteitscontrole', rol: 'Kwaliteit', soort: 'Script', start: 'Bij elke PR', workflow: 'ci.yml' },
  { id: 'bolfeed', naam: 'bol.com feed', rol: 'Data', soort: 'Script', start: 'Handmatig (testmodus)', workflow: 'bol-feed-check.yml' },
  { id: 'searchconsole', naam: 'Search Console-rapport', rol: 'Analytics', soort: 'Script', start: 'Elke maandag', workflow: 'search-console.yml' },
  { id: 'content', naam: 'Content-agent', rol: 'Content', soort: 'AI (Claude)', start: 'Op @claude', workflow: 'claude.yml' },
  { id: 'techseo', naam: 'Technical SEO', rol: 'Bewaking', soort: 'Script', start: 'Wekelijks', workflow: null, status: 'Gepland' },
  { id: 'research', naam: 'Zoekwoord-research', rol: 'Analytics', soort: 'AI (Claude)', start: 'Wekelijks', workflow: null, status: 'Gepland' },
  { id: 'links', naam: 'Interne links & CRO', rol: 'Content', soort: 'AI (Claude)', start: 'Tweewekelijks', workflow: null, status: 'Gepland' },
  { id: 'distributie', naam: 'Distributie', rol: 'Marketing', soort: 'AI (Claude)', start: 'Na publicatie', workflow: null, status: 'Gepland' },
  { id: 'orchestrator', naam: 'Orchestrator', rol: 'Regie', soort: 'AI (Claude)', start: 'Dagelijks', workflow: null, status: 'Gepland' },
];

type Run = {
  datum: string;
  /** Full start time, for ordering runs on the same day. */
  tijd: string;
  agent: string;
  soort: string;
  uitkomst: 'Geslaagd' | 'Mislukt' | 'Bezig' | 'Overgeslagen';
  minuten: number;
  url: string;
};

function gh<T>(path: string): T {
  const out = execFileSync('gh', ['api', path], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(out) as T;
}

type GhRun = {
  status: string;
  conclusion: string | null;
  created_at: string;
  run_started_at?: string;
  updated_at: string;
  html_url: string;
};

function outcome(run: GhRun): Run['uitkomst'] {
  if (run.status !== 'completed') return 'Bezig';
  if (run.conclusion === 'success') return 'Geslaagd';
  if (run.conclusion === 'skipped' || run.conclusion === 'cancelled') return 'Overgeslagen';
  return 'Mislukt';
}

const since = new Date(Date.now() - DAYS * 86_400_000).toISOString().slice(0, 10);

function runsFor(agent: Agent): Run[] {
  if (!agent.workflow) return [];
  let body: { workflow_runs: GhRun[] };
  try {
    body = gh(`repos/${REPO}/actions/workflows/${agent.workflow}/runs?per_page=100&created=%3E%3D${since}`);
  } catch {
    return []; // workflow not on the default branch yet
  }
  return body.workflow_runs.map((run) => {
    const start = new Date(run.run_started_at ?? run.created_at).getTime();
    const end = new Date(run.updated_at).getTime();
    return {
      datum: run.created_at.slice(0, 10),
      tijd: run.created_at,
      agent: agent.naam,
      soort: agent.soort,
      uitkomst: outcome(run),
      minuten: Math.max(0, Math.round(((end - start) / 60_000) * 10) / 10),
      url: run.html_url,
    };
  });
}

const runs = AGENTS.flatMap(runsFor).sort((a, b) => a.tijd.localeCompare(b.tijd));

const agents = AGENTS.map((agent) => {
  const own = runs.filter((run) => run.agent === agent.naam);
  const last = own.at(-1);
  const done = own.filter((run) => run.uitkomst === 'Geslaagd' || run.uitkomst === 'Mislukt');
  const status =
    agent.status ??
    (own.length === 0
      ? 'Klaar, nog niet gedraaid'
      : last?.uitkomst === 'Mislukt'
        ? 'Aandacht nodig'
        : 'Actief');
  return {
    agent: agent.naam,
    rol: agent.rol,
    soort: agent.soort,
    start: agent.start,
    status,
    laatste_run: last?.datum ?? null,
    laatste_uitkomst: last?.uitkomst ?? null,
    runs_30d: own.length,
    geslaagd_30d: done.filter((run) => run.uitkomst === 'Geslaagd').length,
    minuten_30d: Math.round(own.reduce((sum, run) => sum + run.minuten, 0) * 10) / 10,
  };
});

type GhPull = {
  number: number;
  title: string;
  state: string;
  created_at: string;
  merged_at: string | null;
  html_url: string;
  head: { ref: string };
  user: { login: string };
};
const pulls = gh<GhPull[]>(`repos/${REPO}/pulls?state=all&per_page=100`)
  .filter((pr) => pr.head.ref.startsWith('agents/') || pr.head.ref.startsWith('claude/'))
  .map((pr) => ({
    pr: pr.number,
    titel: pr.title,
    door: pr.head.ref.startsWith('claude/') ? 'Content-agent' : 'Claude-sessie',
    status: pr.merged_at ? 'Live' : pr.state === 'open' ? 'Wacht op review' : 'Gesloten',
    geopend: pr.created_at.slice(0, 10),
    live_op: pr.merged_at?.slice(0, 10) ?? null,
    url: pr.html_url,
  }))
  .sort((a, b) => b.pr - a.pr);

const products = getCatalogProducts();
const catalog = [
  { groep: 'Catalogus', kpi: 'Sticks in de catalogus', waarde: products.length },
  { groep: 'Catalogus', kpi: 'Directe bol.com-link', waarde: products.filter((p) => p.bolProductUrl).length },
  { groep: 'Catalogus', kpi: 'Niet bij bol.com te koop', waarde: products.filter((p) => p.bolNotSold).length },
  { groep: 'Catalogus', kpi: 'Nog een zoeklink', waarde: products.filter((p) => !p.bolProductUrl && !p.bolNotSold).length },
  { groep: 'Catalogus', kpi: 'Zonder productfoto', waarde: products.filter((p) => !p.imageUrl).length },
  { groep: 'Catalogus', kpi: 'Zaalsticks', waarde: products.filter((p) => getDiscipline(p) === 'zaal').length },
];

/** Latest totals from the Search Console report issue, if there is one. */
function searchConsole(): { groep: string; kpi: string; waarde: number }[] {
  try {
    const issues = gh<{ body: string }[]>(`repos/${REPO}/issues?labels=search-console&state=open`);
    const body = issues[0]?.body ?? '';
    const cell = (label: string) => Number(body.match(new RegExp(`\\| ${label} \\| (\\d+) \\|`))?.[1] ?? NaN);
    return [
      { groep: 'Google', kpi: 'Vertoningen (28 dagen)', waarde: cell('Vertoningen') },
      { groep: 'Google', kpi: 'Kliks (28 dagen)', waarde: cell('Kliks') },
    ].filter((row) => Number.isFinite(row.waarde));
  } catch {
    return [];
  }
}

const outDir = process.argv[2] ?? 'dashboard-data';
mkdirSync(outDir, { recursive: true });
const write = (name: string, rows: unknown[]) =>
  writeFileSync(join(outDir, name), JSON.stringify(rows, null, 1));
write('agents.json', agents);
write('runs.json', runs);
write('prs.json', pulls);
write('resultaten.json', [...catalog, ...searchConsole()]);
console.log(`${agents.length} agents, ${runs.length} runs, ${pulls.length} PR's → ${outDir}`);
