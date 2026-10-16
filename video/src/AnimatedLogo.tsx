import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C } from './brand';
import { STICK_TILT_DEG } from '../../src/components/brand/logoGeometry';

/**
 * The homepage logo animation (globals.css, jhs-ball-to-dot and
 * jhs-stick-push) in frames: the stick pushes the ball from the hook in one
 * arc up to the dot of the j. Drawn on inkt so it stands out on veldblauw.
 */
export function AnimatedLogo({ size, delay = 0 }: { size: number; delay?: number }) {
  const frame = useCurrentFrame() - delay;
  const pop = interpolate(frame, [0, 8], [0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(2)),
  });
  // Same arc as the site: a cubic Bézier from the curl of the hook to the dot.
  const t = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const bezier = (a: number, b: number, c: number, d: number) =>
    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
  const ballX = bezier(-15, -18, -10, 0);
  const ballY = bezier(56, 25, 2, 0);
  const push = interpolate(frame, [4, 8, 14], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `scale(${pop})`, transformOrigin: 'left center', opacity: frame < 0 ? 0 : 1 }}
      aria-hidden
    >
      <rect width="100" height="100" rx="22" fill={C.inkt} />
      <circle cx="50" cy="122" r="48" fill="none" stroke={C.wit} strokeOpacity="0.28" strokeWidth="2.5" />
      <g transform={`rotate(${STICK_TILT_DEG} 58 55)`}>
        <g transform={`translate(${-0.5 * push} ${-1.5 * push})`}>
          <path
            d="M58 32 L58 67 C58 82 50 88 40 85"
            fill="none"
            stroke={C.wit}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M51 40 L65 38 M51 47 L65 45" stroke={C.inkt} strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <circle cx={58 + ballX} cy={15 + ballY} r="7.5" fill={C.bal} />
      </g>
    </svg>
  );
}
