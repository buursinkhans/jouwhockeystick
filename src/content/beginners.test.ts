import { describe, expect, it } from 'vitest';
import { getFieldProducts } from '@/catalog';
import { hockeystickKinderenEnBeginners as kids } from './articles/hockeystick-kinderen-en-beginners';
import { zaalstickVoorKinderen as zaalKids } from './articles/zaalstick-voor-kinderen';
import { hockeyschoenenKinderenMaat as shoesKids } from './articles/hockeyschoenen-kinderen-maat';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';

const text = (a: { sections: unknown }) => JSON.stringify(a.sections);
const headings = (a: { sections: { heading: string }[] }) => a.sections.map((s) => s.heading);

describe('beginners cluster sprint (2026-11-11)', () => {
  it('keeps the title, the intro and the existing headings of the kids and beginners article', () => {
    expect(kids.title).toBe('Hockeystick voor kinderen en beginners: waar let je op?');
    expect(kids.intro.startsWith('Een eerste stick hoeft niet ingewikkeld te zijn.')).toBe(true);
    for (const heading of [
      'Wat een eerste stick nodig heeft',
      'Welke maat hockeystick heeft je kind nodig?',
      'Waarom weinig carbon en een rustige kromming?',
      'Wat kost een eerste stick?',
      'Juniorsticks voor beginners in onze catalogus',
      'Begin je als volwassene?',
      'Een eerste stick kiezen in een paar minuten',
    ]) {
      expect(headings(kids)).toContain(heading);
    }
  });

  it('answers "welke merken" from the catalog: every brand with a beginner stick is named, none is called best', () => {
    expect(headings(kids)).toContain('Welke merken hebben sticks voor beginners?');
    const brands = new Set(getFieldProducts().filter((p) => p.experienceLevel.value === 'beginner').map((p) => p.brand));
    expect(brands.size).toBeGreaterThan(1);
    const section = kids.sections.find((s) => s.heading === 'Welke merken hebben sticks voor beginners?');
    const body = JSON.stringify(section?.body);
    for (const brand of brands) expect(body, brand).toContain(brand);
    expect(body).toContain(`${brands.size} merken`);
    expect(body).toContain('](/merken)');
    expect(body.toLowerCase()).not.toMatch(/beste merk|aanrader|\bbeste\b/);
  });

  it('shows real price ranges, not template text', () => {
    expect(text(kids)).not.toContain('${');
    expect(text(kids)).toMatch(/volwassenen tussen €\d+ en €\d+/);
  });

  it('sends parents and beginners to the quick advice, and keeps the plain stickwijzer link', () => {
    for (const article of [kids, zaalKids, shoesKids]) {
      expect(text(article), article.slug).toContain('](/stickwijzer?snel)');
      expect(text(article), article.slug).toContain('](/stickwijzer)');
    }
    expect(text(kids).split('](/stickwijzer?snel)').length - 1).toBeGreaterThanOrEqual(2);
  });

  it('words the stickwijzer as an advice, not a personal one, in the indoor kids article', () => {
    expect(text(zaalKids)).not.toMatch(/persoonlijk advies/i);
    expect(headings(zaalKids)).toContain('Snel een selectie of een advies voor het veld');
  });

  it('fits the meta description and mentions brands', () => {
    expect(kids.metaDescription.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(kids.metaDescription).toMatch(/merken/);
  });
});
