import { describe, expect, it } from 'vitest';
import { normalizeProfile } from './normalizeProfile';
import type { QuizAnswers } from './types';

function baseAnswers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    buyerType: 'zelf',
    playerHeightCm: 175,
    experienceLevel: 'beginner',
    currentStickExperience: 'nog-geen-stick',
    position: 'middenvelder',
    desiredPlayActions: ['dribbelen'],
    comfortPreference: 'geen-voorkeur',
    budgetMaxEur: 150,
    ...overrides,
  };
}

describe('normalizeProfile', () => {
  it('maps player height to a plausible stick length range', () => {
    const profile = normalizeProfile(baseAnswers({ playerHeightCm: 175 }));
    expect(profile.lengthRangeInches).toEqual([35, 36.5]);
  });

  it('prefers a late-bow when shot is a desired play action', () => {
    const profile = normalizeProfile(baseAnswers({ desiredPlayActions: ['shot'], experienceLevel: 'ervaren' }));
    expect(profile.preferredBowProfile).toBe('late-bow');
  });

  it('prefers a low-bow for beginners without a shot preference', () => {
    const profile = normalizeProfile(baseAnswers({ desiredPlayActions: ['passen'], experienceLevel: 'beginner' }));
    expect(profile.preferredBowProfile).toBe('low-bow');
  });

  it('carries buyerType and age through to the profile', () => {
    const profile = normalizeProfile(baseAnswers({ buyerType: 'kind', age: 9 }));
    expect(profile.buyerType).toBe('kind');
    expect(profile.age).toBe(9);
  });

  it('normalizes a missing age to null', () => {
    const profile = normalizeProfile(baseAnswers({ buyerType: 'zelf' }));
    expect(profile.age).toBeNull();
  });
});
