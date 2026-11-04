import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site';
import { INSTAGRAM } from '@/content/social';
import { InstagramIcon } from '@/components/ui/icons';

/**
 * Footer in columns (redesign fase 4): what a visitor wants to do (kiezen),
 * learn (leren) and who is behind it (over ons), so pages that left the main
 * menu (Vergelijk, Blog) stay one click away.
 */
const FOOTER_COLUMNS: ReadonlyArray<{ heading: string; links: ReadonlyArray<{ href: string; label: string }> }> = [
  {
    heading: 'Kiezen',
    links: [
      { href: '/stickwijzer', label: 'Stickwijzer' },
      { href: '/sticks', label: 'Veldsticks' },
      { href: '/zaalsticks', label: 'Zaalsticks' },
      { href: '/hockeyschoenen', label: 'Hockeyschoenen' },
      { href: '/vergelijk', label: 'Sticks vergelijken' },
    ],
  },
  {
    heading: 'Leren',
    links: [
      { href: '/kennis', label: 'Kennisbank' },
      { href: '/blog', label: 'Blog' },
      { href: '/merken', label: 'Merken' },
      { href: '/kennis/waar-koop-je-een-hockeystick', label: 'Waar koop je een stick?' },
    ],
  },
  {
    heading: 'Over ons',
    links: [
      { href: '/over-ons', label: 'Over ons' },
      { href: '/methodiek', label: 'Zo werkt ons advies' },
      { href: '/clubs', label: 'Voor hockeyclubs' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="focus-ring-light print:hidden bg-hex-dark bg-veld text-nl-negatief">
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-10 text-sm sm:px-6 sm:pt-20">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="wordmark-negative" size={30} tagline />
            <p className="mt-6 max-w-sm">
              Aankopen verlopen via onze partnerwinkels bol.com, PassaHockey,
              Plutosport en HockeyCity; de winkel is de verkoper. Winkelprijzen werken we
              wekelijks bij en richtprijzen zijn een indicatie: de actuele prijs
              zie je bij de winkel.
            </p>
            <p className="mt-4">
              <a
                href={INSTAGRAM.url}
                rel="me noopener noreferrer"
                target="_blank"
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-white hover:underline"
              >
                <InstagramIcon size={22} />
                {INSTAGRAM.label}{' '}
                <span className="font-normal text-nl-negatief">
                  @{INSTAGRAM.handle}
                </span>
              </a>
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-xs font-semibold tracking-wide text-nl-negatief uppercase">{column.heading}</h2>
              <ul className="mt-3 space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-8 items-center font-semibold text-white hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {column.heading === 'Over ons' && (
                  <li>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-8 items-center font-semibold break-all text-white hover:underline">
                      {CONTACT_EMAIL}
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 border-t border-white/15 pt-6">
          &copy; {new Date().getFullYear()} {SITE_NAME} · We verkopen zelf niets
        </p>
      </div>
    </footer>
  );
}
