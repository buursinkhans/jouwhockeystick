import Link from 'next/link';
import { Logo, LogoIcon } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';

const NAV_LINKS = [
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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
        {/* Lockup: 40 px icon on desktop, 32 px on mobile; below 360 px only icon + "Stickadvies" (merkinstructie §6). */}
        <span className="hidden sm:inline-flex">
          <Logo variant="lockup" size={40} />
        </span>
        <span className="hidden min-[360px]:inline-flex sm:hidden">
          <Logo variant="lockup" size={32} />
        </span>
        <Link
          href="/"
          aria-label="jouwhockeystick.nl – naar home"
          className="jhs-wordmark flex items-center gap-2 text-xl min-[360px]:hidden"
        >
          <LogoIcon size={32} />
          <span aria-hidden="true">Stickadvies</span>
        </Link>
        {/* The stickwijzer is the main action, so it is a button, not a nav link. */}
        <ButtonLink
          href="/stickwijzer"
          variant="accent"
          className="px-4 py-2 lg:order-last"
        >
          Stickwijzer
        </ButtonLink>
        <nav
          aria-label="Hoofdnavigatie"
          className="order-last flex w-full flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-inkt/80 lg:order-none lg:w-auto"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-veld">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
