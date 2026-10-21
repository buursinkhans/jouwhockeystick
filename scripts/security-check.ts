// Weekly security check (workflow "Beveiliging"). Read-only: checks the live
// site (headers, redirects, certificate), runs npm audit and npm outdated, and
// scans the code for keys. Prints a Markdown report; never prints a key value.
// Writes `fixable=<n>` to GITHUB_OUTPUT: production vulnerabilities that
// `npm audit fix` solves without a major update, and `updates=<n>`: patch and
// minor updates, so the workflow can open a PR.
// Run with: npm run security:check [-- report.md]
import { execSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { connect } from 'node:tls';
import {
  formatSecurityReport,
  safeFixes,
  updateKind,
  type LiveCheck,
  type Outdated,
  type SecretHit,
  type Severity,
  type Vulnerability,
} from '../src/security/securityReport';

const HOST = 'jouwhockeystick.nl';
const SITE = `https://${HOST}`;
const DAY = 86_400_000;

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'onbekende fout';
}

/** npm audit and npm outdated exit with 1 when they find something; keep stdout. */
function run(command: string): string {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (error) {
    const stdout = (error as { stdout?: unknown }).stdout;
    if (typeof stdout === 'string') return stdout;
    throw error;
  }
}

// --- live site ------------------------------------------------------------

async function redirectTarget(url: string): Promise<string | null> {
  const response = await fetch(url, { redirect: 'manual' });
  return response.status >= 300 && response.status < 400
    ? response.headers.get('location')
    : null;
}

function certificateDaysLeft(): Promise<number | null> {
  return new Promise((resolve) => {
    const socket = connect({ host: HOST, port: 443, servername: HOST }, () => {
      const validTo = socket.getPeerCertificate().valid_to;
      socket.end();
      const end = validTo ? Date.parse(validTo) : NaN;
      resolve(Number.isNaN(end) ? null : Math.floor((end - Date.now()) / DAY));
    });
    socket.setTimeout(15_000, () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => resolve(null));
  });
}

async function liveCheck(): Promise<LiveCheck> {
  try {
    const response = await fetch(`${SITE}/`);
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const [http, www, days] = await Promise.all([
      redirectTarget(`http://${HOST}/`).catch(() => null),
      redirectTarget(`https://www.${HOST}/`).catch(() => null),
      certificateDaysLeft(),
    ]);
    return {
      ok: true,
      headers,
      httpRedirectsToHttps: http?.startsWith('https://') ?? false,
      wwwRedirects: www?.startsWith(SITE) ?? false,
      certificateDaysLeft: days,
    };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

// --- npm audit --------------------------------------------------------------

type AuditEntry = {
  severity: Severity;
  via: (string | { title?: string })[];
  fixAvailable: boolean | { isSemVerMajor?: boolean };
};

function audit(omitDev: boolean): Record<string, AuditEntry> {
  const json = run(`npm audit --json${omitDev ? ' --omit=dev' : ''}`);
  const parsed = JSON.parse(json) as {
    vulnerabilities?: Record<string, AuditEntry>;
  };
  return parsed.vulnerabilities ?? {};
}

function vulnerabilities(): Vulnerability[] {
  const production = new Set(Object.keys(audit(true)));
  return Object.entries(audit(false)).map(([name, entry]) => {
    const titles = entry.via.flatMap((v) =>
      typeof v === 'string' ? [] : v.title ? [v.title] : [],
    );
    const through = entry.via.filter((v) => typeof v === 'string');
    return {
      name,
      severity: entry.severity,
      production: production.has(name),
      fix:
        entry.fixAvailable === false
          ? 'none'
          : typeof entry.fixAvailable === 'object' &&
              entry.fixAvailable.isSemVerMajor
            ? 'major'
            : 'safe',
      title: titles[0] ?? `via ${through.join(', ') || 'een ander pakket'}`,
    };
  });
}

// --- npm outdated -----------------------------------------------------------

function outdated(): Outdated[] {
  const parsed = JSON.parse(run('npm outdated --json') || '{}') as Record<
    string,
    { current?: string; latest?: string; type?: string }
  >;
  return Object.entries(parsed).flatMap(([name, o]) => {
    if (!o.current || !o.latest) return [];
    const kind = updateKind(o.current, o.latest);
    return kind
      ? [
          {
            name,
            current: o.current,
            latest: o.latest,
            kind,
            production: o.type === 'dependencies',
          },
        ]
      : [];
  });
}

// --- keys in the code -------------------------------------------------------

/** Formats of real secret keys. Public keys (PostHog phc_) are not listed. */
const KEY_PATTERNS: { kind: string; pattern: string }[] = [
  { kind: 'GitHub-token', pattern: 'gh[pousr]_[A-Za-z0-9]{36}' },
  { kind: 'GitHub-token', pattern: 'github_pat_[A-Za-z0-9_]{40,}' },
  { kind: 'Claude-sleutel', pattern: 'sk-ant-[A-Za-z0-9_-]{20,}' },
  { kind: 'Netlify-token', pattern: 'nfp_[A-Za-z0-9]{30,}' },
  { kind: 'PostHog-persoonlijke sleutel', pattern: 'phx_[A-Za-z0-9]{30,}' },
  { kind: 'Meta/Instagram-token', pattern: '(EAA|IGAA)[A-Za-z0-9_-]{60,}' },
  { kind: 'Google-sleutel', pattern: 'AIza[0-9A-Za-z_-]{35}' },
  { kind: 'AWS-sleutel', pattern: 'AKIA[0-9A-Z]{16}' },
  { kind: 'Privésleutel', pattern: '-----BEGIN [A-Z ]*PRIVATE KEY-----' },
];

function secrets(): SecretHit[] {
  return KEY_PATTERNS.flatMap(({ kind, pattern }) =>
    // -l: file names only, so the key value never reaches the log.
    run(`git grep -lIE "${pattern}" -- . ":!package-lock.json"`)
      .split('\n')
      .filter(Boolean)
      .map((file) => ({ file, kind })),
  );
}

// --- main -------------------------------------------------------------------

const live = await liveCheck();
const vulns = vulnerabilities();
const updates = outdated();
const report = formatSecurityReport({
  date: new Date().toISOString().slice(0, 10),
  site: SITE,
  live,
  vulnerabilities: vulns,
  outdated: updates,
  secrets: secrets(),
});

const out = process.argv[2];
if (out) writeFileSync(out, report);
else process.stdout.write(report);

const fixable = safeFixes(vulns).length;
const small = updates.filter((o) => o.kind !== 'major').length;
if (process.env.GITHUB_OUTPUT)
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `fixable=${fixable}\nupdates=${small}\n`,
  );
