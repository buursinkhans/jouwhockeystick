import { describe, expect, it } from 'vitest';
import { answersFromSearch } from './prefill';

describe('answersFromSearch', () => {
  it('chooses the quick advice and a child from the link', () => {
    expect(answersFromSearch('?snel')).toEqual({ route_self_select: 'quick' });
    expect(answersFromSearch('?snel&voor=kind')).toEqual({ route_self_select: 'quick', advice_goal: 'child' });
  });
  it('ignores anything else', () => {
    expect(answersFromSearch('')).toEqual({});
    expect(answersFromSearch('?voor=opa&lengte=150')).toEqual({});
  });
});
