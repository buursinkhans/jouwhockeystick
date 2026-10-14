import type { BowProfile } from '@/catalog/types';

/**
 * Schematic bow profiles for the explainer figure on /kennis/low-bow-vs-mid-bow.
 *
 * This is an editorial illustration, not a measurement: the place of the
 * deepest point (`peak`) is an approximate, relative position that follows the
 * explanation in the article (mid bow ≈ halfway, low bow closer to the hook).
 * Every curve is drawn at the same depth, the FIH maximum of 25 mm; real
 * sticks differ per brand and model. Nothing here is tied to a product.
 */
export type BowFigureOption = {
  id: 'ultrabow' | 'midbow' | 'probow' | 'lowbow' | 'extreme_lowbow';
  label: string;
  /** Catalogue profiles this option stands for. */
  profiles: BowProfile[];
  /** Deepest point as a fraction of the length, 0 = hook end, 1 = grip end. */
  peak: number;
  description: string;
};

export const BOW_FIGURE_OPTIONS: BowFigureOption[] = [
  {
    id: 'ultrabow',
    label: 'Standaard',
    profiles: ['ultrabow'],
    peak: 0.55,
    description:
      'De rustigste vorm: de kromming loopt geleidelijk over de stick. Merken noemen dit ook standaard of ultrabow.',
  },
  {
    id: 'midbow',
    label: 'Mid bow',
    profiles: ['midbow'],
    peak: 0.45,
    description:
      'Het diepste punt ligt ongeveer halverwege. Dat is meestal voorspelbaar bij aannemen, vlak passen en pushen.',
  },
  {
    id: 'probow',
    label: 'Pro bow / dynabow',
    profiles: ['probow', 'dynabow'],
    peak: 0.35,
    description:
      'Tussen mid bow en low bow in. Elk merk geeft dit profiel een eigen naam, dus kijk ook naar de omschrijving van het model.',
  },
  {
    id: 'lowbow',
    label: 'Low bow',
    profiles: ['lowbow'],
    peak: 0.25,
    description:
      'Het diepste punt ligt lager, dichter bij de krul. Zo kom je makkelijker onder de bal voor lifts, 3D-acties en aerial/scoopen.',
  },
  {
    id: 'extreme_lowbow',
    label: 'Extreme low bow',
    profiles: ['extreme_lowbow'],
    peak: 0.17,
    description:
      'Nog lager dan een low bow. Iets voor specialisten, bijvoorbeeld voor de sleeppush; niet als eerste stick.',
  },
];

/** FIH Rules of Hockey: the bow may be at most 25 mm deep (field and indoor). */
export const MAX_BOW_DEPTH_MM = 25;

/**
 * Relative bow depth (0–1) at position `t` (0 = hook end, 1 = grip end) for a
 * curve whose deepest point lies at `peak`. Smooth, zero at both ends, exactly
 * 1 at the peak.
 */
export function bowDepthAt(t: number, peak: number): number {
  if (t <= 0 || t >= 1) return 0;
  const sharpness = 4;
  const a = sharpness * peak;
  const b = sharpness * (1 - peak);
  const f = (x: number) => x ** a * (1 - x) ** b;
  return f(t) / f(peak);
}
