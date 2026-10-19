import { describe, expect, it } from 'vitest';
import { adviceAnswersSchema } from '@/advice-engine/answers';
import { buildDevelopAnswers } from '@/advice-engine/testFixtures';
import { changesSinceShared, readShare, shareHref } from './shareAdvice';

describe('share link', () => {
  it('round-trips the answers and the advised sticks through the link', () => {
    const answers = buildDevelopAnswers({ height_cm: 152 });
    const href = shareHref(answers, [
      'grays-jb6-composite',
      'brabo-tribute-30',
    ]);
    expect(href.startsWith('/stickwijzer/advies?a=')).toBe(true);
    const params = Object.fromEntries(
      new URL(href, 'https://x.nl').searchParams,
    );
    const shared = readShare(params);
    expect(shared?.slugs).toEqual(['grays-jb6-composite', 'brabo-tribute-30']);
    expect(adviceAnswersSchema.safeParse(shared?.answers).success).toBe(true);
    expect(shared?.answers).toEqual(answers);
  });

  it('holds no name or contact details, only stickwijzer answers', () => {
    const href = shareHref(buildDevelopAnswers(), []);
    expect(href).not.toMatch(/@|email|naam/i);
  });

  it('rejects broken or oversized links instead of crashing', () => {
    expect(readShare({})).toBeNull();
    expect(readShare({ a: '%%%' })).toBeNull();
    expect(readShare({ a: 'x'.repeat(5000) })).toBeNull();
    expect(readShare({ a: btoa('not json') })).toBeNull();
  });

  it('ignores odd stick ids', () => {
    const a =
      new URL(shareHref({}, []), 'https://x.nl').searchParams.get('a') ?? '';
    expect(readShare({ a, s: 'ok-slug,<script>,../x' })?.slugs).toEqual([
      'ok-slug',
    ]);
  });
});

describe('changesSinceShared', () => {
  it('names sticks that dropped out, and whether they are still sold', () => {
    const lookup = (slug: string) =>
      slug === 'b' ? { name: 'Stick B' } : undefined;
    expect(changesSinceShared(['a', 'b', 'c'], ['c', 'd'], lookup)).toEqual([
      { slug: 'a', name: null, available: false },
      { slug: 'b', name: 'Stick B', available: true },
    ]);
  });
});
