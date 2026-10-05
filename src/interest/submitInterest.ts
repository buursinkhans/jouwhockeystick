import {
  interestFormSchema,
  type InterestFormInput,
  type InterestFormSubmission,
} from './types';

export type SubmitInterestResult =
  | { status: 'success'; submission: InterestFormSubmission }
  | { status: 'error'; fieldErrors: Record<string, string[] | undefined> };

export type InterestSink = (
  submission: InterestFormSubmission,
) => void | Promise<void>;

/**
 * This step only validates. Delivery happens from the browser through
 * Netlify Forms (see netlifyForm.ts), so the default sink does nothing —
 * and in particular never writes a visitor's contact details to a log.
 */
const defaultSink: InterestSink = () => {};

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
