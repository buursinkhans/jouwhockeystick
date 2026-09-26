'use server';

import { submitInterest, type SubmitInterestResult } from '@/interest/submitInterest';
import type { InterestFormInput } from '@/interest/types';

export async function submitInterestAction(input: InterestFormInput): Promise<SubmitInterestResult> {
  return submitInterest(input);
}
