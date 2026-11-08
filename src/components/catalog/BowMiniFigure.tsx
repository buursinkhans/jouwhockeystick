import { BOW_FIGURE_OPTIONS } from '@/content/bowProfiles';
import type { BowProfile } from '@/catalog/types';
import { BASE_Y, DEPTH, GRIP_X, HOOK_PATH, HOOK_X, bowPath, figureIdFor, peakX } from '@/components/article/bowGeometry';

/**
 * Where the bend of this stick lies, next to the other profiles in grey (UX
 * phase 3, 2026-11-08). Server-rendered, no interaction: the full,
 * interactive figure is in the article on bow profiles. Schematic, the same
 * editorial drawing as that figure; not a measurement of this model.
 */
export function BowMiniFigure({ bow, label }: { bow: BowProfile; label: string }) {
  const id = figureIdFor(bow);
  const selected = BOW_FIGURE_OPTIONS.find((o) => o.id === id);
  if (!selected) return null;
  const x = peakX(selected);
  return (
    <svg viewBox="0 30 600 120" className="mt-2 h-auto w-full max-w-sm" role="img" aria-label={`Schematisch: waar de kromming zit bij ${label}, vergeleken met de andere profielen`}>
      {BOW_FIGURE_OPTIONS.filter((o) => o.id !== id).map((o) => (
        <path key={o.id} d={bowPath(o.peak)} fill="none" stroke="var(--color-rand)" strokeWidth={3} strokeLinecap="round" />
      ))}
      <line x1={GRIP_X} y1={BASE_Y} x2={HOOK_X} y2={BASE_Y} stroke="var(--color-lijngrijs)" strokeWidth={1} strokeDasharray="4 4" />
      <path d={bowPath(selected.peak)} fill="none" stroke="var(--color-veld)" strokeWidth={7} strokeLinecap="round" />
      <path d={HOOK_PATH} fill="none" stroke="var(--color-veld)" strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={BASE_Y - DEPTH} r={6} fill="var(--color-bal)" />
      <text x={GRIP_X} y={BASE_Y + 30} fontSize={14} fill="var(--color-lijngrijs)">
        ← greep
      </text>
      <text x={HOOK_X - 10} y={BASE_Y + 44} fontSize={14} textAnchor="end" fill="var(--color-lijngrijs)">
        krul →
      </text>
    </svg>
  );
}
