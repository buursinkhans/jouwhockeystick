import type { Brand, BowProfile } from '@/catalog/types';

const BRAND_COLORS: Record<Brand, string> = {
  Grays: '#0f6b4c',
  Brabo: '#c4471f',
  adidas: '#111827',
  JDH: '#1d4ed8',
  Princess: '#a21caf',
};

// Rough head-curve offsets so the illustration hints at the bow profile.
const BOW_CURVE: Record<BowProfile, string> = {
  'low-bow': 'M20 90 Q26 66 46 58',
  'mid-bow': 'M20 90 Q30 60 46 58',
  'late-bow': 'M20 90 Q34 56 46 58',
};

/**
 * Abstract, brand-colored SVG illustration — not a real product photo (no
 * image rights on unverified test data; keeps the visual system consistent
 * across the whole catalog).
 */
export function StickIllustration({
  brand,
  bowProfile,
  alt,
  className = '',
}: {
  brand: Brand;
  /** Purely decorative fallback (mid-bow curve) when the bow profile isn't known. */
  bowProfile?: BowProfile;
  alt: string;
  className?: string;
}) {
  const color = BRAND_COLORS[brand];
  const curve = BOW_CURVE[bowProfile ?? 'mid-bow'];

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={alt}
      className={className}
    >
      <rect x="0" y="0" width="120" height="120" rx="12" fill={`${color}1a`} />
      <path
        d="M46 12 L52 58"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path d={curve} stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}
