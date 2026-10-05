import type { BowProfile } from '@/catalog/types';

// Rough head-curve offsets so the illustration hints at the bow profile.
const BOW_CURVE: Record<BowProfile, string> = {
  ultrabow: 'M20 90 Q34 56 46 58',
  midbow: 'M20 90 Q30 60 46 58',
  dynabow: 'M20 90 Q30 60 46 58',
  probow: 'M20 90 Q28 63 46 58',
  lowbow: 'M20 90 Q26 66 46 58',
  extreme_lowbow: 'M20 90 Q24 69 46 58',
};

/**
 * Abstract SVG illustration in the site colours — not a real product photo (no
 * image rights on unverified test data; keeps the visual system consistent
 * across the whole catalog).
 */
export function StickIllustration({
  bowProfile,
  alt,
  className = '',
}: {
  /** Purely decorative fallback (mid-bow curve) when the bow profile isn't known. */
  bowProfile?: BowProfile;
  alt: string;
  className?: string;
}) {
  const curve = BOW_CURVE[bowProfile ?? 'midbow'];

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={alt}
      className={className}
    >
      <rect
        x="0"
        y="0"
        width="120"
        height="120"
        rx="12"
        className="fill-krijt"
      />
      <path
        d="M46 12 L52 58"
        className="stroke-veld"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={curve}
        className="stroke-veld"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
