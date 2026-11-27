/**
 * Calendar months from `first` (YYYY-MM) up to the month of yesterday, as periods
 * for the partner reports (KPI Performance). The running month ends yesterday.
 */
export function monthPeriods(now: Date, first: string, max = 15): Record<string, { from: string; to: string }> {
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  const yesterday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86_400_000;
  const [year = 0, month = 1] = first.split('-').map(Number);
  const out: [string, { from: string; to: string }][] = [];
  for (let i = 0; ; i++) {
    const start = Date.UTC(year, month - 1 + i, 1);
    if (start > yesterday) break;
    const end = Math.min(Date.UTC(year, month + i, 0), yesterday);
    out.push([iso(start).slice(0, 7), { from: iso(start), to: iso(end) }]);
  }
  return Object.fromEntries(out.slice(-max));
}
