import { describe, expect, it } from 'vitest';
import { getCautions } from './cautions';
import { buildProduct, buildProfile } from './testFixtures';

describe('getCautions', () => {
  it('warns about high carbon for a player with no stick experience yet', () => {
    const product = buildProduct({
      carbonPercentage: { value: 60, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const profile = buildProfile({ currentStickExperience: 'nog-geen-stick' });
    expect(getCautions(product, profile)).toContain('HIGH_CARBON_FOR_BEGINNER');
  });

  it('warns about high carbon for a young player', () => {
    const product = buildProduct({
      carbonPercentage: { value: 45, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const profile = buildProfile({ buyerType: 'kind', age: 9 });
    expect(getCautions(product, profile)).toContain('HIGH_CARBON_FOR_YOUNG_PLAYER');
  });

  it('warns about an experience gap when an advanced stick is scored for a beginner', () => {
    const product = buildProduct({
      experienceLevel: { value: 'ervaren', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const profile = buildProfile({ experienceLevel: 'beginner' });
    expect(getCautions(product, profile)).toContain('EXPERIENCE_GAP');
  });

  it('returns no cautions for a well-matched, low-carbon product', () => {
    const product = buildProduct({
      carbonPercentage: { value: 10, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      experienceLevel: { value: 'beginner', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const profile = buildProfile({
      currentStickExperience: 'ruime-ervaring',
      experienceLevel: 'beginner',
      age: null,
    });
    expect(getCautions(product, profile)).toEqual([]);
  });

  it('does not warn about young-player carbon when no age is known', () => {
    const product = buildProduct({
      carbonPercentage: { value: 60, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const profile = buildProfile({ age: null, currentStickExperience: 'ruime-ervaring' });
    expect(getCautions(product, profile)).not.toContain('HIGH_CARBON_FOR_YOUNG_PLAYER');
  });

  it('never crashes and never raises a carbon-related caution when carbon is unknown', () => {
    const product = buildProduct({ carbonPercentage: undefined });
    const profile = buildProfile({ currentStickExperience: 'nog-geen-stick', buyerType: 'kind', age: 8 });
    const cautions = getCautions(product, profile);
    expect(cautions).not.toContain('HIGH_CARBON_FOR_BEGINNER');
    expect(cautions).not.toContain('HIGH_CARBON_FOR_YOUNG_PLAYER');
  });
});
