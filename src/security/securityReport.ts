/**
 * Weekly security check (scripts/security-check.ts, workflow "Beveiliging"):
 * pure checks and the report. The script gathers the data (live headers,
 * certificate, npm audit, npm outdated, a scan for keys in the code); these
 * functions judge it, so they can be tested without the network.
 */

export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export type LiveCheck =
  | {
      ok: true;
      headers: Record<string, string>;
      httpRedirectsToHttps: boolean;
      wwwRedirects: boolean;
      certificateDaysLeft: number | null;
    }
  | { ok: false; error: string };

export type Vulnerability = {
  name: string;
  severity: Severity;
  /** True when the package ends up on the live site (not dev tooling only). */
  production: boolean;
  /** "safe" = `npm audit fix` solves it without a major update. */
  fix: 'safe' | 'major' | 'none';
  title: string;
};

export type UpdateKind = 'patch' | 'minor' | 'major';

export type Outdated = {
  name: string;
  current: string;
  latest: string;
  kind: UpdateKind;
  production: boolean;
};

export type SecretHit = { file: string; kind: string };

export type SecurityData = {
  date: string;
  site: string;
  live: LiveCheck;
  vulnerabilities: Vulnerability[];
  outdated: Outdated[];
  secrets: SecretHit[];
};

/** Headers the site must send (see next.config.ts and Netlify). */
const REQUIRED_HEADERS: {
  header: string;
  label: string;
  test: (v: string) => boolean;
}[] = [
  {
    header: 'strict-transport-security',
    label: 'HSTS (alleen https)',
    test: (v) => /max-age=\d{7,}/.test(v),
  },
  {
    header: 'x-content-type-options',
    label: 'X-Content-Type-Options',
    test: (v) => v.toLowerCase() === 'nosniff',
  },
  {
    header: 'content-security-policy',
    label: 'Niet in een frame van een andere site',
    test: (v) => /frame-ancestors\s+('self'|'none')/.test(v),
  },
  {
    header: 'x-frame-options',
    label: 'X-Frame-Options',
    test: (v) => /^(SAMEORIGIN|DENY)$/i.test(v),
  },
  {
    header: 'referrer-policy',
    label: 'Referrer-Policy',
    test: (v) => v.length > 0,
  },
  {
    header: 'permissions-policy',
    label: 'Permissions-Policy',
    test: (v) => /camera=\(\)/.test(v),
  },
];

export type Check = { label: string; ok: boolean; detail?: string };

export function checkLive(live: LiveCheck): Check[] {
  if (!live.ok)
    return [{ label: 'Live site bereikbaar', ok: false, detail: live.error }];
  const headers = Object.fromEntries(
    Object.entries(live.headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  const checks: Check[] = REQUIRED_HEADERS.map(({ header, label, test }) => {
    const value = headers[header];
    return {
      label,
      ok: value !== undefined && test(value),
      ...(value === undefined && { detail: 'ontbreekt' }),
    };
  });
  checks.push({
    label: 'Geen X-Powered-By (verraadt de techniek niet)',
    ok: headers['x-powered-by'] === undefined,
  });
  checks.push({
    label: 'http stuurt door naar https',
    ok: live.httpRedirectsToHttps,
  });
  checks.push({ label: 'www stuurt door', ok: live.wwwRedirects });
  checks.push(
    live.certificateDaysLeft === null
      ? {
          label: 'Certificaat',
          ok: false,
          detail: 'geldigheid niet uit te lezen',
        }
      : {
          label: 'Certificaat nog minstens 14 dagen geldig',
          ok: live.certificateDaysLeft >= 14,
          detail: `nog ${live.certificateDaysLeft} dagen (Netlify vernieuwt het zelf)`,
        },
  );
  return checks;
}

/** semver-ish comparison of two plain versions like 16.3.6 and 16.4.2. */
export function updateKind(current: string, latest: string): UpdateKind | null {
  const parse = (v: string) =>
    v
      .replace(/^[^\d]*/, '')
      .split(/[.-]/)
      .slice(0, 3)
      .map(Number);
  const [a1 = 0, a2 = 0, a3 = 0] = parse(current);
  const [b1 = 0, b2 = 0, b3 = 0] = parse(latest);
  if (b1 > a1) return 'major';
  if (b1 === a1 && b2 > a2) return 'minor';
  if (b1 === a1 && b2 === a2 && b3 > a3) return 'patch';
  return null;
}

const SEVERITY_RANK: Record<Severity, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

/** Production vulnerabilities that `npm audit fix` can solve without a major update. */
export function safeFixes(
  vulnerabilities: readonly Vulnerability[],
): Vulnerability[] {
  return vulnerabilities.filter((v) => v.production && v.fix === 'safe');
}

export function formatSecurityReport(data: SecurityData): string {
  const live = checkLive(data.live);
  const failing = live.filter((c) => !c.ok);
  const prod = data.vulnerabilities
    .filter((v) => v.production)
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  const dev = data.vulnerabilities.filter((v) => !v.production);
  const updates = (kind: UpdateKind) =>
    data.outdated.filter((o) => o.kind === kind);

  const actions: string[] = [];
  if (data.secrets.length)
    actions.push(
      `**Mogelijke sleutel in de code (${data.secrets.length})**: controleer direct en vervang de sleutel als hij echt is.`,
    );
  if (prod.some((v) => v.severity === 'critical' || v.severity === 'high'))
    actions.push(
      `**Ernstige kwetsbaarheid in wat er live draait**: ${prod
        .filter((v) => SEVERITY_RANK[v.severity] >= 2)
        .map((v) => v.name)
        .join(', ')}.`,
    );
  if (failing.length)
    actions.push(`**Live site**: ${failing.map((c) => c.label).join('; ')}.`);
  if (safeFixes(data.vulnerabilities).length)
    actions.push(
      'Er staat (of komt) een pull request klaar met de veilige oplossing; mergen is genoeg.',
    );

  const lines = [
    `# Beveiligingscontrole ${data.date}`,
    '',
    `Wekelijkse controle van ${data.site} en de software eronder. Alleen lezen; een veilige oplossing komt als pull request, nooit direct live.`,
    '',
    '## Samenvatting',
    '',
    actions.length
      ? actions.map((a) => `- ${a}`).join('\n')
      : '- Niets dat nu actie vraagt.',
    '',
    '## Live site',
    '',
    ...live.map(
      (c) =>
        `- ${c.ok ? '✅' : '❌'} ${c.label}${c.detail ? ` — ${c.detail}` : ''}`,
    ),
    '',
    '## Kwetsbaarheden in pakketten',
    '',
    prod.length
      ? prod
          .map(
            (v) =>
              `- **${v.name}** (${v.severity}): ${v.title}. Oplossing: ${v.fix === 'safe' ? 'veilige update' : v.fix === 'major' ? 'alleen met een grote versie-update, met de hand' : 'nog geen'}.`,
          )
          .join('\n')
      : '- Live: geen bekende kwetsbaarheden.',
    dev.length
      ? `- Alleen in ontwikkeltools (komt niet op de site): ${dev.map((v) => v.name).join(', ')}.`
      : '',
    '',
    '## Nieuwere versies',
    '',
    data.outdated.length
      ? [
          `- Kleine updates (patch): ${
            updates('patch')
              .map((o) => `${o.name} ${o.current} → ${o.latest}`)
              .join(', ') || 'geen'
          }.`,
          `- Nieuwe functies (minor): ${
            updates('minor')
              .map((o) => `${o.name} ${o.current} → ${o.latest}`)
              .join(', ') || 'geen'
          }.`,
          `- Grote versies (major, met de hand en met tests): ${
            updates('major')
              .map((o) => `${o.name} ${o.current} → ${o.latest}`)
              .join(', ') || 'geen'
          }.`,
        ].join('\n')
      : '- Alles is bij.',
    '',
    '## Sleutels in de code',
    '',
    data.secrets.length
      ? data.secrets
          .map(
            (s) =>
              `- ${s.kind} in \`${s.file}\` (de waarde staat bewust niet in dit openbare rapport)`,
          )
          .join('\n')
      : '- Geen sleutels gevonden.',
    '',
    '_Gemaakt door de wekelijkse Beveiligingscontrole. Accounts (tweestapsverificatie op e-mail, GitHub, Netlify, PostHog) controleert dit rapport niet; dat blijft werk voor de eigenaar._',
  ];
  return (
    lines
      .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
      .join('\n') + '\n'
  );
}
