'use client';

import { useState } from 'react';
import { getAdviceAction } from '@/app/stickwijzer/actions';
import { quizAnswersSchema, type AdviceResult } from '@/advice-engine/types';
import { trackEvent } from '@/lib/analytics/track';
import { Button } from '@/components/ui/Button';
import { QuizStep, type OnAnswerChange, type QuizStepAnswers } from './QuizStep';
import { QuizResult } from './QuizResult';

const TOTAL_STEPS = 4;

function canProceed(step: number, answers: QuizStepAnswers): boolean {
  switch (step) {
    case 0:
      return (
        answers.buyerType !== undefined &&
        (answers.buyerType !== 'kind' || typeof answers.age === 'number') &&
        answers.playerHeightCm !== undefined &&
        answers.position !== undefined
      );
    case 1:
      return answers.experienceLevel !== undefined && answers.currentStickExperience !== undefined;
    case 2:
      return Boolean(answers.desiredPlayActions?.length) && answers.comfortPreference !== undefined;
    case 3:
      return typeof answers.budgetMaxEur === 'number' && answers.budgetMaxEur > 0;
    default:
      return false;
  }
}

export function QuizForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizStepAnswers>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AdviceResult | null>(null);

  const handleChange: OnAnswerChange = (key, value) => {
    if (!hasStarted) {
      setHasStarted(true);
      trackEvent({ name: 'quiz_start' });
    }
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit() {
    const parsed = quizAnswersSchema.safeParse(answers);
    if (!parsed.success) {
      setErrorMessage('Niet alle antwoorden zijn geldig ingevuld. Controleer je invoer.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const result = await getAdviceAction(parsed.data);

    setSubmitting(false);

    if (result.status === 'error') {
      setErrorMessage(result.message);
      return;
    }

    setAdvice(result.advice);
    trackEvent({
      name: 'quiz_complete',
      ruleSetVersion: result.advice.ruleSetVersion,
      hasRecommendation: result.advice.recommended !== null,
      isUncertain: result.advice.isUncertain,
    });
  }

  if (advice) {
    return (
      <div>
        <QuizResult advice={advice} />
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setAdvice(null);
              setAnswers({});
              setStep(0);
              setHasStarted(false);
            }}
          >
            Opnieuw beginnen
          </Button>
        </div>
      </div>
    );
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div>
      <p className="text-sm text-zinc-500">
        Stap {step + 1} van {TOTAL_STEPS}
      </p>
      <div className="mt-4">
        <QuizStep step={step} answers={answers} onChange={handleChange} />
      </div>

      {errorMessage && <p className="mt-4 text-sm text-red-700">{errorMessage}</p>}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Vorige
          </Button>
        )}
        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={!canProceed(step, answers) || submitting}>
            {submitting ? 'Bezig met adviseren…' : 'Bekijk advies'}
          </Button>
        ) : (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed(step, answers)}
          >
            Volgende
          </Button>
        )}
      </div>
    </div>
  );
}
