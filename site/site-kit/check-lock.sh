#!/usr/bin/env bash
#
# check-lock.sh — run by each site's CI against its own copy of the site kit.
#
# The copy at site/site-kit/ is written by `scripts/site-kit sync` in the
# FlowDrop workspace, together with kit.lock: one SHA-256 per file. This script
# needs nothing outside the repo, so a public CI can run it without access to
# the private workspace. It fails when a file was edited, added or removed by
# hand. The fix is never to edit the copy: change process/site-kit/ in the
# workspace and sync again.
#
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

hash() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$@"; else shasum -a 256 "$@"; fi
}

listed=$(awk '{print $2}' kit.lock | sort)
actual=$(find . -type f ! -name kit.lock | sort)
if [ "$listed" != "$actual" ]; then
  echo "::error::site/site-kit/ holds different files than kit.lock lists (< lock, > disk)"
  diff <(printf '%s\n' "$listed") <(printf '%s\n' "$actual") || true
  exit 1
fi

if ! hash -c --quiet kit.lock; then
  echo "::error::site/site-kit/ was edited by hand. Edit process/site-kit/ in the FlowDrop workspace and run scripts/site-kit sync."
  exit 1
fi

echo "site-kit: $(wc -l < kit.lock | tr -d ' ') files match kit.lock"
