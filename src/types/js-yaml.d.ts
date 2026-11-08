// js-yaml comes with ESLint; only `load` is used (src/lib/workflows.test.ts), so no @types package.
declare module 'js-yaml' {
  export function load(text: string): unknown;
}
