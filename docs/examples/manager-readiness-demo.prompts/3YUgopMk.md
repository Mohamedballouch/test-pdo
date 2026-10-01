#!/usr/bin/env bash
set -euo pipefail
if ! command -v node >/dev/null 2>&1; then . "$HOME/.nvm/nvm.sh"; fi
npm ci --prefer-offline --no-audit --no-fund >/dev/null
{
  printf '# Calculator checks\n\n'
  printf 'Node version: %s\n\n' "$(node --version)"
  printf 'Tests:\n\n```text\n'
  npm test 2>&1 | tail -n 10
  printf '```\n\nBuild:\n\n```text\n'
  npm run build 2>&1 | tail -n 10
  printf '```\n'
} > "$PDO_OUTPUT_CHECKS"