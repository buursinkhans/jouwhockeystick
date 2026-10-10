'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export type NavLink = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Main navigation. Desktop: one row of links. Mobile: a "Menu" button that
 * opens a list with full-size tap targets, instead of two cramped rows of
 * small links. The current page is marked with aria-current.
 */
export function MainNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="order-2 inline-flex h-11 w-10 shrink-0 sm:w-11 items-center justify-center rounded-full border border-rand text-inkt hover:bg-krijt lg:hidden"
        aria-expanded={open}
        aria-controls="hoofdmenu"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <nav
        id="hoofdmenu"
        aria-label="Hoofdnavigatie"
        className={`${open ? 'block' : 'hidden'} order-last w-full lg:order-none lg:block lg:w-auto`}
      >
        <ul className="flex flex-col border-t border-rand pt-2 lg:flex-row lg:gap-1 lg:border-0 lg:pt-0">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center rounded-lg px-3 text-base font-semibold transition-colors lg:text-sm ${
                    active
                      ? 'bg-krijt text-veld'
                      : 'text-inkt/80 hover:bg-krijt hover:text-veld'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
