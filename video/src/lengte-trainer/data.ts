// Numbers for the AI-trainer Short. Every size comes from LENGTH_GUIDE (the
// table behind the stickwijzer and /kennis/hockeystick-lengte-tabel), merged
// into a few rows so the table stays readable on a phone.
import { LENGTH_GUIDE } from '../../../src/advice-engine/sizeAdvice';
import { formatInch } from '../lengte/data';

/** Each group starts at one of these heights (cm) and runs to the next. */
const GROUP_STARTS_CM = [95, 108, 123, 138, 155, 163, 185] as const;

export type CompactRow = { height: string; size: string };

function sizeRange(sizes: number[]): string {
  const low = Math.min(...sizes);
  const high = Math.max(...sizes);
  if (low === high) return `${formatInch(low)} inch`;
  // Two neighbouring sizes read as a choice, a wider span as a range.
  const distinct = [...new Set(sizes)].sort((x, y) => x - y);
  return distinct.length === 2
    ? `${formatInch(low)} of ${formatInch(high)} inch`
    : `${formatInch(low)} tot ${formatInch(high)} inch`;
}

export const COMPACT_ROWS: CompactRow[] = GROUP_STARTS_CM.map((start, index) => {
  const next = GROUP_STARTS_CM[index + 1];
  const bands = LENGTH_GUIDE.filter(
    (band) => band.minCm >= start && (next === undefined || band.minCm < next),
  );
  const first = bands[0];
  const last = bands.at(-1);
  if (!first || !last) {
    throw new Error(`No LENGTH_GUIDE band starts in the group from ${start} cm`);
  }
  return {
    height: next === undefined ? `vanaf ${first.minCm} cm` : `${first.minCm}–${last.maxCm} cm`,
    size: sizeRange(bands.flatMap((band) => [...band.sizes])),
  };
});

/** The trainer clip from Synthesia (assets/video/trainer/). */
export const TRAINER_CLIP = 'video/trainer/lengte-trainer.mp4';

/**
 * False until the clip is in assets/video/trainer/: the video then shows a
 * placeholder where the trainer stands, so the rest can be reviewed already.
 */
export const TRAINER_CLIP_READY = false;

/**
 * Where the two takes sit in the clip, in seconds. Estimates until the clip
 * is added; then measure them from the file (the pause between the takes).
 */
export const TAKES = {
  intro: { from: 0, to: 7 },
  outro: { from: 7, to: 12.5 },
} as const;

/** Spoken words per take, shown as captions (docs/video.md §3: all text on screen). */
export const CAPTIONS = {
  intro: [
    'Welke lengte hockeystick past bij jou of je kind?',
    'Ik ben Daan, AI-trainer van jouwhockeystick.nl.',
  ],
  outro: ['Twijfel je nog?', 'Doe de gratis stickwijzer op jouwhockeystick.nl.', 'Veel hockeyplezier!'],
} as const;

/** Child's height used in the "too long / too short" scene. */
export const COMPARE_HEIGHT_CM = 140;
