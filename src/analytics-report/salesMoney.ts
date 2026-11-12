/**
 * Daily sales figures per partner, with amounts: clicks, orders, order value
 * and commission. The repository is public, so these amounts never go into a
 * report, an issue or a plain file: scripts/daily-sales.ts seals them
 * (src/marketing/seal.ts) before they leave the runner, and only the owner's
 * browser opens them (Marketingstudio, tab Verkoop; decision log 2026-11-12).
 * Pure functions; the calls live in partnerApi.ts.
 *
 * Declined, deleted and disapproved orders do not count; pending orders do.
 * A field a network does not send stays null ("onbekend"), never 0.
 */

export type Money = {
  /** null: the network gives no clicks (Daka) or the click report failed. */
  kliks: number | null;
  orders: number;
  /** Order value in euros, null when the network does not send it. */
  omzet: number | null;
  /** Commission in euros, null when the network does not send it. */
  commissie: number | null;
};

const num = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** Adds a value to a running total that stays null until some row has the field. */
const add = (sum: number | null, value: number | null) => (value === null ? sum : (sum ?? 0) + value);

/** The first field of `row` (in order) that holds a number, also inside {amount}. */
function pick(row: Record<string, unknown>, fields: readonly string[]): number | null {
  for (const field of fields) {
    const raw = row[field];
    const value = raw && typeof raw === 'object' ? num((raw as Record<string, unknown>).amount) : num(raw);
    if (value !== null) return value;
  }
  return null;
}

const round2 = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100);
const done = (m: Money): Money => ({ ...m, omzet: round2(m.omzet), commissie: round2(m.commissie) });

const BOL_COMMISSION = ['commission', 'totalCommission', 'commissionAmount'] as const;
const BOL_REVENUE = ['revenue', 'orderValue', 'turnover', 'salesAmount', 'orderAmount'] as const;

/** bol.com promotion report (`items`): totals over all rows. */
export function bolMoney(body: unknown): Money {
  const items = body && typeof body === 'object' && Array.isArray((body as { items?: unknown }).items)
    ? ((body as { items: unknown[] }).items.filter((i) => i && typeof i === 'object') as Record<string, unknown>[])
    : [];
  const m: Money = { kliks: 0, orders: 0, omzet: null, commissie: null };
  for (const item of items) {
    m.kliks = (m.kliks ?? 0) + (num(item.clicks) ?? 0);
    m.orders += num(item.orders) ?? 0;
    m.omzet = add(m.omzet, pick(item, BOL_REVENUE));
    m.commissie = add(m.commissie, pick(item, BOL_COMMISSION));
  }
  return done(m);
}

function tags(xml: string, name: string): string[] {
  return [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([^<]*)</${name}>`, 'g'))].map((m) => m[1]!.trim());
}
const sumTags = (block: string, names: readonly string[]): number | null => {
  for (const name of names) {
    const values = tags(block, name).map(num).filter((v): v is number => v !== null);
    if (values.length) return values.reduce((a, b) => a + b, 0);
  }
  return null;
};

/** TradeTracker getReportReference (SOAP): totals over all references of one campaign. */
export function tradeTrackerMoney(xml: string): Money {
  const blocks = xml.split(/<item\b[^>]*ReportReferenceElement[^>]*>/).slice(1);
  const m: Money = { kliks: 0, orders: 0, omzet: null, commissie: null };
  for (const block of blocks) {
    m.kliks = (m.kliks ?? 0) + (sumTags(block, ['overallClickCount']) ?? 0);
    m.orders += sumTags(block, ['saleCount']) ?? 0;
    m.omzet = add(m.omzet, sumTags(block, ['totalOrderAmount', 'orderAmount', 'saleAmount', 'totalAmount']));
    m.commissie = add(m.commissie, sumTags(block, ['totalCommission', 'saleCommission']));
  }
  return done(m);
}

/** Awin transactions (Plutosport) plus the clicks from the advertiser report. */
export function awinMoney(transactions: unknown, kliks: number | null): Money {
  const list = Array.isArray(transactions) ? (transactions.filter((t) => t && typeof t === 'object') as Record<string, unknown>[]) : [];
  const m: Money = { kliks, orders: 0, omzet: null, commissie: null };
  for (const row of list) {
    const status = String(row.commissionStatus ?? row.status ?? '').toLowerCase();
    if (status === 'declined' || status === 'deleted') continue;
    m.orders += 1;
    m.omzet = add(m.omzet, pick(row, ['saleAmount']));
    m.commissie = add(m.commissie, pick(row, ['commissionAmount']));
  }
  return done(m);
}

function transactionList(body: unknown): Record<string, unknown>[] {
  let list: unknown[] = [];
  if (Array.isArray(body)) list = body;
  else if (body && typeof body === 'object') {
    const object = body as Record<string, unknown>;
    const key = ['data', 'transactions', 'items', 'results'].find((k) => Array.isArray(object[k]));
    list = key ? (object[key] as unknown[]) : (Object.values(object).find((v): v is unknown[] => Array.isArray(v)) ?? []);
  }
  return list.filter((t) => t && typeof t === 'object') as Record<string, unknown>[];
}

/** Daisycon export (Daka): flat transactions or transactions with `parts`; no clicks. */
export function daisyconMoney(body: unknown, programId: string): Money {
  const m: Money = { kliks: null, orders: 0, omzet: null, commissie: null };
  for (const row of transactionList(body)) {
    if (row.program_id !== undefined && String(row.program_id) !== programId) continue;
    const parts = Array.isArray(row.parts)
      ? (row.parts.filter((p) => p && typeof p === 'object') as Record<string, unknown>[])
      : [row];
    const live = parts.filter((p) => String(p.status ?? '').toLowerCase() !== 'disapproved');
    if (!live.length) continue;
    m.orders += 1;
    for (const p of live) {
      m.omzet = add(m.omzet, pick(p, ['revenue', 'amount', 'order_amount']));
      m.commissie = add(m.commissie, pick(p, ['commission']));
    }
  }
  return done(m);
}

/** Orders per click, as a percentage with one decimal; null without clicks. */
export function conversion(m: Money): number | null {
  return m.kliks ? Math.round((m.orders / m.kliks) * 1000) / 10 : null;
}
