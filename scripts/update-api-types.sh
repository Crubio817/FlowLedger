#!/usr/bin/env bash
set -euo pipefail

# Configurable defaults
SPEC_URL=${SPEC_URL:-http://localhost:4000/openapi.json}
OUT_FILE=src/services/types.gen.ts
SNAPSHOT=api-spec.snapshot.json

echo "[update-api-types] Fetching OpenAPI spec from $SPEC_URL" >&2
curl -sSf "$SPEC_URL" -o "$SNAPSHOT".tmp

# Basic validation: ensure it has openapi/version field
if ! grep -q '"openapi"' "$SNAPSHOT".tmp; then
  echo "Spec download does not look like an OpenAPI doc (missing 'openapi' key)" >&2
  exit 1
fi

# Only replace snapshot if changed
if [ -f "$SNAPSHOT" ] && diff -q "$SNAPSHOT" "$SNAPSHOT".tmp >/dev/null; then
  echo "[update-api-types] Spec unchanged." >&2
  rm "$SNAPSHOT".tmp
else
  mv "$SNAPSHOT".tmp "$SNAPSHOT"
  echo "[update-api-types] Snapshot updated ($SNAPSHOT)." >&2
fi

echo "[update-api-types] Generating TypeScript types -> $OUT_FILE" >&2
npx openapi-typescript "$SNAPSHOT" -o "$OUT_FILE" --quiet || {
  echo "openapi-typescript generation failed" >&2
  exit 1
}

# Add banner
sed -i "1i // Generated via scripts/update-api-types.sh on $(date -u +'%Y-%m-%dT%H:%M:%SZ')\n// Do not edit manually. Update the backend spec and re-run the script.\n" "$OUT_FILE"

echo "[update-api-types] Done." >&2
