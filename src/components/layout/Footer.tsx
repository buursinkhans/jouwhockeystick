import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-600 sm:px-6">
        <p>
          Aankopen verlopen via bol.com. Getoonde prijzen zijn adviesprijzen van
          de fabrikant.
        </p>
        <p className="mt-2">
          <Link href="/over-ons" className="hover:underline">
            Over ons
          </Link>
          {' · '}
          <Link href="/methodiek" className="hover:underline">
            Zo werkt ons advies
          </Link>
          {' · '}
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          {' · '}
          <a href="mailto:info@jouwhockeystick.nl" className="hover:underline">
            info@jouwhockeystick.nl
          </a>
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} jouwhockeystick.nl
        </p>
      </div>
    </footer>
  );
}
