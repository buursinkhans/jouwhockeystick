#!/usr/bin/env bash
# Moves the work of a catalog agent from its job (which holds the Claude
# token, but runs no code) to the check job and the PR job (which run code,
# but hold no Claude token). See docs/beveiliging.md, "Agents en tekst van buiten".
#
# The agent can write any file in the checkout, .git included. So after the
# agent, nothing here runs git in that checkout: the changes travel as a tar
# of one folder, and unpack accepts only plain files and folders inside it.
#
#   agent-bundle.sh snapshot <dir>                      before the agent: a clean copy of HEAD
#   agent-bundle.sh pack <scope> <snapshot> <out.tgz> <notes.md>
#   agent-bundle.sh unpack <scope> <in.tgz>             replaces <scope> with the bundle
set -euo pipefail

cmd=${1:-}
shift || true

case "$cmd" in
  snapshot)
    dir=$1
    mkdir -p "$dir"
    git archive HEAD | tar -x -C "$dir"
    ;;

  pack)
    scope=$1 snapshot=$2 out=$3 notes=$4
    : > "$notes"
    # Changes outside the scope are not taken along; name them in the PR.
    other=$(diff -rq --exclude=.git --exclude=node_modules --exclude=.next . "$snapshot" 2>/dev/null \
      | sed -E 's/^Files \.\/([^ ]+) and .* differ$/\1/; s/^Only in \.\/?([^:]*): (.*)$/\1\/\2/; s/^Only in .*//' \
      | sed -E 's#^/##' | grep -v "^$scope/" | grep -v '^$' || true)
    if [ -n "$other" ]; then
      {
        echo "De agent wijzigde ook bestanden buiten \`$scope/\`. Die zijn niet meegenomen:"
        echo "$other" | sed 's/^/- `/; s/$/`/'
      } >> "$notes"
    fi
    tar -czf "$out" "$scope"
    ;;

  unpack)
    scope=$1 in=$2
    # Only plain files and folders, only inside the scope, no "..".
    # Read the listing first: grep -q stops early, and with pipefail the
    # SIGPIPE of tar would turn a hit into a miss.
    listing=$(tar -tvzf "$in")
    if printf '%s
' "$listing" | grep -vE '^[-d]' | grep -q .; then
      echo "::error::Bundel bevat iets anders dan gewone bestanden en mappen (bijvoorbeeld een link); geweigerd." >&2
      exit 1
    fi
    while IFS= read -r name; do
      case "$name" in
        "$scope"/*|"$scope") ;;
        *) echo "::error::Bundel bevat een pad buiten $scope: $name" >&2; exit 1 ;;
      esac
      case "/$name/" in
        */../*) echo "::error::Bundel bevat '..': $name" >&2; exit 1 ;;
      esac
    done <<< "$(tar -tzf "$in")"
    rm -rf "$scope"
    tar -xzf "$in" --no-same-owner --no-same-permissions
    ;;

  *)
    echo "Gebruik: agent-bundle.sh snapshot|pack|unpack ..." >&2
    exit 2
    ;;
esac
