# FlowLedger Interface

React + TypeScript + Vite frontend for audit process assets (SIPOC, Interviews, Process Maps, Findings).

## Getting Started

Requirements: Node 18+ (LTS), npm 9+

Install dependencies:
```
npm i
```
Development server:
```
npm run dev
```
Type check:
```
npm run typecheck
```
Lint:
```
npm run lint
```
Build production:
```
npm run build
```
Preview build:
```
npm run preview
```
Run smoke tests (after adding tests):
```
npm run test
```

## API types generation (OpenAPI)
Generate typed API definitions from the backend OpenAPI spec:
```
npm run gen:api
```
This fetches `http://localhost:4000/openapi.json` and writes `src/services/types.gen.ts` using `openapi-typescript`.
Make sure your backend is running locally on port 4000.

## Feature Flags
Amber accent toggle enabled via store; future flags in `src/config.ts`.

## Deploy (Azure Static Web Apps)

This repo is wired for Azure Static Web Apps (Standard).

1) Set repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN` from your Static Web App resource (Deployment token).
2) Ensure `VITE_API_BASE_URL` is set (workflow sets it to the production Function App by default).
3) Push to `main` — GitHub Actions will build and upload `/dist` to your Static Web App.

SPA routing is configured via `staticwebapp.config.json` to rewrite to `index.html`.

## Architecture
- All domain types in `src/store/types.ts` (single source of truth)
- Mocks in `src/data/mock.ts`
- Service layer `src/services/api.ts` (only data access; simulated latency + random failures)
- State via Zustand `src/store/useAppStore.ts`
- Routes under `src/routes/*` (lazy loaded)
- Shared components `src/components/*`
- Utilities `src/utils/*`

## Styling & Tokens
Tailwind with custom colors: deep blues (#0F172A / #111827) and accent mint (#34D399) / optional amber (#F59E0B). Use classes, avoid raw hex outside config.

## Error Simulation
Services randomly throw (10% rate). Handle UI error states per page.

## Future Backend Swap
Replace TODO comments in `services/api.ts` with real fetch calls pointing at `/api/v1/...` defined in `config.ts`.

## Troubleshooting
- If build fails on plugin not found, ensure dev deps installed (`npm i`).
- Clear Vite cache: `rm -rf node_modules/.vite`.
- Type path issues: run `npm run typecheck` to surface path mapping errors.

## License
Internal (proprietary) – pending clarification.
