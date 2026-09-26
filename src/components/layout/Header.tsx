import Link from 'next/link';

const NAV_LINKS = [
  { href: '/stickwijzer', label: 'Stickwijzer' },
  { href: '/sticks', label: 'Sticks' },
  { href: '/kennis/hoe-kies-je-de-juiste-hockeystick', label: 'Kennisbank' },
  { href: '/over-ons', label: 'Over ons' },
];

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-emerald-800">
          jouwhockeystick.nl
        </Link>
        <nav aria-label="Hoofdnavigatie" className="flex gap-4 text-sm font-medium text-zinc-700">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-emerald-800">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
