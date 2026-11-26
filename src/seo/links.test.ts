import { describe, expect, it } from 'vitest';
import { hasContentLink } from './links';

const page = (main: string) => `<header><a href="/kennis/gids">menu</a></header><main id="inhoud">${main}</main><footer></footer>`;

describe('hasContentLink', () => {
  it('ziet een link in de inhoud, ook met domein, anker of query', () => {
    expect(hasContentLink(page('<a href="/kennis/gids">x</a>'), '/kennis/gids')).toBe(true);
    expect(hasContentLink(page('<a href="https://jouwhockeystick.nl/kennis/gids#stap">x</a>'), '/kennis/gids')).toBe(true);
    expect(hasContentLink(page('<a href="/sticks?lengte=36.5">x</a>'), '/sticks')).toBe(true);
  });
  it('telt een link in het menu of naar een onderliggende pagina niet', () => {
    expect(hasContentLink(page('<p>geen link</p>'), '/kennis/gids')).toBe(false);
    expect(hasContentLink(page('<a href="/sticks/demo">x</a>'), '/sticks')).toBe(false);
  });
  it('weet het niet zonder <main>', () => {
    expect(hasContentLink('<p>foutpagina</p>', '/sticks')).toBeUndefined();
  });
});
