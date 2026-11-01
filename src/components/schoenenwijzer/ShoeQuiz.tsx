'use client';

import { useState, useTransition } from 'react';
import { getShoeAdviceAction } from '@/app/hockeyschoenen/wijzer/actions';
import { Button } from '@/components/ui/Button';
import { NO_SIZE, NO_SIZE_LABEL, visibleQuestions, type ShoeQuestion, type ShoeQuizState } from '@/content/schoenenwijzer/questions';
import type { ShoeAnswers } from '@/shoe-advice/answers';
import type { FitParticular } from '@/shoe-advice/fitNotes';
import type { ShoeAdvice } from '@/shoe-advice/types';
import { trackEvent } from '@/lib/analytics/track';
import { shareHref } from '@/lib/shareAdvice';
import { SHOE_SHARE_PATH, toServerAnswers } from '@/shoe-advice/share';
import type { ShoeArticleLink } from '@/content/shoeArticles';
import { ShoeAdviceView } from './ShoeAdviceView';

const isAnswered = (question: ShoeQuestion, state: ShoeQuizState) => {
  const value = state[question.id];
  return Array.isArray(value) ? value.length > 0 : value !== undefined;
};

function Field({
  question,
  state,
  sizes,
  onChange,
}: {
  question: ShoeQuestion;
  state: ShoeQuizState;
  sizes: readonly string[];
  onChange: (value: unknown) => void;
}) {
  const value = state[question.id];
  if (question.kind === 'size') {
    return (
      <select
        id={`vraag-${question.id}`}
        className="mt-3 min-h-11 w-full max-w-xs rounded-lg border border-lijngrijs bg-white px-3"
        value={value === null ? NO_SIZE : typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value === NO_SIZE ? null : event.target.value || undefined)}
      >
        <option value="">Kies je maat</option>
        <option value={NO_SIZE}>{NO_SIZE_LABEL}</option>
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    );
  }
  const multi = question.kind === 'multi';
  const selected: string[] = Array.isArray(value) ? (value as string[]) : value === undefined ? [] : [String(value)];
  return (
    <div className="mt-3 flex flex-col gap-2">
      {question.options.map((option) => {
        const active = selected.includes(option.value);
        const full = multi && question.max !== undefined && selected.length >= question.max && !active;
        return (
          <button
            key={option.value}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={active}
            disabled={full}
            onClick={() => {
              if (!multi) {
                onChange(question.kind === 'boolean' ? option.value === 'true' : option.value);
                return;
              }
              // "Geen", "goed" and "weet niet" exclude the other choices.
              const exclusive = ['geen', 'goed', 'weet-niet'];
              const next = active
                ? selected.filter((v) => v !== option.value)
                : exclusive.includes(option.value)
                  ? [option.value]
                  : [...selected.filter((v) => !exclusive.includes(v)), option.value];
              onChange(next.length ? next : undefined);
            }}
            className={`min-h-11 rounded-xl px-4 py-2 text-left disabled:opacity-50 ${
              active ? 'border-2 border-veld bg-white font-semibold text-veld' : 'border border-lijngrijs bg-white text-inkt hover:border-veld'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type Done = { advice: ShoeAdvice; answers: ShoeAnswers };

/** The schoenenwijzer: one question per screen, the advice computed on the server (decision log 2026-11-01). */
export function ShoeQuiz({ sizes, articles = [] }: { sizes: readonly string[]; articles?: readonly ShoeArticleLink[] }) {
  const [state, setState] = useState<ShoeQuizState>({});
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const questions = visibleQuestions(state);
  const question = questions[Math.min(step, questions.length - 1)]!;
  const answered = isAnswered(question, state);
  const last = step >= questions.length - 1 || state.player === 'keeper';

  function answer(value: unknown) {
    if (!started) {
      trackEvent({ name: 'quiz_start', quiz: 'schoen' });
      setStarted(true);
    }
    setState((s) => ({ ...s, [question.id]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const answers = toServerAnswers(state);
      const result = await getShoeAdviceAction(answers);
      if (result.status === 'error') {
        setError(result.message);
        return;
      }
      const items = result.advice.kind === 'advice' ? result.advice.advices.flatMap((a) => a.items) : [];
      trackEvent({
        name: 'quiz_complete',
        quiz: 'schoen',
        ruleSetVersion: result.advice.ruleSetVersion,
        hasRecommendation: items.length > 0,
        isUncertain: items.every((i) => i.certainty !== 'goede-onderbouwing'),
      });
      setDone({ advice: result.advice, answers: answers as ShoeAnswers });
    });
  }

  if (done) {
    const slugs = done.advice.kind === 'advice' ? done.advice.advices.flatMap((a) => a.items.map((i) => i.shoe.slug)) : [];
    return (
      <div className="space-y-6">
        <ShoeAdviceView
          advice={done.advice}
          answers={done.answers}
          articles={articles}
          fitParticulars={(state.fitParticulars ?? []) as FitParticular[]}
          shareHref={done.advice.kind === 'advice' ? shareHref(done.answers, slugs, SHOE_SHARE_PATH) : null}
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDone(null)}>
            Antwoorden aanpassen
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setState({});
              setStep(0);
              setDone(null);
            }}
          >
            Opnieuw beginnen
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((step + 1) / questions.length) * 100);
  return (
    // ph-no-capture: PostHog autocapture records no click or button text in the questions, so no
    // answer (question 7 least of all) reaches the statistics (privacy statement 1.5).
    <form
      className="ph-no-capture rounded-3xl border border-rand bg-white p-5 shadow-sm sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!answered && !question.optional) return;
        if (last) submit();
        else setStep((s) => s + 1);
      }}
    >
      <div className="h-2 rounded-full bg-krijt" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Voortgang">
        <div className="h-2 rounded-full bg-veld" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-sm text-lijngrijs">
        Vraag {step + 1} van {questions.length}
        {question.optional && ' · optioneel'}
      </p>
      <fieldset className="mt-2">
        <legend className="text-xl font-bold">
          <label htmlFor={question.kind === 'size' ? `vraag-${question.id}` : undefined}>{question.question}</label>
        </legend>
        {question.helpText && <p className="mt-1 text-sm text-inkt/80">{question.helpText}</p>}
        <Field question={question} state={state} sizes={sizes} onChange={answer} />
      </fieldset>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Terug
          </Button>
        )}
        <Button type="submit" disabled={pending || (!answered && !question.optional)}>
          {pending ? 'Bezig…' : last ? 'Toon mijn advies' : answered || !question.optional ? 'Volgende' : 'Overslaan'}
        </Button>
      </div>
    </form>
  );
}
