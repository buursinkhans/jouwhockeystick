import { bowDepthAt, type BowFigureOption } from '@/content/bowProfiles';
import type { BowProfile } from '@/catalog/types';

/**
 * Drawing geometry of the bow figures (SVG user units), shared by the
 * interactive figure in the articles and the small figure on stick pages
 * (UX phase 3, 2026-11-08). The stick lies horizontally: grip on the left,
 * hook on the right. The bow is drawn exaggerated so it is visible.
 */
export const GRIP_X = 40;
export const HOOK_X = 520;
export const BASE_Y = 96;
export const DEPTH = 46;
const SAMPLES = 60;

export function bowPath(peak: number): string {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES; // 0 = hook end, 1 = grip end
    const x = HOOK_X - t * (HOOK_X - GRIP_X);
    const y = BASE_Y - bowDepthAt(t, peak) * DEPTH;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(' ');
}

export const HOOK_PATH = `M${HOOK_X} ${BASE_Y} C ${HOOK_X + 46} ${BASE_Y} ${HOOK_X + 62} ${BASE_Y + 34} ${HOOK_X + 36} ${BASE_Y + 46} C ${HOOK_X + 20} ${BASE_Y + 53} ${HOOK_X + 6} ${BASE_Y + 44} ${HOOK_X + 12} ${BASE_Y + 32}`;

export function peakX(option: BowFigureOption): number {
  return HOOK_X - option.peak * (HOOK_X - GRIP_X);
}

/** The figure groups pro bow and dynabow as one profile ("Pro bow / dynabow"). */
export function figureIdFor(bow: BowProfile): BowFigureOption['id'] {
  return bow === 'dynabow' ? 'probow' : bow;
}
