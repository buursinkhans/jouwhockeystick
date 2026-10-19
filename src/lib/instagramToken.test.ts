import { describe, expect, it } from 'vitest';
import {
  cleanToken,
  describeToken,
  liveEnvValue,
  parseRefresh,
} from './instagramToken';

describe('liveEnvValue', () => {
  it('prefers the production value, then the shared one, never a preview', () => {
    expect(
      liveEnvValue([
        { context: 'deploy-preview', value: 'p' },
        { context: 'all', value: 'a' },
        { context: 'production', value: 'live' },
      ])?.value,
    ).toBe('live');
    expect(liveEnvValue([{ context: 'all', value: 'a' }])?.value).toBe('a');
    expect(liveEnvValue([{ context: 'branch-deploy', value: 'b' }])).toBeNull();
  });
});

describe('parseRefresh', () => {
  it('returns the new token and its lifetime in days', () => {
    expect(
      parseRefresh(200, {
        access_token: 'IGAA'.padEnd(40, 'x'),
        expires_in: 5_184_000,
      }),
    ).toEqual({ token: 'IGAA'.padEnd(40, 'x'), expiresInDays: 60 });
  });

  it('reports the error without leaking anything token-like', () => {
    const result = parseRefresh(400, {
      error: { message: 'Error validating access token' },
    });
    expect(result).toEqual({
      error: 'Instagram gaf HTTP 400: Error validating access token',
    });
  });
});

describe('cleanToken / describeToken', () => {
  it('strips whitespace and quotes pasted around a token', () => {
    expect(cleanToken('  "IGAAabc123"\n')).toBe('IGAAabc123');
  });

  it('describes a token without revealing any of it', () => {
    const token = 'IGAA' + 'x'.repeat(40);
    const text = describeToken(token);
    expect(text).toContain('44 tekens');
    expect(text).toContain('begint zoals een Instagram-token');
    expect(text).not.toContain('IGAA');
    expect(describeToken('********')).toContain('afgeschermd');
  });
});
