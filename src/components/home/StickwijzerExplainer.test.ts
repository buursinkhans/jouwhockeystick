import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { routeStepRange } from '@/content/stickwijzer/progress';
import { StickwijzerExplainer } from './StickwijzerExplainer';

const html = renderToStaticMarkup(createElement(StickwijzerExplainer, { productCount: 540 }));

describe('StickwijzerExplainer', () => {
  it('explains the stickwijzer in one section of three steps, with the routes as one line', () => {
    expect(html).toContain('Van een paar antwoorden naar maximaal drie sticks');
    expect(html).toContain(routeStepRange());
    expect(html).toContain('Drie routes:');
    expect(html).not.toContain('Een eerste stick vraagt iets anders');
  });

  it('has no broken characters from a wrong file encoding', () => {
    expect(html).toContain('vóór');
    expect(html).not.toMatch(/Ã|Â|â€/);
  });
});
