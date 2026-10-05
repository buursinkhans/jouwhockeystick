import type { InterestFormSubmission } from './types';

/**
 * Netlify Forms delivers each submission by e-mail (configured as a form
 * notification in the Netlify dashboard). Netlify only detects a form that
 * exists as static HTML at build time, and with the Next.js runtime the
 * POST has to target that static file — hence public/__forms.html, whose
 * field names must stay in sync with the ones encoded here.
 */
export const NETLIFY_FORM_NAME = 'interesse';
export const NETLIFY_FORM_PATH = '/__forms.html';

export function encodeInterestForNetlify(
  submission: InterestFormSubmission,
): URLSearchParams {
  const body = new URLSearchParams({
    'form-name': NETLIFY_FORM_NAME,
    source: submission.source,
    consentGiven: submission.consentGiven ? 'ja' : 'nee',
    submittedAt: submission.submittedAt,
  });
  for (const field of [
    'name',
    'email',
    'phone',
    'productSlug',
    'message',
  ] as const) {
    const value = submission[field];
    if (value) {
      body.set(field, value);
    }
  }
  return body;
}

/** Posts a validated submission to Netlify Forms. Returns false when Netlify did not accept it. */
export async function sendInterestToNetlify(
  submission: InterestFormSubmission,
): Promise<boolean> {
  try {
    const response = await fetch(NETLIFY_FORM_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeInterestForNetlify(submission).toString(),
    });
    return response.ok;
  } catch {
    return false;
  }
}
