# FlowLedger AI Coding Agent Instructions

## Project Overview
FlowLedger is a modern React + TypeScript interface for internal audit and workstream operations. It centralizes SIPOC, interviews, process maps, findings, and a full Workstream pipeline (Signals → Candidates → Pursuits) with a unified Today Panel.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query patterns, Radix UI, Lucide icons.

## Architecture & Data Flow

### Core Application Structure
- **App Shell** (`src/app.tsx`): Sidebar navigation, split button, global module launcher
- **Routing** (`src/main.tsx`): React Router v6 with lazy-loaded routes and code-splitting
- **State Management**: Zustand for app shell (theme, accent, loading), React Query patterns for server state
- **Theme System**: CSS custom properties with dark/light variants, zinc color palette, cyan accents (#4997D0)

### Workstream Module (Primary Feature)
**Entity Flow:** Signal → Candidate → Pursuit → Engagement
- **Signals**: Incoming leads with urgency scoring and clustering
- **Candidates**: Qualified opportunities with confidence scoring
- **Pursuits**: Active deals through Pink/Red stage gates with checklists
- **State Machines**: Hard-enforced transitions with business rule validation
- **SLA Monitoring**: Automated breach detection with amber/red alerting
- **Multi-Tenant**: Complete org_id isolation for enterprise security

### API Integration
- **HTTP Client** (`src/services/client.ts`): Fetch wrapper with retry logic, error normalization, CORS handling
- **API Envelope**: `{ status: string; data: T; meta?: PageMeta }` response format
- **Error Handling**: `withErrors()` wrapper normalizes errors and shows toast notifications
- **Generated Types**: OpenAPI spec → TypeScript types via `openapi-typescript`
- **Type Verification**: Precommit hooks ensure types match backend spec

## Critical Developer Workflows

### API Type Management
```bash
# Generate types from live backend
npm run gen:api:snapshot    # Fetches spec, updates snapshot, generates types

# Generate from cached snapshot
npm run gen:api:from-snapshot

# Verify types match snapshot (CI + precommit)
npm run verify:api-types
```

**Environment Setup:**
- Dev: `VITE_API_BASE_URL=/api` (Vite proxies to `http://localhost:4001`)
- Prod: `VITE_API_BASE_URL=https://flowledger-api-web.azurewebsites.net/api`

### Development Commands
```bash
npm run dev          # Vite dev server with HMR
npm run build        # Type-check + build to dist
npm run typecheck    # Standalone TypeScript check
npm run lint         # ESLint on src/**/*.ts,tsx
npm run test         # Vitest in CI mode
```

## Project-Specific Conventions

### File Organization & Naming
- **Components**: PascalCase filenames (`TodayPanel.tsx`, `AdvancedTable.tsx`)
- **Services**: Domain-specific clients (`api.ts`, `workstream.api.ts`)
- **Types**: Generated in `types.gen.ts`, local types in `models.ts`
- **Path Aliases**: `@components/*`, `@services/*`, `@store/*`, `@utils/*`, `@config`

### Component Patterns
**Modal Design** (`MODAL_DESIGN_PATTERN.md`):
- Two-column layout: Left form, right preview
- Gradient headers with progress indicators
- Real-time preview updates
- AI-powered sections for complex data entry

**Table Patterns** (`ADVANCED_TABLE.md`):
- AdvancedTable component with sorting, filtering, column visibility
- Glass morphism styling with backdrop blur
- Status indicators and performance metrics
- Responsive design with mobile optimizations

### Styling Conventions
- **Color Scheme**: Cyan/blue accents (#4997D0) on zinc dark theme
- **CSS Classes**: Utility-first with Tailwind, custom properties for themes
- **Glass Effects**: `backdrop-blur-md` with semi-transparent backgrounds
- **Animations**: Staggered entrance animations, hover effects, smooth transitions

### Error Handling
```typescript
// Standard pattern across the codebase
function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    // Normalize error messages from various sources
    toast.error(normalizedMessage);
    throw e;
  });
}
```

### Form Handling
- **Validation**: React Hook Form + Zod schemas
- **File Uploads**: Presigned URLs for secure uploads
- **Real-time Updates**: Optimistic updates with rollback on failure

## Integration Points

### External APIs
- **MCP Integration**: AI enrichment, analysis, proposal drafting
- **Contact Enrichment**: FullEnrich, Clay APIs for company/contact data
- **File Storage**: S3-compatible with presigned URLs
- **Authentication**: JWT tokens with org_id extraction

### Cross-Component Communication
- **Navigation**: React Router with lazy loading
- **Global State**: Zustand for theme, accent, loading states
- **Events**: Custom events for sidebar/module launcher
- **Notifications**: react-hot-toast for user feedback

## Key Files & Directories

### Essential Reading
- `WORKSTREAM_README.md`: Complete workstream architecture and flows
- `ADVANCED_TABLE.md`: Data table capabilities and usage patterns
- `MODAL_DESIGN_PATTERN.md`: Modal UI conventions and patterns
- `src/services/client.ts`: HTTP client with retry/error handling
- `src/services/api.ts`: Domain API endpoints and error patterns
- `src/styles/theme.css`: Complete theme system and CSS variables
- `src/app.tsx`: App shell and layout structure

### Workstream Implementation
- `src/services/workstream.api.ts`: Workstream API client
- `src/services/workstream.types.ts`: Types, helpers, SLA calculations
- `src/components/TodayPanel.tsx`: Unified dashboard component
- `src/routes/workstream.tsx`: Route structure and lazy loading

### Development Infrastructure
- `vite.config.ts`: Build config with path aliases and proxy
- `tsconfig.json`: TypeScript config with strict mode
- `vitest.config.ts`: Testing configuration
- `scripts/update-api-types.sh`: API type generation workflow

## Development Best Practices

### Code Quality
- **TypeScript Strict**: Full strict mode enabled
- **ESLint**: Standard React/TypeScript rules
- **Precommit Hooks**: API type verification, linting
- **Testing**: Vitest with JSDOM environment

### Performance
- **Code Splitting**: Lazy-loaded routes via `React.lazy`
- **Bundle Optimization**: Vite with tree-shaking
- **Image Optimization**: Proper sizing and formats
- **Caching**: React Query for server state caching

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: High contrast themes

## Common Patterns & Gotchas

### API Calls
- Always use `withErrors()` wrapper for consistent error handling
- Check `e.parsed` for additional error details from backend
- Handle both network errors and server validation errors

### State Management
- Use Zustand for app shell state (theme, loading, etc.)
- Use React Query for server state with caching
- Avoid prop drilling with context when possible

### Styling
- Use Tailwind utilities first, custom CSS only when necessary
- Respect the established color palette and theme variables
- Test components in both dark and light themes

### File Uploads
- Use presigned URLs for secure, direct-to-storage uploads
- Handle progress indicators and error states
- Validate file types and sizes on both client and server

### Forms
- Use React Hook Form for complex forms
- Implement Zod schemas for validation
- Provide clear error messages and loading states

## Deployment & CI/CD

### Build Process
- **Azure Static Web Apps**: SPA routing with `staticwebapp.config.json`
- **Environment Variables**: Build-time configuration via Vite
- **Asset Optimization**: Vite handles bundling, minification, compression

### Production Considerations
- **API URLs**: Configured at build time via `VITE_API_BASE_URL`
- **Error Boundaries**: Implement for production error handling
- **Performance Monitoring**: Consider adding analytics and error tracking
- **Security**: CSP headers, secure cookie settings

---

*These instructions are derived from the actual codebase patterns and should be updated as the project evolves. Reference the key files listed above for implementation examples.*</content>
<parameter name="filePath">/workspaces/FlowLedger/.github/copilot-instructions.md
