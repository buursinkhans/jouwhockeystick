import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { routeStepRange } from '@/content/stickwijzer/progress';
import { ClosingCta } from './ClosingCta';

describe('ClosingCta', () => {
  it('ends the homepage with one link to the stickwijzer and the real step count', () => {
    const html = renderToStaticMarkup(createElement(ClosingCta));
    expect(html.match(/href="\/stickwijzer"/g)).toHaveLength(1);
    expect(html).toContain(routeStepRange());
    expect(html).toContain('Geen account en geen e-mailadres');
  });
});
