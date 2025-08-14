#!/usr/bin/env bash
set -euo pipefail

# Only run if snapshot or types changed
if git diff --cached --quiet api-spec.snapshot.json src/services/types.gen.ts; then
  exit 0
fi

npm run verify:api-types
