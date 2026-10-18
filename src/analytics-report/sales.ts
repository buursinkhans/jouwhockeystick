/**
 * Weekly sales report (counts only): clicks and orders per place on the site
 * and per stick, from the bol.com Affiliate Reporting API and the TradeTracker
 * reference report. The repository is public, so this report never contains
 * revenue or commission (owner's choice, 2026-10-18). Pure functions; the
 * network calls live in scripts/sales-report.ts.
 */
import type { RetailerPlacement } from '@/lib/retailers';

export type Period = { from: string; to: string };

/** One bol.com promotion-report row, reduced to counts. */
export type BolRow = {
  subId: string | null;
  name: string | null;
  clicks: number;
  orders: number;
};

/** One TradeTracker reference-report row: the reference is our placement. */
export type PassaRow = { reference: string; clicks: number; sales: number };

export type Source<T> = { rows: T[] } | { error: string };

export type SalesData = {
  current: Period;
  previous: Period;
  bol: { current: Source<BolRow>; previous: Source<BolRow> };
  passa: { current: Source<PassaRow>; previous: Source<PassaRow> };
};

const PLACEMENT_LABELS: Record<RetailerPlacement, string> = {
  stickwijzer: 'Stickwijzer',
  productpagina: 'Stickpagina',
  catalogus: 'Catalogus',
  vergelijk: 'Vergelijken',
  zaalkeuze: 'Zaalkeuze',
};
const OTHER = 'Overig (andere of oude link)';

function placementLabel(value: string | null): string {
  return value !== null && value in PLACEMENT_LABELS
    ? PLACEMENT_LABELS[value as RetailerPlacement]
    : OTHER;
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Reduces the bol.com promotion report to counts; amounts are dropped here. */
export function bolRows(body: unknown): BolRow[] {
  const items =
    body && typeof body === 'object' && 'items' in body
      ? (body as { items: unknown }).items
      : [];
  if (!Array.isArray(items)) return [];
  return items.map((item: Record<string, unknown>) => ({
    subId: typeof item.subId === 'string' && item.subId ? item.subId : null,
    name: typeof item.name === 'string' && item.name ? item.name : null,
    clicks: toNumber(item.clicks),
    orders: toNumber(item.orders),
  }));
}

function tag(block: string, name: string): string | null {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([^<]*)</${name}>`),
  );
  return match ? match[1]!.trim() : null;
}

/** Parses the SOAP response of TradeTracker's getReportReference. */
export function passaRows(xml: string): PassaRow[] {
  return xml
    .split(/<item\b[^>]*ReportReferenceElement[^>]*>/)
    .slice(1)
    .map((block) => ({
      reference: tag(block, 'reference') ?? '',
      clicks: toNumber(tag(block, 'overallClickCount')),
      sales: toNumber(tag(block, 'saleCount')),
    }));
}

type Totals = { clicks: number; orders: number };

function byPlacement<T>(
  rows: T[],
  key: (row: T) => string | null,
  count: (row: T) => Totals,
): Map<string, Totals> {
  const map = new Map<string, Totals>();
  for (const row of rows) {
    const label = placementLabel(key(row));
    const sum = map.get(label) ?? { clicks: 0, orders: 0 };
    const { clicks, orders } = count(row);
    map.set(label, {
      clicks: sum.clicks + clicks,
      orders: sum.orders + orders,
    });
  }
  return map;
}

function total(map: Map<string, Totals>): Totals {
  let clicks = 0;
  let orders = 0;
  for (const value of map.values()) {
    clicks += value.clicks;
    orders += value.orders;
  }
  return { clicks, orders };
}

function change(now: number, before: number): string {
  if (before === 0) return now === 0 ? '' : ' (nieuw)';
  const pct = Math.round(((now - before) / before) * 100);
  return ` (${pct >= 0 ? '+' : ''}${pct}%)`;
}

const bolCount = (r: BolRow): Totals => ({
  clicks: r.clicks,
  orders: r.orders,
});
const passaCount = (r: PassaRow): Totals => ({
  clicks: r.clicks,
  orders: r.sales,
});

export function formatSalesReport(data: SalesData): string {
  const lines: string[] = [
    '# Verkooprapport',
    '',
    `Week **${data.current.from} t/m ${data.current.to}**, vergeleken met ${data.previous.from} t/m ${data.previous.to}.`,
    '',
    '_Alleen aantallen: de repository is openbaar. Omzet en commissie zie je in het bol.com Partnerprogramma en in TradeTracker._',
    '',
  ];

  const shops: {
    name: string;
    now: Map<string, Totals> | string;
    before: Map<string, Totals> | null;
    unit: string;
  }[] = [
    {
      name: 'bol.com',
      now:
        'error' in data.bol.current
          ? data.bol.current.error
          : byPlacement(data.bol.current.rows, (r) => r.subId, bolCount),
      before:
        'error' in data.bol.previous
          ? null
          : byPlacement(data.bol.previous.rows, (r) => r.subId, bolCount),
      unit: 'bestellingen',
    },
    {
      name: 'PassaHockey',
      now:
        'error' in data.passa.current
          ? data.passa.current.error
          : byPlacement(
              data.passa.current.rows,
              (r) => r.reference,
              passaCount,
            ),
      before:
        'error' in data.passa.previous
          ? null
          : byPlacement(
              data.passa.previous.rows,
              (r) => r.reference,
              passaCount,
            ),
      unit: 'verkopen',
    },
  ];

  lines.push('## Samenvatting', '');
  for (const shop of shops) {
    if (typeof shop.now === 'string') {
      lines.push(
        `- **${shop.name}:** kon niet worden opgehaald (${shop.now}).`,
      );
      continue;
    }
    const now = total(shop.now);
    const before = shop.before ? total(shop.before) : null;
    lines.push(
      `- **${shop.name}:** ${now.clicks} kliks${before ? change(now.clicks, before.clicks) : ''}, ${now.orders} ${shop.unit}${before ? change(now.orders, before.orders) : ''}.`,
    );
  }

  lines.push('', '## Per plek op de site', '');
  lines.push(
    '| Plek | bol.com kliks | bol.com bestellingen | PassaHockey kliks | PassaHockey verkopen |',
    '|---|---|---|---|---|',
  );
  const [bol, passa] = shops.map((s) =>
    typeof s.now === 'string' ? null : s.now,
  );
  const labels = [...Object.values(PLACEMENT_LABELS), OTHER];
  for (const label of labels) {
    const b = bol?.get(label);
    const p = passa?.get(label);
    if (!b && !p && label === OTHER) continue;
    const cell = (v: number | undefined, available: boolean) =>
      available ? String(v ?? 0) : '–';
    lines.push(
      `| ${label} | ${cell(b?.clicks, bol !== null)} | ${cell(b?.orders, bol !== null)} | ${cell(p?.clicks, passa !== null)} | ${cell(p?.orders, passa !== null)} |`,
    );
  }

  if (!('error' in data.bol.current)) {
    const perStick = new Map<string, Totals>();
    for (const row of data.bol.current.rows) {
      const name = row.name ?? '(zonder naam)';
      const sum = perStick.get(name) ?? { clicks: 0, orders: 0 };
      perStick.set(name, {
        clicks: sum.clicks + row.clicks,
        orders: sum.orders + row.orders,
      });
    }
    const top = [...perStick.entries()]
      .filter(([, t]) => t.clicks > 0 || t.orders > 0)
      .sort((a, b) => b[1].orders - a[1].orders || b[1].clicks - a[1].clicks)
      .slice(0, 10);
    lines.push('', '## Meest aangeklikte sticks bij bol.com', '');
    if (top.length === 0) {
      lines.push('Deze week geen kliks.');
    } else {
      lines.push('| Stick | Kliks | Bestellingen |', '|---|---|---|');
      for (const [name, t] of top) {
        lines.push(
          `| ${name.replace(/\|/g, '/')} | ${t.clicks} | ${t.orders} |`,
        );
      }
    }
    lines.push(
      '',
      '_PassaHockey-links dragen alleen de plek mee, niet de stick; per stick zie je dat in TradeTracker._',
    );
  }

  return lines.join('\n') + '\n';
}
