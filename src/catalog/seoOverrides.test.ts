import { describe, expect, it } from 'vitest';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { productPageMetadata } from '@/components/catalog/ProductDetail';
import { getProductBySlug, isFeedImport } from './index';
import { getProductFamily } from './family';
import { getAllProducts } from './index';
import { productMetaDescription } from './metaDescription';
import { STICK_SEO_OVERRIDES } from './seoOverrides';

const CLAIM_WORDS = /\b(beste|goedkoopst\w*|scherpste|korting|onafhankelijk|objectief)\b/i;

describe('STICK_SEO_OVERRIDES (wave 0)', () => {
  const entries = Object.entries(STICK_SEO_OVERRIDES);

  it.each(entries)('%s: is a hand-checked stick that is indexed', (slug) => {
    const product = getProductBySlug(slug);
    expect(product).toBeDefined();
    expect(isFeedImport(product!)).toBe(false);
  });

  it.each(entries)('%s: title and description fit and make no claim', (slug, override) => {
    const product = getProductBySlug(slug)!;
    expect(override.title.length).toBeLessThanOrEqual(60);
    const description = productMetaDescription(product);
    expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(description).toContain(override.closing);
    expect(`${override.title} ${description}`).not.toMatch(CLAIM_WORDS);
    expect(`${override.title} ${description}`).not.toMatch(/[!—–]/);
  });

  it('the JB10 text promises only what the page shows: the Jumbow table with JB 6, 8 and 12+', () => {
    const jb10 = getProductBySlug('grays-jb10-composite')!;
    const family = getProductFamily(jb10, getAllProducts(new Date()));
    const names = family?.members.map((p) => p.name) ?? [];
    for (const model of ['JB 6', 'JB 8', 'JB 12+']) {
      expect(names.some((n) => n.includes(model)), model).toBe(true);
    }
    expect(STICK_SEO_OVERRIDES['grays-jb10-composite']?.closing).toMatch(/JB6, JB8 en JB12\+/);
  });

  it('the title of a stick page is the override, and every other stick keeps the built one', () => {
    const jb10 = getProductBySlug('grays-jb10-composite')!;
    const other = getProductBySlug('grays-jb8-composite')!;
    const abs = (m: ReturnType<typeof productPageMetadata>) =>
      typeof m.title === 'string' ? m.title : (m.title as { absolute?: string } | null | undefined)?.absolute;
    expect(abs(productPageMetadata(jb10))).toBe('Grays JB10 hockeystick: specs, prijs en verschil met JB8');
    expect(abs(productPageMetadata(other))).toBe(`${other.name}: specs en advies`);
  });
});
