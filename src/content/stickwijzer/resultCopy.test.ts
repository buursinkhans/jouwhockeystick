import { describe, expect, it } from 'vitest';
import type { ResultRole } from '@/advice-engine/types';
import { BEST_MATCH_LEAD, ROLE_LABELS, roleLabel, roleLead } from './resultCopy';

const ROLES = Object.keys(ROLE_LABELS) as ResultRole[];

describe('role labels', () => {
  it('has no label that claims "beste"', () => {
    for (const label of Object.values(ROLE_LABELS)) expect(label.toLowerCase()).not.toContain('beste');
  });

  it('gives "Onze keuze" only to best_match; closest_option keeps its own label', () => {
    expect(ROLES.filter((r) => ROLE_LABELS[r] === 'Onze keuze')).toEqual(['best_match']);
    expect(roleLabel('best_match', 'ONTWIKKEL')).toBe('Onze keuze');
    expect(ROLE_LABELS.closest_option).toBe('Dichtstbijzijnde optie');
  });
});

describe('opening sentence of the result', () => {
  it('comes only with best_match', () => {
    expect(roleLead('best_match')).toBe(BEST_MATCH_LEAD);
    expect(BEST_MATCH_LEAD).toBe('Op basis van jouw antwoorden zouden wij kiezen voor deze stick.');
    for (const role of ROLES.filter((r) => r !== 'best_match')) expect(roleLead(role)).toBeNull();
  });
});
