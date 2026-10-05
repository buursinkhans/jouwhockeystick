/**
 * Single source of the logo shapes, shared by the site components and by
 * scripts/build-brand-assets.mjs (Node imports this file directly), so the
 * logo can never drift between the site and the exported files.
 *
 * Changes on top of merkinstructie v1.0, at the owner's request (Oct 2026):
 * - the j-stick is tilted slightly, so it stands apart from the letters;
 * - the hook is shorter, closer to the head of a real hockey stick;
 * - two grip stripes everywhere (never three).
 */

export const BRAND_HEX = {
  veldblauw: '#1846A3',
  inkt: '#0D1B2E',
  bal: '#FF8A1F',
  krijt: '#EEF3FA',
  lijngrijs: '#5B6B7F',
  nlNegatief: '#C9D6F0',
  wit: '#FFFFFF',
} as const;

export const STICK_TILT_DEG = 8;

/** The j-stick inside the wordmark, viewBox 0 0 44 100. */
export function wordmarkStickMarkup({
  stick,
  grip,
  ball = BRAND_HEX.bal,
}: {
  stick: string;
  grip: string;
  ball?: string;
}): string {
  return `<g transform="rotate(${STICK_TILT_DEG} 30 55)">
    <path d="M30 27 L30 75 C30 88 24 94 15 91" fill="none" stroke="${stick}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 37 L38 35 M22 45 L38 43" stroke="${grip}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="30" cy="8" r="7.5" fill="${ball}"/>
  </g>`;
}

export type IconVariant =
  'large' | 'dark' | 'medium' | 'favicon32' | 'favicon16';

type IconSpec = {
  radius: number;
  background: string;
  /** Arc of the shooting circle, only on large icons. */
  arcOpacity?: number;
  shaft: string;
  strokeWidth: number;
  grip: string;
  gripWidth: number;
  ballRadius: number;
};

const ICON_SPECS: Record<IconVariant, IconSpec> = {
  large: {
    radius: 22,
    background: BRAND_HEX.veldblauw,
    arcOpacity: 0.35,
    shaft: 'M58 32 L58 67 C58 82 50 88 40 85',
    strokeWidth: 12,
    grip: 'M51 40 L65 38 M51 47 L65 45',
    gripWidth: 2.2,
    ballRadius: 7.5,
  },
  dark: {
    radius: 22,
    background: BRAND_HEX.inkt,
    arcOpacity: 0.28,
    shaft: 'M58 32 L58 67 C58 82 50 88 40 85',
    strokeWidth: 12,
    grip: 'M51 40 L65 38 M51 47 L65 45',
    gripWidth: 2.2,
    ballRadius: 7.5,
  },
  medium: {
    radius: 22,
    background: BRAND_HEX.veldblauw,
    shaft: 'M58 32 L58 67 C58 82 50 88 40 85',
    strokeWidth: 13,
    grip: 'M50 40 L66 38 M50 48 L66 46',
    gripWidth: 3,
    ballRadius: 8.5,
  },
  favicon32: {
    radius: 18,
    background: BRAND_HEX.veldblauw,
    shaft: 'M58 34 L58 66 C58 81 50 87 39 83',
    strokeWidth: 15,
    grip: 'M49 42 L67 40 M49 51 L67 49',
    gripWidth: 3.6,
    ballRadius: 10,
  },
  favicon16: {
    radius: 14,
    background: BRAND_HEX.veldblauw,
    shaft: 'M58 36 L58 65 C58 80 49 86 37 81',
    strokeWidth: 17,
    grip: 'M48 44 L68 42 M48 54 L68 52',
    gripWidth: 4.5,
    ballRadius: 11,
  },
};

/** Inner markup of a square app/favicon icon, viewBox 0 0 100 100. */
export function iconMarkup(variant: IconVariant): string {
  const spec = ICON_SPECS[variant];
  const arc =
    spec.arcOpacity === undefined
      ? ''
      : `<circle cx="50" cy="122" r="48" fill="none" stroke="${BRAND_HEX.wit}" stroke-opacity="${spec.arcOpacity}" stroke-width="2.5"/>`;
  return `<rect width="100" height="100" rx="${spec.radius}" fill="${spec.background}"/>
  ${arc}
  <g transform="rotate(${STICK_TILT_DEG} 58 55)">
    <path d="${spec.shaft}" fill="none" stroke="${BRAND_HEX.wit}" stroke-width="${spec.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${spec.grip}" stroke="${spec.background}" stroke-width="${spec.gripWidth}" stroke-linecap="round"/>
    <circle cx="58" cy="15" r="${spec.ballRadius}" fill="${BRAND_HEX.bal}"/>
  </g>`;
}
