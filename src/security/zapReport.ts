/**
 * The passive OWASP ZAP baseline scan of the live site (security.yml, security
 * review 2026-11-13). ZAP only looks: it requests pages and reads the
 * responses, it does not attack. Accepted alerts are switched off in
 * .zap/rules.tsv. This file turns ZAP's JSON report into a short block for the
 * weekly security report. Pure functions.
 */

export type ZapRisk = 0 | 1 | 2 | 3;

export type ZapAlert = { id: string; name: string; risk: ZapRisk; count: number };

export type ZapSummary = { ok: true; alerts: ZapAlert[] } | { ok: false; reden: string };

export const ZAP_RISK_LABEL: Record<ZapRisk, string> = {
  3: 'Hoog',
  2: 'Middel',
  1: 'Laag',
  0: 'Informatief',
};

const toRisk = (value: unknown): ZapRisk | null => {
  const n = Number(value);
  return n === 0 || n === 1 || n === 2 || n === 3 ? n : null;
};

/** Reads report_json.json from zap-baseline.py; anything unexpected gives { ok: false }. */
export function parseZapReport(json: unknown): ZapSummary {
  if (!json || typeof json !== 'object' || !Array.isArray((json as { site?: unknown }).site)) {
    return { ok: false, reden: 'geen leesbaar ZAP-rapport' };
  }
  const byId = new Map<string, ZapAlert>();
  for (const site of (json as { site: unknown[] }).site) {
    const alerts = site && typeof site === 'object' ? (site as { alerts?: unknown }).alerts : undefined;
    if (!Array.isArray(alerts)) continue;
    for (const raw of alerts) {
      if (!raw || typeof raw !== 'object') continue;
      const a = raw as Record<string, unknown>;
      const risk = toRisk(a.riskcode);
      const id = String(a.pluginid ?? a.alertRef ?? '');
      if (risk === null || !id) continue;
      const count = Number(a.count ?? (Array.isArray(a.instances) ? a.instances.length : 1)) || 1;
      const name = String(a.name ?? a.alert ?? `regel ${id}`);
      const seen = byId.get(id);
      if (seen) seen.count += count;
      else byId.set(id, { id, name, risk, count });
    }
  }
  return {
    ok: true,
    alerts: [...byId.values()].sort((a, b) => b.risk - a.risk || a.name.localeCompare(b.name)),
  };
}

/** The block under "Samenvatting" in the security report. */
export function formatZapBlock(zap: ZapSummary): string[] {
  const lines = ['### Passieve scan (ZAP)', ''];
  if (!zap.ok) {
    lines.push(`- Scan niet gelukt: ${zap.reden}. De rest van dit rapport staat er wel.`);
  } else {
    const count = (risk: ZapRisk) => zap.alerts.filter((a) => a.risk === risk).length;
    lines.push(
      `- Meldingen: hoog ${count(3)}, middel ${count(2)}, laag ${count(1)}, informatief ${count(0)}.`,
      ...zap.alerts
        .filter((a) => a.risk > 0)
        .map((a) => `- ${ZAP_RISK_LABEL[a.risk]}: ${a.name} (regel ${a.id}, ${a.count}×)`),
    );
  }
  lines.push(
    '- Alleen bekijken, niet aanvallen; de scan laat de controle nooit falen. Geaccepteerde meldingen staan in `.zap/rules.tsv`, het volledige rapport bij de run (artefact `zap_scan`).',
  );
  return lines;
}
