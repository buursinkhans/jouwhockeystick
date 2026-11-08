#!/usr/bin/env bash
# Netlify "ignore" command (netlify.toml): skip a build when a push only
# touched files that do not end up on the site. Exit 0 = skip the build,
# exit 1 = build. When in doubt: build. See docs/decision-log.md, 2026-11-08,
# and https://docs.netlify.com/build/configure-builds/ignore-builds/.
set -u

build() { echo "netlify-ignore: bouwen ($1)"; exit 1; }
skip() { echo "netlify-ignore: overslaan ($1)"; exit 0; }

# A build hook (scheduled publishing) builds the same commit and must never
# be skipped. Netlify already ignores this command for hook builds; this is
# a second safeguard.
if [ -n "${INCOMING_HOOK_TITLE:-}" ] || [ -n "${INCOMING_HOOK_URL:-}" ]; then
  build "build hook"
fi

# Daily publishing (decision log 2026-11-08): with DAILY_BUILD_ONLY=1 set in
# Netlify, a push to main no longer builds production; the workflow
# "Geplande publicatie" builds once a day through the build hook (above).
# Deploy previews and branch deploys are not affected.
if [ "${DAILY_BUILD_ONLY:-}" = "1" ] && [ "${CONTEXT:-}" = "production" ]; then
  skip "productie bouwt dagelijks via de build hook (DAILY_BUILD_ONLY)"
fi

base="${CACHED_COMMIT_REF:-}"
head="${COMMIT_REF:-}"
# First build, no cache, or a manual redeploy of the same commit: build.
if [ -z "$base" ] || [ -z "$head" ] || [ "$base" = "$head" ]; then
  build "geen vorige build om mee te vergelijken"
fi

# A shallow clone or an unknown commit makes git diff fail: build. No rename
# detection: a file moved from src/ to docs/ also lists its old path.
if ! changed=$(git diff --name-only --no-renames "$base" "$head" 2>/dev/null); then
  build "git diff mislukt"
fi
if [ -z "$changed" ]; then
  build "geen gewijzigde bestanden gevonden"
fi

while IFS= read -r file; do
  case "$file" in
    docs/* | .github/* | video/* | assets/video/* | README.md | AGENTS.md | CLAUDE.md | *.test.ts | *.test.tsx) ;;
    *) build "$file raakt de site" ;;
  esac
done <<< "$changed"

skip "alleen docs, workflows, video of tests gewijzigd"
