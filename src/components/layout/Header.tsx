import Link from 'next/link';
import { Logo, LogoIcon } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { CheckIcon } from '@/components/ui/icons';
import { getTrustFacts } from '@/catalog/trustFacts';
import { MainNav, type NavLink } from './MainNav';

const NAV_LINKS: NavLink[] = [
  { href: '/sticks', label: 'Sticks' },
  { href: '/zaalsticks', label: 'Zaalsticks' },
  { href: '/hockeyschoenen', label: 'Hockeyschoenen' },
  { href: '/merken', label: 'Merken' },
  { href: '/kennis', label: 'Kennisbank' },
  { href: '/over-ons', label: 'Over ons' },
];
// Vergelijk and Blog moved to the footer (redesign fase 1, 2026-11-03): six
// links fit on one row next to the logo; comparing starts from a stick page
// or an advice, where the first stick is already chosen.

/**
 * The thin bar above the header (redesign fase 5): what the site is, before
 * anything else. Each point is a rule the site keeps (src/content/trust.ts);
 * the shop count comes from src/lib/retailers.ts. A phone shows the first.
 */
function IndependenceBar() {
  const { shops } = getTrustFacts();
  const points = [
    'Onafhankelijke stickvergelijker',
    `Prijzen van ${shops} partnerwinkels`,
    'Vergoeding telt niet mee in het advies',
  ];
  return (
    <div className="bg-inkt text-xs text-white/85 print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <ul className="flex min-w-0 items-center gap-x-5">
          {points.map((point, index) => (
            <li key={point} className={`items-center gap-1.5 ${index === 0 ? 'flex' : 'hidden md:flex'}`}>
              <CheckIcon size={12} className="shrink-0 text-nl-negatief" />
              <span className="truncate">{point}</span>
            </li>
          ))}
        </ul>
        <Link href="/methodiek" className="shrink-0 font-semibold text-white underline-offset-2 hover:underline">
          Zo werkt ons advies
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <>
      <IndependenceBar />
      {/* Sticky with a light blur, so the main action stays one tap away while scrolling. */}
      <header className="sticky top-0 z-40 border-b border-rand/70 bg-white/90 shadow-header backdrop-blur-md supports-[backdrop-filter]:bg-white/80 print:static print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-1.5 gap-y-2 px-4 py-2.5 sm:gap-x-4 sm:px-6 lg:py-3">
          {/*
           * Lockup: 40 px icon on desktop. On mobile 26 px instead of the 32 px
           * from merkinstructie §6, so logo, Stickwijzer button and menu button
           * fit on one row down to 360 px; the wordmark stays above the 140 px
           * minimum (§4.1). Below 360 px only icon + "Stickadvies".
           */}
          <span className="mr-auto hidden sm:inline-flex">
            <Logo variant="lockup" size={40} tagline />
          </span>
          <span className="mr-auto hidden min-[360px]:inline-flex sm:hidden">
            <Logo variant="lockup" size={26} />
          </span>
          <Link
            href="/"
            aria-label="jouwhockeystick.nl – naar home"
            className="jhs-wordmark mr-auto flex items-center gap-2 text-xl min-[360px]:hidden"
          >
            <LogoIcon size={32} />
            <span aria-hidden="true">Stickadvies</span>
          </Link>
          <MainNav links={NAV_LINKS} />
          {/* The stickwijzer is the main action, so it is a button, not a nav link. */}
          <ButtonLink
            href="/stickwijzer"
            variant="accent"
            // The compact label keeps logo, six links and this button on one row (fase 7).
            className="order-1 min-h-11 shrink-0 px-3! py-2! text-sm! sm:px-4! lg:order-last"
          >
            Stickwijzer
          </ButtonLink>
        </div>
      </header>
    </>
  );
}
