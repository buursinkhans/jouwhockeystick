'use client';

import { useState, type FormEvent } from 'react';
import { submitInterestAction } from '@/app/interesse/actions';
import type { InterestSource } from '@/interest/types';
import { trackEvent } from '@/lib/analytics/track';
import { Button } from '@/components/ui/Button';

type Props = {
  initialProductSlug?: string;
  source: InterestSource;
};

export function InterestForm({ initialProductSlug, source }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    const result = await submitInterestAction({
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      productSlug: initialProductSlug,
      message: message || undefined,
      consentGiven,
      source,
    });

    if (result.status === 'success') {
      setStatus('success');
      setFieldErrors({});
      trackEvent({
        name: 'interest_submit',
        source,
        hasProductSlug: Boolean(initialProductSlug),
      });
    } else {
      setStatus('error');
      setFieldErrors(result.fieldErrors);
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-900">
        Bedankt voor je interesse! We nemen zo snel mogelijk contact met je op.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Naam (optioneel)
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mailadres
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-700">
            {fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Telefoonnummer (optioneel als je een e-mailadres invult)
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Bericht (optioneel)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="consent"
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          aria-describedby={fieldErrors.consentGiven ? 'consent-error' : undefined}
          className="mt-1"
        />
        <label htmlFor="consent" className="text-sm text-zinc-700">
          Ik geef toestemming om benaderd te worden over mijn aanvraag.
        </label>
      </div>
      {fieldErrors.consentGiven && (
        <p id="consent-error" className="text-sm text-red-700">
          {fieldErrors.consentGiven[0]}
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Versturen…' : 'Verstuur interesse'}
      </Button>
    </form>
  );
}
