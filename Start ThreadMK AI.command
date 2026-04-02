#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")" || exit 1
npx wrangler pages dev . --port 8041 --ai AI
