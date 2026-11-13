#!/usr/bin/env bash
# The quality checks after a catalog agent, in a job without secrets
# (docs/beveiliging.md). Runs every check, also after a failure, and writes
# <out.md>: first line "ok=true" or "ok=false", then one line per check and
# the tail of the output of each failed check. Always exits 0: a failed
# check gives a draft PR with a warning, not a lost week.
set -uo pipefail

out=$1
# --passa-import (catalog enricher): first take the enriched sticks out of the import.
import=${2:-}
log=$(mktemp)
fail=0
lines=""
details=""

check() {
  local name=$1
  shift
  if "$@" > "$log" 2>&1; then
    lines+="- ${name}: geslaagd"$'\n'
  else
    fail=1
    lines+="- ${name}: **mislukt**"$'\n'
    details+=$'\n'"<details><summary>${name}</summary>"$'\n\n```\n'"$(tail -n 40 "$log")"$'\n```\n</details>\n'
  fi
}

if [ "$import" = "--passa-import" ]; then
  # The feed is public; its report is not part of the PR.
  check "passa:import" npm run --silent passa:import -- "$(mktemp)"
fi
check "lint" npm run lint
check "next typegen" npx next typegen
check "typecheck" npm run typecheck
check "tests" npm test
check "catalog:health" npm run catalog:health

{
  if [ "$fail" -eq 0 ]; then echo "ok=true"; else echo "ok=false"; fi
  printf '%s' "$lines"
  printf '%s' "$details"
} > "$out"
cat "$out"
