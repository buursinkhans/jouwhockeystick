import { interestFormSchema, type InterestFormInput, type InterestFormSubmission } from './types';

export type SubmitInterestResult =
  | { status: 'success'; submission: InterestFormSubmission }
  | { status: 'error'; fieldErrors: Record<string, string[] | undefined> };

export type InterestSink = (submission: InterestFormSubmission) => void | Promise<void>;

/**
 * No real persistence in this MVP pass — the default sink just logs, so a
 * real destination (email/CRM/DB) can be swapped in later without touching
 * call sites (this is a lead form, never a checkout).
 */
const defaultSink: InterestSink = (submission) => {
  console.info('[interesse] nieuwe aanmelding', submission);
};

export async function submitInterest(
  input: InterestFormInput,
  sink: InterestSink = defaultSink,
): Promise<SubmitInterestResult> {
  const parsed = interestFormSchema.safeParse(input);

  if (!parsed.success) {
    return { status: 'error', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const submission: InterestFormSubmission = {
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  };

  await sink(submission);

  return { status: 'success', submission };
}
