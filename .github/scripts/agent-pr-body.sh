#!/usr/bin/env bash
# Builds the body of a catalog agent's PR from its bundle (docs/beveiliging.md):
# a warning on top when a check failed, the agent's own text (pr.md without its
# title line), files it changed outside its folder, the check results and a footer.
#   agent-pr-body.sh <bundle dir> <footer>
set -euo pipefail

dir=$1
footer=$2
checks="$dir/controles.md"

{
  if [ -f "$checks" ] && grep -q '^ok=false' "$checks"; then
    printf '%s\n' '> [!WARNING]'
    printf '%s\n\n' '> **Controles mislukt.** Lint, typecheck, tests of catalog:health gaven een fout (zie *Controles* onderaan). Deze PR staat daarom als concept. Vraag Claude om de fout op te lossen, of sluit de PR.'
  fi
  tail -n +2 "$dir/pr.md"
  if [ -s "$dir/buiten.md" ]; then
    printf '\n\n'
    cat "$dir/buiten.md"
  fi
  if [ -f "$checks" ]; then
    printf '\n\n### Controles\n\n'
    tail -n +2 "$checks"
  fi
  printf '\n\n%s\n' "$footer"
} | sed 's/@claude/claude/g'
