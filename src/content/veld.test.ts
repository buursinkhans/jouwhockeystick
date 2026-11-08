import { describe, expect, it } from 'vitest';
import { getAllProducts, getFieldProducts } from '@/catalog';
import { pickVaried } from '@/catalog/picks';
import { plainText } from '@/components/article/inlineMarkup';
import { VELD, veldFaq } from './veld';

const now = new Date('2026-10-23');

describe('/sticks landing copy', () => {
  it('names the veldhockeystick within the first 80 words', () => {
    const first80 = plainText(VELD.intro).split(/\s+/).slice(0, 80).join(' ');
    expect(first80.toLowerCase()).toContain('veldhockeystick');
  });

  it('does not make "kiezen" or "kopen" its main term (that is the blog)', () => {
    expect(VELD.seoTitle.toLowerCase()).not.toMatch(/kiezen|kopen/);
    expect(VELD.title.toLowerCase()).not.toMatch(/kiezen|kopen/);
  });

  it('has five FAQ answers with numbers from the catalog', () => {
    const faq = veldFaq(getFieldProducts(now, { includeImported: true }));
    expect(faq).toHaveLength(5);
    expect(faq.map((item) => item.answer).join(' ')).not.toContain('undefined');
  });
});

describe('Veldsticks per niveau', () => {
  const curated = getFieldProducts(now);

  it('only shows available curated sticks, one per brand', () => {
    const imported = new Set(
      getAllProducts(now, { includeImported: true })
        .filter((p) => p.feedImport)
        .map((p) => p.slug),
    );
    for (const { level } of VELD.levels.groups) {
      const picks = pickVaried(
        curated.filter((p) => p.experienceLevel.value === level),
      );
      expect(picks.length).toBeGreaterThan(0);
      expect(picks.length).toBeLessThanOrEqual(3);
      expect(new Set(picks.map((p) => p.brand)).size).toBe(picks.length);
      for (const pick of picks) {
        expect(pick.stock.value).not.toBe('unavailable');
        expect(imported.has(pick.slug)).toBe(false);
        expect(pick.experienceLevel.value).toBe(level);
      }
    }
  });
});
