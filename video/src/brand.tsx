import type { CSSProperties, ReactNode } from 'react';
import { BRAND_HEX, STICK_TILT_DEG } from '../../src/components/brand/logoGeometry';

export const C = BRAND_HEX;

export const FONT_DISPLAY = 'Bricolage, system-ui, sans-serif';
export const FONT_BODY = '"Instrument Sans", system-ui, sans-serif';

/** The app icon (same shapes as public/brand/jhs-icon.svg). */
export function BrandIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <rect width="100" height="100" rx="22" fill={C.veldblauw} />
      <circle
        cx="50"
        cy="122"
        r="48"
        fill="none"
        stroke={C.wit}
        strokeOpacity="0.35"
        strokeWidth="2.5"
      />
      <g transform={`rotate(${STICK_TILT_DEG} 58 55)`}>
        <path
          d="M58 32 L58 67 C58 82 50 88 40 85"
          fill="none"
          stroke={C.wit}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M51 40 L65 38 M51 47 L65 45"
          stroke={C.veldblauw}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="58" cy="15" r="7.5" fill={C.bal} />
      </g>
    </svg>
  );
}

/** Small wordmark line used in corners and on the end card. */
export function SiteName({
  size,
  color = C.wit,
}: {
  size: number;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.45,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        color,
        letterSpacing: '-0.01em',
      }}
    >
      <BrandIcon size={size * 1.5} />
      jouwhockeystick.nl
    </div>
  );
}

export function Pill({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        background: C.bal,
        color: C.inkt,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
