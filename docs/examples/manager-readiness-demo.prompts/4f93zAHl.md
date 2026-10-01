#!/usr/bin/env bash
set -euo pipefail
{
  printf '# Repository facts\n\n'
  printf 'Branch: %s\n\n' "$(git branch --show-current)"
  printf 'Latest commit: %s\n\n' "$(git log -1 --format='%h %s')"
  printf 'Tracked files: %s\n\n' "$(git ls-files | wc -l | tr -d ' ')"
  printf 'Package scripts:\n\n```json\n'
  sed -n '/"scripts": {/,/  },/p' package.json
  printf '```\n\n'
  printf 'The project includes the calculator app and its onboarding documentation.\n'
} > "$PDO_OUTPUT_FACTS"