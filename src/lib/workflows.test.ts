import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// Already in node_modules through ESLint; used here only to read the workflow files.
import { load } from 'js-yaml';

/**
 * Every GitHub workflow must be valid YAML with at least one job. A broken
 * file is refused by GitHub without any run, so the weekly sync silently
 * stopped for a day (decision log 2026-11-04); this test catches it in CI.
 */
const DIR = '.github/workflows';
const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f));

describe('GitHub workflows', () => {
  it.each(files)('%s is valid YAML with jobs and steps', (file) => {
    const doc = load(readFileSync(`${DIR}/${file}`, 'utf8')) as { jobs?: Record<string, { steps?: unknown[]; uses?: string }> };
    expect(doc?.jobs, file).toBeTypeOf('object');
    for (const [name, job] of Object.entries(doc.jobs ?? {})) {
      expect(Array.isArray(job.steps) || typeof job.uses === 'string', `${file}: ${name}`).toBe(true);
    }
  });

  it('runs the Daka step after HockeyCity in the weekly sync, and lets its shoe file into the PR', () => {
    const text = readFileSync(`${DIR}/passa-sync.yml`, 'utf8');
    expect(text.indexOf('daka:feed')).toBeGreaterThan(text.indexOf('hockeycity:feed'));
    expect(text.match(/src\/catalog\/shoes\/importedDaka\.ts/g)?.length).toBe(3);
  });
});
