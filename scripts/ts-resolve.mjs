// Minimal resolve hook so Node's built-in TypeScript type stripping can run
// scripts that import from src/: maps the "@/" alias to src/ and resolves
// extensionless relative imports to .ts files. Avoids a tsx/ts-node dependency.
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const srcUrl = new URL('../src/', import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  let target = specifier;
  if (target.startsWith('@/')) {
    target = new URL(target.slice(2), srcUrl).href;
  }
  const isFileLike =
    target.startsWith('.') || target.startsWith('file:');
  if (isFileLike) {
    const base = context.parentURL ?? pathToFileURL(process.cwd() + '/').href;
    const url = new URL(target, base);
    const path = fileURLToPath(url);
    if (!existsSync(path) || statSync(path).isDirectory()) {
      for (const candidate of [`${url.href}.ts`, `${url.href}/index.ts`]) {
        if (existsSync(fileURLToPath(candidate))) {
          return nextResolve(candidate, context);
        }
      }
    }
    return nextResolve(url.href, context);
  }
  return nextResolve(specifier, context);
}
