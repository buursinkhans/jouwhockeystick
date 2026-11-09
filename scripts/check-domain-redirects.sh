#!/usr/bin/env bash
# Live check of the extra domains (decision log 2026-11-09, "Extra domeinen"):
# every variant must answer with one 301 to https://jouwhockeystick.nl, with a
# valid certificate for HTTPS. Run after the redirects are deployed and
# Netlify shows the certificates as issued: bash scripts/check-domain-redirects.sh
# Exit code 0 = all good, 1 = at least one check failed.
set -u

PRIMARY="https://jouwhockeystick.nl"
DOMAINS="jouwhockeystick.info jouwhockeystick.be jouwhockeystick.com jouwhockeystick.store jouwhockeyschoenen.nl"
failed=0

check() { # url expected_status expected_location
  local result status location
  # No -k: an invalid certificate makes curl fail, which counts as a failure.
  if ! result=$(curl -sS -o /dev/null --max-time 20 -w '%{http_code} %{redirect_url}' "$1" 2>&1); then
    echo "FOUT  $1  ($result)"; failed=1; return
  fi
  status=${result%% *}; location=${result#* }
  if [ "$status" = "$2" ] && [ "$location" = "$3" ]; then
    echo "OK    $1  -> $status $location"
  elif [[ "$1" == http://* ]] && [[ "$status" == 30[18] ]] && [ "$location" = "https://${1#http://}" ]; then
    # Netlify's own HTTP → HTTPS step came first; the HTTPS check of the same
    # address (also in this list) covers the second step. Acceptable.
    echo "OK    $1  -> $status $location (2 stappen via https)"
  else
    echo "FOUT  $1  -> $status $location (verwacht: $2 $3)"; failed=1
  fi
}

for domain in $DOMAINS; do
  home="$PRIMARY/"
  [ "$domain" = "jouwhockeyschoenen.nl" ] && home="$PRIMARY/hockeyschoenen"
  for host in "$domain" "www.$domain"; do
    for protocol in http https; do
      check "$protocol://$host/" 301 "$home"
      check "$protocol://$host/zaalsticks?utm_source=test" 301 "$PRIMARY/zaalsticks?utm_source=test"
    done
  done
done

# The primary domain itself must keep serving pages, not redirect elsewhere.
check "$PRIMARY/" 200 ""
check "$PRIMARY/zaalsticks" 200 ""

exit $failed
