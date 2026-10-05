import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NETLIFY_FORM_NAME, encodeInterestForNetlify } from './netlifyForm';
import type { InterestFormSubmission } from './types';

const submission: InterestFormSubmission = {
  name: 'Jan Jansen',
  email: 'jan@example.test',
  productSlug: 'grays-jb6-composite',
  message: 'Is deze er ook in 37,5 inch?',
  consentGiven: true,
  source: 'productpagina',
  submittedAt: '2026-10-02T10:00:00.000Z',
};

describe('encodeInterestForNetlify', () => {
  it('encodes the form name and every filled-in field', () => {
    const body = encodeInterestForNetlify(submission);

    expect(Object.fromEntries(body)).toEqual({
      'form-name': 'interesse',
      name: 'Jan Jansen',
      email: 'jan@example.test',
      productSlug: 'grays-jb6-composite',
      message: 'Is deze er ook in 37,5 inch?',
      consentGiven: 'ja',
      source: 'productpagina',
      submittedAt: '2026-10-02T10:00:00.000Z',
    });
  });

  it('leaves out fields that were not filled in', () => {
    const body = encodeInterestForNetlify({
      phone: '0612345678',
      consentGiven: true,
      source: 'algemeen',
      submittedAt: '2026-10-02T10:00:00.000Z',
    });

    expect(body.has('email')).toBe(false);
    expect(body.get('phone')).toBe('0612345678');
  });

  it('only sends fields the static Netlify form declares', () => {
    const staticForm = readFileSync('public/__forms.html', 'utf8');
    const declared = [...staticForm.matchAll(/name="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(declared).toContain(NETLIFY_FORM_NAME);
    for (const field of encodeInterestForNetlify(submission).keys()) {
      expect(declared).toContain(field);
    }
  });
});
