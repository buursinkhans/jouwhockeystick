'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AdviceAnswers } from '@/advice-engine/answers';
import type { AdviceResult } from '@/advice-engine/types';
import { trackEvent } from '@/lib/analytics/track';
import { QuizResult } from './QuizResult';

/** The result of a shared advice link, with a way to do the stickwijzer yourself. */
export function SharedAdvice({
  advice,
  adviceGoal,
  changed,
  shareHref,
}: {
  advice: AdviceResult;
  adviceGoal: AdviceAnswers['advice_goal'];
  changed: boolean;
  shareHref: string;
}) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    trackEvent({ name: 'shared_advice_opened', changed });
  }, [changed]);

  return (
    <QuizResult
      advice={advice}
      adviceGoal={adviceGoal}
      headingRef={headingRef}
      shared
      shareHref={shareHref}
      onEdit={() => router.push('/stickwijzer')}
      onRestart={() => router.push('/stickwijzer')}
      onFeedback={() => {}}
    />
  );
}
