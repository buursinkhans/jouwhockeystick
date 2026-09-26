import { describe, expect, it, vi } from 'vitest';
import { submitInterest } from './submitInterest';

const validInput = {
  name: 'Jan Jansen',
  email: 'jan@example.test',
  consentGiven: true,
  source: 'algemeen' as const,
};

describe('submitInterest', () => {
  it('accepts a submission with email and consent, and calls the sink', async () => {
    const sink = vi.fn();
    const result = await submitInterest(validInput, sink);
    expect(result.status).toBe('success');
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it('accepts a submission with only a phone number (no email)', async () => {
    const result = await submitInterest(
      { phone: '0612345678', consentGiven: true, source: 'algemeen' },
      vi.fn(),
    );
    expect(result.status).toBe('success');
  });

  it('rejects when neither email nor phone is provided', async () => {
    const result = await submitInterest({ consentGiven: true, source: 'algemeen' }, vi.fn());
    expect(result.status).toBe('error');
  });

  it('rejects when consent is not given', async () => {
    const result = await submitInterest({ ...validInput, consentGiven: false }, vi.fn());
    expect(result.status).toBe('error');
  });

  it('never calls the sink when validation fails', async () => {
    const sink = vi.fn();
    await submitInterest({ consentGiven: false, source: 'algemeen' }, sink);
    expect(sink).not.toHaveBeenCalled();
  });
});
