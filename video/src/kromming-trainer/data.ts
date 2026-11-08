// Facts for the trainer Short "Low bow of mid bow?". The bow positions and the
// maximum depth come from src/content/bowProfiles.ts, the same source as the
// figure on /kennis/low-bow-vs-mid-bow, so the video follows the site.
import { BOW_FIGURE_OPTIONS, MAX_BOW_DEPTH_MM } from '../../../src/content/bowProfiles';
import type { Take } from '../trainer/Trainer';

function peakOf(id: (typeof BOW_FIGURE_OPTIONS)[number]['id']): number {
  const option = BOW_FIGURE_OPTIONS.find((item) => item.id === id);
  if (!option) throw new Error(`Bow profile ${id} is missing in BOW_FIGURE_OPTIONS`);
  return option.peak;
}

/** Deepest point as a fraction of the length (0 = hook end). */
export const MID_BOW_PEAK = peakOf('midbow');
export const LOW_BOW_PEAK = peakOf('lowbow');
export { MAX_BOW_DEPTH_MM };

/** Daan's clip from Synthesia (assets/video/trainer/), both takes in one file. */
export const TRAINER_CLIP = 'video/trainer/kromming-trainer.mp4';

/**
 * False until the clip is in assets/video/trainer/. Without it the video opens
 * with a text hook and ends on the end card, without the AI label.
 */
export const TRAINER_CLIP_READY = false;

/**
 * Where the two takes sit in the clip, in seconds. Estimates until the clip
 * is added; then measure them from the file (the pause between the takes).
 */
export const TAKES: { intro: Take; outro: Take } = {
  intro: { from: 0, to: 7 },
  outro: { from: 7, to: 13 },
};

/**
 * Spoken words per take, shown as captions (docs/video.md §3: all text on
 * screen). Must match the script in video/teksten/kromming-trainer.md.
 */
export const CAPTIONS = {
  intro: [
    'Low bow of mid bow?',
    'Ik ben Daan, AI-trainer van jouwhockeystick.nl.',
    'Ik laat je zien waar het verschil zit.',
  ],
  outro: [
    'Twijfel je nog?',
    'De stickwijzer kijkt naar wat jij op het veld doet.',
    'Je vindt hem op jouwhockeystick.nl.',
  ],
} as const;
