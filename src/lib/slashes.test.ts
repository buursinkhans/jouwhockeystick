import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { collapseSlashes } from './slashes';
import { proxy } from '@/proxy';

describe('collapseSlashes', () => {
  it('collapses repeated slashes at the start and in the middle', () => {
    expect(collapseSlashes('//stickwijzer')).toBe('/stickwijzer');
    expect(collapseSlashes('///zaalsticks')).toBe('/zaalsticks');
    expect(collapseSlashes('/kennis//hockeystick-lengte-tabel')).toBe(
      '/kennis/hockeystick-lengte-tabel',
    );
    expect(collapseSlashes('//sticks//grays-jb10-composite//')).toBe(
      '/sticks/grays-jb10-composite/',
    );
  });

  it('leaves a normal path alone', () => {
    expect(collapseSlashes('/stickwijzer')).toBeNull();
    expect(collapseSlashes('/')).toBeNull();
    expect(collapseSlashes('/_next/static/chunks/app.js')).toBeNull();
  });
});

describe('proxy', () => {
  const run = (url: string) => proxy(new NextRequest(url));

  it('redirects with 308 and keeps the query string', () => {
    const response = run(
      'https://jouwhockeystick.nl//sticks?brand=Grays&utm_source=instagram',
    );
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'https://jouwhockeystick.nl/sticks?brand=Grays&utm_source=instagram',
    );
  });

  it('lets a normal path through', () => {
    const response = run('https://jouwhockeystick.nl/stickwijzer');
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});
