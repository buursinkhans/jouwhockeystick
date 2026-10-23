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
    // Reserve at least a screen (mobile) or the form's usual height (wider
    // screens) while the wizard loads, so the section below does not jump
    // down when it appears (Lighthouse CLS 0.40 on /stickwijzer, 2026-10-23).
    loading: () => (
      <div className="min-h-[100svh] md:min-h-[34rem]">
        <p className="text-sm text-lijngrijs">De keuzehulp wordt geladen…</p>
      </div>
    ),
  },
);

export function StickwijzerLoader() {
  return <QuizForm />;
}
