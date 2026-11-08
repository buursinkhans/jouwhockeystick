import Link from 'next/link';
import { PROMISES } from '@/content/trust';
import { CheckIcon } from '@/components/ui/icons';

/**
 * The four promises, each with the page that shows it is kept. On /methodiek
 * the link to /methodiek itself is left out.
 */
export function PromiseList({ currentPath }: { currentPath?: string }) {
  return (
    <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {PROMISES.map((promise) => (
        <li key={promise.title} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-veld text-white">
            <CheckIcon size={14} />
          </span>
          <div>
            <h3 className="font-bold">{promise.title}</h3>
            <p className="mt-1 text-inkt/80">{promise.body}</p>
            {promise.proof.href !== currentPath && (
              <Link href={promise.proof.href} className="mt-1 inline-flex min-h-6 items-center text-sm font-semibold text-veld hover:underline">
                {promise.proof.label} →
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
