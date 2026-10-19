'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics/track';

/**
 * "Deel dit advies": the phone's share sheet (WhatsApp, Berichten, Mail …)
 * where available, otherwise the link is copied. No e-mail address or
 * account; the link itself holds the advice (src/lib/shareAdvice.ts).
 */
export function ShareAdviceButton({ href }: { href: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function share() {
    const url = new URL(href, window.location.origin).toString();
    const data = {
      title: 'Stickadvies van jouwhockeystick.nl',
      text: 'Dit stickadvies kreeg ik van de stickwijzer van jouwhockeystick.nl:',
      url,
    };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(data);
        trackEvent({ name: 'advice_shared', method: 'native' });
        return;
      } catch (error) {
        // Closing the share sheet is not an error worth reporting.
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      trackEvent({ name: 'advice_shared', method: 'copy' });
    } catch {
      setStatus('failed');
    }
  }

  return (
    <div className="rounded-2xl border border-rand bg-white p-4">
      <Button variant="secondary" onClick={share}>
        Deel dit advies
      </Button>
      <p className="mt-2 text-sm text-lijngrijs" role="status">
        {status === 'copied'
          ? 'Link gekopieerd. Plak hem in WhatsApp, een mail of een bericht.'
          : status === 'failed'
            ? 'Kopiëren lukte niet. Kopieer de link uit de adresbalk van deze pagina.'
            : 'Stuur het naar je partner, je kind of de trainer. Zonder account of e-mailadres.'}
      </p>
    </div>
  );
}
