'use client';

import dynamic from 'next/dynamic';

/**
 * The wizard restores progress from sessionStorage on its first render, so
 * it is rendered on the client only — prerendering it would show step 1 and
 * then jump to the restored step.
 */
const QuizForm = dynamic(
  () => import('./QuizForm').then((module) => module.QuizForm),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-lijngrijs">De keuzehulp wordt geladen…</p>
    ),
  },
);

export function StickwijzerLoader() {
  return <QuizForm />;
}
