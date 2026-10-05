import Link from 'next/link';
import { BRAND_PAYOFF } from '@/lib/site';
import {
  BRAND_HEX,
  iconMarkup,
  wordmarkStickMarkup,
  type IconVariant,
} from './logoGeometry';

type LogoVariant = 'wordmark' | 'wordmark-negative' | 'lockup' | 'icon';

/** The j-stick of merkinstructie §3.1; scales with the font size. */
function JStick({ negative }: { negative: boolean }) {
  // Static markup from logoGeometry, shared with the exported logo files.
  const markup = wordmarkStickMarkup(
    negative
      ? { stick: BRAND_HEX.wit, grip: BRAND_HEX.veldblauw }
      : { stick: BRAND_HEX.veldblauw, grip: BRAND_HEX.wit },
  );
  return (
    <svg
      viewBox="0 0 44 100"
      aria-hidden="true"
      style={{
        height: '0.95em',
        width: '0.418em',
        verticalAlign: '-0.228em',
        marginRight: '0.01em',
        overflow: 'visible',
        display: 'inline-block',
      }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

/**
 * Square brand icon. Small sizes use the heavier favicon drawing so the
 * stick, grip stripes and ball stay legible ("hoe kleiner, hoe dikker").
 */
export function LogoIcon({ size }: { size: number }) {
  const variant: IconVariant =
    size >= 128 ? 'large' : size >= 64 ? 'medium' : 'favicon32';
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
      dangerouslySetInnerHTML={{ __html: iconMarkup(variant) }}
    />
  );
}

/**
 * The jouwhockeystick.nl logo (merkinstructie §4 and §6). Screen readers
 * read the link label, never the visual "ouwhockeystick".
 */
export function Logo({
  variant = 'wordmark',
  size = 32,
  tagline = false,
  href = '/',
}: {
  variant?: LogoVariant;
  /** Font size in px for the wordmark, or the icon size. */
  size?: number;
  tagline?: boolean;
  href?: string | null;
}) {
  let content;
  if (variant === 'icon') {
    content = <LogoIcon size={size} />;
  } else if (variant === 'lockup') {
    // The stick is already in the icon, so the text uses a regular "j" (§4).
    content = (
      <span className="flex items-center" style={{ gap: size * 0.4 }}>
        <LogoIcon size={size} />
        <span className="jhs-wordmark" style={{ fontSize: size * 0.6 }}>
          jouwhockeystick<span className="jhs-tld">.nl</span>
        </span>
      </span>
    );
  } else {
    content = (
      <span className="inline-flex flex-col">
        <span className="jhs-wordmark" style={{ fontSize: size }}>
          <JStick negative={variant === 'wordmark-negative'} />
          ouwhockeystick<span className="jhs-tld">.nl</span>
        </span>
        {tagline && (
          <span
            className={
              variant === 'wordmark-negative'
                ? 'text-nl-negatief'
                : 'text-lijngrijs'
            }
            // The guideline ratio (26 px at a 104 px wordmark) becomes unreadable at
            // header sizes, so the pay-off never goes below 13 px.
            style={{
              fontSize: Math.max(13, size * 0.25),
              marginTop: Math.max(4, size * 0.27),
            }}
          >
            {BRAND_PAYOFF}
          </span>
        )}
      </span>
    );
  }

  const className = `jhs-logo inline-flex ${variant === 'wordmark-negative' ? 'jhs-logo--negative' : ''}`;
  if (href === null) {
    return (
      <span className={className} role="img" aria-label="jouwhockeystick.nl">
        <span aria-hidden="true">{content}</span>
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      aria-label="jouwhockeystick.nl – naar home"
    >
      <span aria-hidden="true">{content}</span>
    </Link>
  );
}
