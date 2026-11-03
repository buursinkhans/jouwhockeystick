import { describe, expect, it } from 'vitest';
import { nextOpenQuestion } from './flow';
import { SCREENS } from './questions';

const ageScreen = SCREENS.ONTWIKKEL.find((screen) => screen.id === 'age_experience')!;
const stickScreen = SCREENS.ONTWIKKEL.find((screen) => screen.questions.includes('has_current_stick'))!;

describe('nextOpenQuestion', () => {
  it('points to the next open required question on the screen', () => {
    expect(nextOpenQuestion(ageScreen, { age_band: '13_15' }, 'age_band')).toBe('experience_seasons');
  });

  it('skips questions that are already answered', () => {
    expect(nextOpenQuestion(ageScreen, { age_band: '13_15', height_cm: 150 }, 'age_band')).toBe('experience_seasons');
    expect(
      nextOpenQuestion(ageScreen, { age_band: '13_15', experience_seasons: '2_3', height_cm: 150 }, 'experience_seasons'),
    ).toBeUndefined();
  });

  it('includes a follow-up question the answer just opened, and not one it keeps hidden', () => {
    expect(nextOpenQuestion(stickScreen, { has_current_stick: 'yes' }, 'has_current_stick')).toBe(
      stickScreen.questions.find((id) => id !== 'has_current_stick'),
    );
    const hiddenAfterNo = nextOpenQuestion(stickScreen, { has_current_stick: 'no' }, 'has_current_stick');
    expect(hiddenAfterNo === undefined || !['current_stick_brand'].includes(hiddenAfterNo)).toBe(true);
  });

  it('never points to an optional question', () => {
    for (const screens of Object.values(SCREENS)) {
      for (const screen of screens) {
        for (const id of screen.questions) {
          const next = nextOpenQuestion(screen, {}, id);
          if (next) expect(screen.optional ?? []).not.toContain(next);
        }
      }
    }
  });
});
