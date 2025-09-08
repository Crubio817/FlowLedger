# FlowLedger

[![CI/CD](https://github.com/Crubio817/FlowLedger/actions/workflows/azure-static-web-apps.ymlKey files:
- `src/services/workstream.api.ts`: Client for signals/candidates/pursuits/today
- `src/services/workstream.types.ts`: Types, helpers (`calculateSlaStatus`, color helpers)
- `src/components/TodayPanel.tsx`: UI for today's priorities
- Routes: `src/routes/workstream-*.tsx` and `src/routes/workstream.tsx`

## Communication Hub Overview

- **Identity Management**: Multi-provider principals (people, services, teams)
- **Threaded Communications**: Organized message threads with status tracking
- **Real-time Updates**: Optimistic UI with proper error handling
- **Integration**: Links to workstream entities and client records
- See `COMMS_HUB_INTEGRATION.md` for detailed architecture and usage.

Key files:
- `src/services/api.ts`: Communication and principal API functions
- `src/routes/comms-threads.tsx`: Thread listing and management
- `src/routes/comms-thread-detail.tsx`: Individual thread conversations
- `src/routes/settings-principals.tsx`: Identity provider managemente.svg)](https://github.com/Crubio817/FlowLedger/actions/workflows/azure-static-web-apps.yml)

FlowLedger is a modern React + TypeScript interface for internal audit and workstream operations. It centralizes SIPOC, interviews, process maps, findings, and a full Workstream (Signals → Candidates → Pursuits) pipeline with a unified Today Panel and Communication Hub.

Built with Vite and Tailwind CSS, it uses a component-first architecture, lazy-loaded routes, generated API types, and a pragmatic design system.

**Quick Links**
- `WORKSTREAM_README.md`: Workstream v2.1 architecture and flows
- `COMMS_HUB_INTEGRATION.md`: Communication Hub and identity management
- `ADVANCED_TABLE.md`: Data table capabilities and usage
- `MODAL_DESIGN_PATTERN.md`: Modern modal design guidelines

## Highlights

- **Dashboard:** KPIs and recent activity with a grid-themed workspace.
- **Workstream:** Signals, Candidates, Pursuits, Today Panel, SLA badges.
- **Communication Hub:** Multi-provider identity management and threaded communications.
- **SIPOC:** End-to-end SIPOC editing with autosave.
- **Interviews:** Schedule, track Q&A, and manage artifacts.
- **Process Maps:** File uploads via presigned URLs.
- **Findings:** Collaborative editing with optimistic saves.
- **Typed API:** OpenAPI-generated types and a robust HTTP client.
- **Design System:** Tailwind-based zinc theme with accent tokens.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, custom theme in `src/styles/theme.css`
- **Routing:** React Router v6, code-splitting via `React.lazy`
- **State:** Lightweight local state + `zustand` for app shell
- **UI Primitives:** Radix UI, MUI (selectively), `lucide-react`
- **Data:** `@tanstack/react-query` patterns in places; custom client
- **Testing:** Vitest, Testing Library
- **CI/CD:** Azure Static Web Apps

## Getting Started

- **Node:** v20+
- **NPM:** v9+

Install and run:
- `git clone https://github.com/Crubio817/FlowLedger.git && cd FlowLedger`
- `npm install`
- `npm run dev` → app at `http://localhost:5173`

API during development:
- `VITE_API_BASE_URL=/api` (see `.env.development`)
- Vite proxy sends `/api` to `http://localhost:4001` by default (see `vite.config.ts`)

If your backend runs elsewhere, adjust either `VITE_API_BASE_URL` or `vite.config.ts`.

## Environment

- `VITE_API_BASE_URL`: Base URL for API calls
  - Dev default: `/api` (proxied)
  - Example prod: `https://flowledger-api-web.azurewebsites.net/api`
- `.env.example` shows a production-style value. For local dev, use `.env.development` with `/api`.

## Scripts

- `dev`: Run Vite dev server
- `build`: Type-check and build to `dist`
- `preview`: Serve built app locally
- `lint`: ESLint for `src/**/*.{ts,tsx}`
- `typecheck`: TypeScript no-emit check
- `test`: Vitest in CI-friendly mode
- `gen:api`: Generate types from live OpenAPI: `${VITE_API_BASE_URL}/openapi.json`
- `gen:api:snapshot`: Fetch spec, update `api-spec.snapshot.json`, generate types
- `gen:api:from-snapshot`: Regenerate from checked-in snapshot
- `verify:api-types`: Ensure `src/services/types.gen.ts` matches snapshot

Regenerate API types when the backend schema changes:
- `npm run gen:api:snapshot`
- Commit `api-spec.snapshot.json` and `src/services/types.gen.ts`

`scripts/update-api-types.sh` uses `SPEC_URL` (default `http://localhost:4000/openapi.json`). Override if needed.

## Project Structure

- `src/app.tsx`: App shell (sidebar, split button, module launcher)
- `src/main.tsx`: Router setup & route-level lazy loading
- `src/components/`: App components (e.g., `TodayPanel.tsx`, `AdvancedTable.tsx`)
- `src/routes/`: Route screens (dashboard, clients, workstream, etc.)
- `src/services/`: API client (`api.ts`), generated types (`types.gen.ts`), workstream client/types
- `src/styles/theme.css`: Theme tokens and app shell styles
- `src/store/`: App store (`zustand`)
- `src/ui/`: Reusable UI primitives

Useful routes (see `src/main.tsx`):
- `/dashboard` – overview and KPIs
- `/clients`, `/clients/onboarding`, `/clients/engagements`
- `/comms/threads` – communication thread management
- `/settings/principals` – identity provider management
- `/sipoc`, `/interviews`, `/interview-qa`, `/process-maps`, `/findings`
- `/modules`, `/modules/:moduleKey`
- `/workstream/*` – signals, candidates, pursuits, today panel
- `/table-demo` – advanced table showcase

## Workstream Overview

- Entities: Signals → Candidates → Pursuits (stage-gated: qual → pink → red → submit → won/lost)
- SLA badges: green/amber/red based on due metrics
- Today Panel: unified queue across entities with filters and links
- See `WORKSTREAM_README.md` for architecture, SQL, endpoints, state machines, and SLA math.

Key files:
- `src/services/workstream.api.ts`: Client for signals/candidates/pursuits/today
- `src/services/workstream.types.ts`: Types, helpers (`calculateSlaStatus`, color helpers)
- `src/components/TodayPanel.tsx`: UI for today’s priorities
- Routes: `src/routes/workstream-*.tsx` and `src/routes/workstream.tsx`

## Design System

- Theme tokens and surfaces in `src/styles/theme.css`
- Dark and light themes via `body.theme-dark` / `body.theme-light`
- Collapsible sidebar in `src/components/collapsible-sidebar.tsx`
- Modal patterns in `MODAL_DESIGN_PATTERN.md`
- Advanced table patterns in `ADVANCED_TABLE.md`

## API Client

- `src/services/client.ts`: Fetch wrapper with error normalization and headers
- `src/services/api.ts`: Domain endpoints (dashboard, SIPOC, interviews, process maps, findings, clients)
- `src/services/types.gen.ts`: Generated OpenAPI types
- Use `withErrors(...)` to standardize toasts and error shapes

## Testing

- `npm run test` runs Vitest
- JSDOM environment for component tests (`vitest.config.ts`)
- Add tests under `src/tests/`

## Deployment

- Azure Static Web Apps via `.github/workflows/azure-static-web-apps.yml`
- SPA routing via `staticwebapp.config.json`
- Production API configured by `VITE_API_BASE_URL` at build time

## Troubleshooting

- API calls hit production in dev:
  - Ensure dev server via `npm run dev`
  - Ensure `.env.development` sets `VITE_API_BASE_URL=/api`
  - Backend should match Vite proxy target in `vite.config.ts` (default `http://localhost:4001`)
- Stale API types:
  - `npm run verify:api-types` to check; regenerate if mismatched
- Upload/process map issues:
  - Verify presigned URL flow (`requestUploadUrl` + `PUT`)

## Contributing

- Use feature branches and concise commits
- Run `npm run lint` and `npm run typecheck` before PRs
- Keep `api-spec.snapshot.json` and `types.gen.ts` in sync when API changes

## Additional Docs

- `WORKSTREAM_README.md`: Workstream module deep dive
- `COMMS_HUB_INTEGRATION.md`: Communication Hub feature guide and implementation
- `ADVANCED_TABLE.md`: AdvancedTable feature guide
- `MODAL_DESIGN_PATTERN.md`: Modal UI conventions
- `WORKSTREAM_*` routes and components for examples
