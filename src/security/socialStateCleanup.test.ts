import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { check } from '../../.github/scripts/social-state-check.mjs';

const workflow = readFileSync('.github/workflows/social-state-opschonen.yml', 'utf8');

describe('social-state-opschonen.yml (decision log 2026-11-15)', () => {
  it('only runs by hand, after the word OPSCHONEN, with only the rights it needs', () => {
    expect(workflow).toMatch(/on:\s*\n\s*workflow_dispatch:/);
    expect(workflow).not.toMatch(/^\s*(schedule|push|pull_request):/m);
    expect(workflow).toContain('if [ "$BEVESTIG" != "OPSCHONEN" ]');
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: write\s*\n\s*actions: write\s*\n\s*\n/);
  });

  it('force-pushes only refs/heads/social-state, with a lease, keeping the same files', () => {
    const pushes = workflow.split('\n').filter((line) => /git push/.test(line));
    expect(pushes).toHaveLength(1);
    expect(pushes[0]).toContain('--force-with-lease="$TARGET:$old"');
    expect(pushes[0]).toContain('"$new:$TARGET"');
    expect(workflow).toContain('TARGET: refs/heads/social-state');
    expect(workflow).not.toMatch(/refs\/heads\/main|origin main/);
    expect(workflow).toContain('git commit-tree "$tree"');
  });

  it('pauses both writers and always turns them back on, then turns itself off', () => {
    expect(workflow).toContain('WRITERS: dagcijfers.yml social-state.yml');
    expect(workflow).toMatch(/- name: Schrijvers weer aanzetten\s*\n\s*if: always\(\)/);
    expect(workflow).toMatch(/if: success\(\)[\s\S]*gh workflow disable social-state-opschonen\.yml/);
    expect(workflow).toContain('group: social-state');
  });

  it('refuses when a figure on the branch is still readable', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ssc-'));
    const sealed = { versie: 1, alg: 'PBKDF2-SHA256/AES-256-GCM', iter: 600000, salt: 'x', iv: 'y', data: 'z', gemaakt: '2026-11-15' };
    writeFileSync(join(dir, 'dagcijfers.json'), JSON.stringify({ versie: 3, gemaakt: 'x', dag: '2026-11-14', bronnen: {}, opvallend: {}, versleuteld: sealed }));
    writeFileSync(join(dir, 'verkoop.json'), JSON.stringify(sealed));
    expect(check(dir)).toEqual([]);
    writeFileSync(join(dir, 'verkoop.json'), JSON.stringify({ partners: [] }));
    expect(check(dir)).toEqual(['verkoop.json: niet versleuteld']);
    writeFileSync(join(dir, 'verkoop.json'), JSON.stringify(sealed));
    writeFileSync(join(dir, 'dagcijfers.json'), JSON.stringify({ versie: 2, posthog: { ok: true } }));
    expect(check(dir)).toEqual(['dagcijfers.json: versie is 2, verwacht 3', 'dagcijfers.json: geen versleuteld deel', 'dagcijfers.json: leesbaar veld "posthog"']);
  });
});
