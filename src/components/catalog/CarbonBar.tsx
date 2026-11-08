/**
 * The carbon percentage on a 0–100% scale (UX phase 3, 2026-11-08). Neutral
 * on purpose: one grey track and a dark marker, no colour that says "more is
 * better" (decision log 2026-11-08: carbon is not a stiffness measurement).
 */
export function CarbonBar({ percentage }: { percentage: number }) {
  const value = Math.min(100, Math.max(0, percentage));
  return (
    <div className="mt-2 max-w-xs" aria-hidden="true">
      <div className="relative h-1.5 rounded-full bg-rand">
        <span className="absolute inset-y-0 left-0 rounded-full bg-inkt/45" style={{ width: `${value}%` }} />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-inkt shadow-sm"
          style={{ left: `${value}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-lijngrijs">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
