import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Anchor target, e.g. for an index at the top of the page. */
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`card p-6 ${className}`}
    >
      {children}
    </div>
  );
}
