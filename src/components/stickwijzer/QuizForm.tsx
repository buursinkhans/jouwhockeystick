'use client';

import { useEffect, useRef, useState } from 'react';
import { getAdviceAction } from '@/app/stickwijzer/actions';
import {
  QUESTION_IDS,
  QUESTION_META,
  adviceAnswersSchema,
  isAnswered,
  routeFromSelfSelect,
  type AdviceAnswers,
  type AdviceRoute,
  type QuestionId,
} from '@/advice-engine/answers';
import { suggestRoute } from '@/advice-engine/route';
import type { AdviceResult } from '@/advice-engine/types';
import {
  FIRST_SCREEN,
  QUESTIONS,
  ROUTE_LABELS,
  SCREENS,
  type ScreenDef,
} from '@/content/stickwijzer/questions';
import type { AdviceEventName } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/track';
import { Button } from '@/components/ui/Button';
import { QuestionField, type AnswerValue } from './QuestionField';
import { QuizResult } from './QuizResult';
import { ROUTE_OPTION_ICONS, SCREEN_ICONS } from './stickwijzerIcons';
import { QuestionIcon } from '@/components/ui/icons';

type Answers = Partial<AdviceAnswers>;
type StoredProgress = {
  answers: Answers;
  stepIndex: number;
  sessionId: string;
};

/** Progress lives in sessionStorage only: gone when the tab closes, never sent anywhere. */
const STORAGE_KEY = 'stickwijzer:v1.1';

const SELF_SELECT_BY_ROUTE: Record<
  AdviceRoute,
  AdviceAnswers['route_self_select']
> = {
  START: 'first_stick',
  ONTWIKKEL: 'next_stick',
  PRESTATIE: 'advanced_compare',
};

/** "6 stappen" etc. per route card, derived from the screens so it can't drift. */
const ROUTE_STEP_COUNTS: Record<string, string> = Object.fromEntries(
  (Object.keys(SELF_SELECT_BY_ROUTE) as AdviceRoute[]).map((route) => [
    SELF_SELECT_BY_ROUTE[route],
    `${SCREENS[route].length} stappen`,
  ]),
);

function readProgress(): StoredProgress {
  const empty: StoredProgress = { answers: {}, stepIndex: 0, sessionId: '' };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return empty;
    }
    const stored = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      answers:
        stored.answers && typeof stored.answers === 'object'
          ? stored.answers
          : {},
      stepIndex: typeof stored.stepIndex === 'number' ? stored.stepIndex : 0,
      sessionId: typeof stored.sessionId === 'string' ? stored.sessionId : '',
    };
  } catch {
    return empty;
  }
}

function writeProgress(progress: StoredProgress | null): void {
  try {
    if (progress) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode, quota); the wizard works without it.
  }
}

function isVisible(id: QuestionId, answers: Answers): boolean {
  return QUESTIONS[id].showWhen?.(answers) ?? true;
}

function heightError(answers: Answers): string | undefined {
  const height = answers.height_cm;
  if (height === undefined) {
    return undefined;
  }
  const input = QUESTIONS.height_cm.input;
  if (
    input.kind === 'number' &&
    (!Number.isInteger(height) || height < input.min || height > input.max)
  ) {
    return `Vul een hele lengte in tussen ${input.min} en ${input.max} cm.`;
  }
  return undefined;
}

function canProceed(screen: ScreenDef, answers: Answers): boolean {
  return (
    screen.questions.every((id) => isAnswered(answers[id])) &&
    heightError(answers) === undefined
  );
}

/** Drops answers to questions that don't belong to the final route or are hidden. */
function answersForRoute(answers: Answers, route: AdviceRoute): Answers {
  const cleaned: Record<string, unknown> = {};
  for (const id of QUESTION_IDS) {
    if (
      QUESTION_META[id].routes.includes(route) &&
      isVisible(id, answers) &&
      isAnswered(answers[id])
    ) {
      cleaned[id] = answers[id];
    }
  }
  return cleaned as Answers;
}

function answerKey(id: QuestionId, value: AnswerValue): string | undefined {
  // The exact height is not needed for funnel analysis, so it is not sent.
  if (id === 'height_cm' || value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value.join('+') : String(value);
}

export function QuizForm() {
  const [initial] = useState(readProgress);
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [stepIndex, setStepIndex] = useState(initial.stepIndex);
  const [sessionId, setSessionId] = useState(initial.sessionId);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  const route = answers.route_self_select
    ? routeFromSelfSelect(answers.route_self_select)
    : null;
  const screens = SCREENS[route ?? 'START'];
  const currentStep = Math.min(stepIndex, screens.length - 1);
  const screen = screens[currentStep] ?? FIRST_SCREEN;
  const isLastStep = currentStep === screens.length - 1;

  useEffect(() => {
    writeProgress(
      sessionId ? { answers, stepIndex: currentStep, sessionId } : null,
    );
  }, [answers, currentStep, sessionId]);

  // Move focus to the new screen's heading so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [currentStep, advice]);

  function track(
    name: AdviceEventName,
    id: string,
    extra: {
      questionId?: string;
      answerKey?: string;
      productId?: string;
      route?: AdviceRoute;
    } = {},
  ) {
    trackEvent({
      name,
      adviceSessionId: id,
      route: extra.route ?? route ?? undefined,
      questionId: extra.questionId,
      answerKey: extra.answerKey,
      productId: extra.productId,
      timestamp: new Date().toISOString(),
    });
  }

  function handleChange(id: QuestionId, value: AnswerValue) {
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = crypto.randomUUID();
      setSessionId(activeSessionId);
      trackEvent({ name: 'quiz_start' });
      track('advice_started', activeSessionId);
    }
    if (
      id === 'route_self_select' &&
      typeof value === 'string' &&
      value !== answers.route_self_select
    ) {
      const selected = routeFromSelfSelect(
        value as AdviceAnswers['route_self_select'],
      );
      track('route_selected', activeSessionId, { route: selected });
    }
    setErrorMessage(null);
    setAnswers((previous) => ({ ...previous, [id]: value }) as Answers);
  }

  function trackScreenAnswers() {
    for (const id of [...screen.questions, ...(screen.optional ?? [])]) {
      if (isVisible(id, answers) && isAnswered(answers[id])) {
        track('question_answered', sessionId, {
          questionId: id,
          answerKey: answerKey(id, answers[id]),
        });
      }
    }
  }

  async function handleSubmit() {
    if (!route) {
      return;
    }
    trackScreenAnswers();

    const parsed = adviceAnswersSchema.safeParse(
      answersForRoute(answers, route),
    );
    if (!parsed.success) {
      setErrorMessage(
        'Niet alle verplichte vragen zijn ingevuld. Ga terug en controleer je antwoorden.',
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    const result = await getAdviceAction(parsed.data, sessionId);
    setSubmitting(false);

    if (result.status === 'error') {
      setErrorMessage(result.message);
      return;
    }

    setAdvice(result.advice);
    trackEvent({
      name: 'quiz_complete',
      ruleSetVersion: result.advice.ruleSetVersion,
      hasRecommendation: result.advice.results.length > 0,
      isUncertain: result.advice.isUncertain,
    });
    track('advice_completed', sessionId, {
      answerKey: result.advice.noMatchReason ?? 'match',
    });
    for (const item of [
      ...result.advice.results,
      ...result.advice.otherSizeOptions,
    ]) {
      track('advice_product_viewed', sessionId, {
        productId: item.product.slug,
        answerKey: item.role,
      });
    }
  }

  function handleRestart() {
    setAdvice(null);
    setAnswers({});
    setStepIndex(0);
    setSessionId('');
    setErrorMessage(null);
  }

  if (advice) {
    return (
      <div className="max-w-3xl">
        <QuizResult
          advice={advice}
          adviceGoal={answers.advice_goal}
          headingRef={headingRef}
          onEdit={() => setAdvice(null)}
          onRestart={handleRestart}
          onFeedback={(helpful) =>
            track('advice_feedback_submitted', sessionId, {
              answerKey: helpful ? 'helpful' : 'not_helpful',
            })
          }
        />
      </div>
    );
  }

  const suggested =
    screen.id === 'age_experience' &&
    route &&
    answers.age_band &&
    answers.experience_seasons
      ? suggestRoute({
          age_band: answers.age_band,
          experience_seasons: answers.experience_seasons,
        })
      : null;
  const ScreenIcon = SCREEN_ICONS[screen.id] ?? QuestionIcon;
  const optionalIds = (screen.optional ?? []).filter((id) =>
    isVisible(id, answers),
  );

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!canProceed(screen, answers)) {
          return;
        }
        if (isLastStep) {
          void handleSubmit();
        } else {
          trackScreenAnswers();
          setStepIndex(currentStep + 1);
        }
      }}
    >
      <p className="text-sm text-lijngrijs">
        Stap {currentStep + 1}
        {route ? ` van ${screens.length}` : ''}
        {route ? ` · ${ROUTE_LABELS[route]}` : ''}
      </p>
      {route && (
        // Thin line with an orange ball that moves along, echoing the logo
        // without repeating it (merkinstructie §7).
        <div
          role="progressbar"
          aria-label="Voortgang van de keuzehulp"
          aria-valuemin={1}
          aria-valuemax={screens.length}
          aria-valuenow={currentStep + 1}
          aria-valuetext={`Stap ${currentStep + 1} van ${screens.length}`}
          className="relative mt-3 h-3"
        >
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-rand" />
          <span
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-veld transition-[width] duration-300"
            style={{
              width: `${(currentStep / Math.max(1, screens.length - 1)) * 100}%`,
            }}
          />
          <span
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bal transition-[left] duration-300"
            style={{
              left: `${(currentStep / Math.max(1, screens.length - 1)) * 100}%`,
            }}
          />
        </div>
      )}

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 flex items-center gap-3 text-2xl font-extrabold focus:outline-none"
      >
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-veld text-white"
        >
          <ScreenIcon size={22} />
        </span>
        {screen.title}
      </h2>

      <div className="mt-4 space-y-8">
        {screen.questions.map((id) => (
          <QuestionField
            key={id}
            def={QUESTIONS[id]}
            value={answers[id]}
            onChange={(value) => handleChange(id, value)}
            errorMessage={id === 'height_cm' ? heightError(answers) : undefined}
            optionMeta={
              id === 'route_self_select' ? ROUTE_STEP_COUNTS : undefined
            }
            optionIcons={
              id === 'route_self_select' ? ROUTE_OPTION_ICONS : undefined
            }
          />
        ))}

        {suggested && route && suggested !== route && (
          <div
            className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            <p>
              Op basis van leeftijd en ervaring past de{' '}
              {ROUTE_LABELS[suggested].toLowerCase()} waarschijnlijk beter dan
              de {ROUTE_LABELS[route].toLowerCase()}. Je kunt wisselen of je
              eigen keuze houden.
            </p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() =>
                handleChange(
                  'route_self_select',
                  SELF_SELECT_BY_ROUTE[suggested],
                )
              }
            >
              Wissel naar de {ROUTE_LABELS[suggested].toLowerCase()}
            </Button>
          </div>
        )}

        {optionalIds.map((id) => (
          <QuestionField
            key={id}
            def={QUESTIONS[id]}
            value={answers[id]}
            onChange={(value) => handleChange(id, value)}
            optional
          />
        ))}
      </div>

      <p className="mt-4 min-h-5 text-sm text-red-700" aria-live="polite">
        {errorMessage}
      </p>

      <div className="mt-2 flex flex-wrap gap-3">
        {currentStep > 0 && (
          <Button
            variant="secondary"
            onClick={() => setStepIndex(currentStep - 1)}
          >
            Vorige
          </Button>
        )}
        <Button
          type="submit"
          disabled={!canProceed(screen, answers) || submitting}
        >
          {isLastStep
            ? submitting
              ? 'Bezig met adviseren…'
              : 'Bekijk advies'
            : 'Volgende'}
        </Button>
      </div>

      <p className="mt-6 text-xs text-lijngrijs">
        Je antwoorden blijven alleen in dit browsertabblad bewaard tot je het
        sluit.
      </p>
    </form>
  );
}
