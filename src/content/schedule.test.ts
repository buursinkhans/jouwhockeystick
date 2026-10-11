import { describe, expect, it } from 'vitest';
import {
  dueItems,
  formatDutchDate,
  isPublished,
  showsScheduledContent,
  todayInSiteTimeZone,
  visibleItems,
} from './schedule';

const items = [
  { slug: 'live', publishedAt: '2026-10-01' },
  { slug: 'today', publishedAt: '2026-11-15' },
  { slug: 'later', publishedAt: '2026-12-01' },
];

describe('todayInSiteTimeZone', () => {
  it('uses Dutch time, not UTC', () => {
    // 23:30 UTC on 14 Nov is already 15 Nov in Amsterdam (UTC+1 in winter).
    expect(todayInSiteTimeZone(new Date('2026-11-14T23:30:00Z'))).toBe('2026-11-15');
    expect(todayInSiteTimeZone(new Date('2026-11-14T22:30:00Z'))).toBe('2026-11-14');
  });
});

describe('visibleItems', () => {
  it('hides scheduled items on the live site and shows them on previews', () => {
    expect(visibleItems(items, { today: '2026-11-15', includeScheduled: false }).map((i) => i.slug)).toEqual([
      'live',
      'today',
    ]);
    expect(visibleItems(items, { today: '2026-11-15', includeScheduled: true })).toHaveLength(3);
  });

  it('treats the publication date itself as live', () => {
    expect(isPublished({ publishedAt: '2026-11-15' }, '2026-11-15')).toBe(true);
    expect(isPublished({ publishedAt: '2026-11-16' }, '2026-11-15')).toBe(false);
  });
});

describe('showsScheduledContent', () => {
  it('is true on previews and in development only', () => {
    expect(showsScheduledContent({ CONTEXT: 'deploy-preview', NODE_ENV: 'production' })).toBe(true);
    expect(showsScheduledContent({ CONTEXT: 'production', NODE_ENV: 'production' })).toBe(false);
    expect(showsScheduledContent({ NODE_ENV: 'development' })).toBe(true);
  });
});

describe('dueItems', () => {
  it('finds what went live since the last build, including missed days', () => {
    expect(dueItems(items, '2026-11-14', '2026-11-15').map((i) => i.slug)).toEqual(['today']);
    expect(dueItems(items, '2026-11-10', '2026-12-02').map((i) => i.slug)).toEqual(['today', 'later']);
    expect(dueItems(items, '2026-11-15', '2026-11-15')).toEqual([]);
  });
});

describe('formatDutchDate', () => {
  it('writes the date in Dutch', () => {
    expect(formatDutchDate('2026-11-15')).toBe('15 november 2026');
  });
});

