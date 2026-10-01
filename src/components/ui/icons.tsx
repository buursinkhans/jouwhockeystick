import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Small, hand-written inline icon set (no icon-library dependency). Every
 * icon has an explicit width/height by default so it can never accidentally
 * render at its intrinsic (large) size — override via `size` or className.
 */
function createIcon(paths: ReactNode) {
  return function Icon({ size = 20, className = '', ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const UserIcon = createIcon(
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
  </>,
);

export const TargetIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </>,
);

export const BoltIcon = createIcon(
  <path d="M12 2 4 14h6l-1 8 9-13h-6l1-7Z" strokeLinejoin="round" />,
);

export const WalletIcon = createIcon(
  <>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14" r="1" fill="currentColor" stroke="none" />
  </>,
);

export const CheckIcon = createIcon(<path d="m5 12 5 5 9-10" />);

export const InfoIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="8" r="0.75" fill="currentColor" stroke="none" />
  </>,
);

export const AlertIcon = createIcon(
  <>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" strokeLinejoin="round" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.7" r="0.75" fill="currentColor" stroke="none" />
  </>,
);

export const RulerIcon = createIcon(
  <>
    <rect x="3" y="8" width="18" height="8" rx="1.5" />
    <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
  </>,
);

export const FilterIcon = createIcon(
  <path d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5Z" />,
);

export const ScaleIcon = createIcon(
  <>
    <path d="M12 4v16M7 20h10M5 7h14" />
    <path d="M5 7 2.5 13h5L5 7ZM19 7l-2.5 6h5L19 7Z" />
  </>,
);

export const SproutIcon = createIcon(
  <>
    <path d="M12 20v-8" />
    <path d="M12 12c0-3.5-2.5-6-6.5-6 0 4 2.5 6 6.5 6ZM12 14c0-3 2-5 6-5 0 3.5-2 5-6 5Z" />
  </>,
);

export const StepsIcon = createIcon(<path d="M3 19h5v-4h5v-4h5V7h3" />);

export const ArrowRightIcon = createIcon(<path d="M5 12h14M13 6l6 6-6 6" />);
