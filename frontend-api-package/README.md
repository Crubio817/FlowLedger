# Frontend Integration Package Alignment

This folder tracks the upstream package you shared and a couple of small deltas needed to match the FlowLedger backend.

Changes we applied:
- Consistent success envelope unwrapping (always return `response.data.data`).
- Accent color is `#4997D0` and used consistently for active UI states.
- Optional: `gen:api:types` defaults to local `openapi.snapshot.json` if `SPEC_URL` is not set.

See `patches/` for an exact patch you can apply to your copy.
