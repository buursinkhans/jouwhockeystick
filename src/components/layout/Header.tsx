import Link from 'next/link';
import { Logo, LogoIcon } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { MainNav, type NavLink } from './MainNav';

const NAV_LINKS: NavLink[] = [
  { href: '/sticks', label: 'Sticks' },
  { href: '/zaalsticks', label: 'Zaalsticks' },
  { href: '/merken', label: 'Merken' },
  { href: '/vergelijk', label: 'Vergelijk' },
  { href: '/kennis', label: 'Kennisbank' },
  { href: '/blog', label: 'Blog' },
  { href: '/over-ons', label: 'Over ons' },
];

export function Header() {
  return (
    <header className="border-b border-rand bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-1.5 gap-y-2 px-4 py-3 sm:gap-x-4 sm:px-6 lg:py-4">
        {/*
         * Lockup: 40 px icon on desktop. On mobile 26 px instead of the 32 px
         * from merkinstructie §6, so logo, Stickwijzer button and menu button
         * fit on one row down to 360 px; the wordmark stays above the 140 px
         * minimum (§4.1). Below 360 px only icon + "Stickadvies".
         */}
        <span className="mr-auto hidden sm:inline-flex">
          <Logo variant="lockup" size={40} />
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
          className="order-1 min-h-11 shrink-0 px-3! py-2! sm:px-4! lg:order-last"
        >
          Stickwijzer
        </ButtonLink>
      </div>
    </header>
  );
}
