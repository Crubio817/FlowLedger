# FlowLedger

[![CI/CD](https://github.com/Crubio817/FlowLedger/actions/workflows/azure-static-web-apps.yml/badge.svg)](https://github.com/Crubio817/FlowLedger/actions/workflows/azure-static-web-apps.yml)

FlowLedger is a modern, responsive web interface for managing and tracking internal audit processes. It provides auditors with a centralized platform to work with key assets like SIPOC diagrams, interview notes, process maps, and findings.

Built with React, TypeScript, and Vite, it features a clean, component-based architecture and a design system powered by Tailwind CSS.

## Features

- **Dashboard:** At-a-glance view of in-progress audits and recent activity.
- **Side Navigation:** Persistent vertical menu for quick access to app sections.
- **SIPOC Builder:** Interactive tool to define Suppliers, Inputs, Process, Outputs, and Customers.
- **Interview Management:** Schedule interviews and log question-and-answer sessions.
- **Process Mapping:** Upload and manage process flow diagrams.
- **Findings & Recommendations:** Document audit findings and track remediation.
- **Global State Management:** Centralized, reactive state using Zustand.
- **Typed API Layer:** End-to-end type safety with generated OpenAPI types.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, headless UI principles
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Fetch API wrapper
- **Testing:** Vitest, React Testing Library
- **Deployment:** Azure Static Web Apps

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- [npm](https://www.npmjs.com/) (v9.x or later)
- A running instance of the [FlowLedger backend API](https://github.com/your-org/flowledger-api) on `http://localhost:4000`.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Crubio817/FlowLedger.git
    cd FlowLedger
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Local Development:**
    For local development, the app expects the backend API to be running on `http://localhost:4000`. The Vite development server will proxy all requests from `/api` to this backend.

    Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## Key Scripts

- `npm run dev`: Starts the Vite development server with hot-reloading.
- `npm run build`: Compiles and bundles the app for production into the `/dist` directory.
- `npm run preview`: Serves the production build locally to preview before deployment.
- `npm run test`: Runs unit and integration tests with Vitest.
- `npm run typecheck`: Verifies TypeScript types across the project.
- `npm run lint`: Lints the codebase with ESLint.
- `npm run gen:api`: Generates TypeScript types directly from the live backend's OpenAPI schema (no snapshot). Requires backend running.
- `npm run gen:api:snapshot`: Fetches the OpenAPI spec, stores/updates `api-spec.snapshot.json`, then generates types. Prefer this for commits so spec + types version together.

### Regenerating API Types

When the DB / API schema changes:

1. Run / update backend so the new schema is reflected at `http://localhost:4000/openapi.json`.
2. Execute:
  ```bash
  npm run gen:api:snapshot
  ```
3. Commit BOTH `api-spec.snapshot.json` and `src/services/types.gen.ts`.

Why snapshot? It lets reviewers diff the API spec separately from code changes and prevents silent drift if the live backend changes later.

Quick direct regen (no snapshot persistence):
```bash
npm run gen:api
```

---

## API Configuration

The API base URL is resolved dynamically based on the environment:

1.  **`.env` file:** `VITE_API_BASE_URL` in a `.env` file will always take precedence.
2.  **Development:** When running `npm run dev`, it defaults to `/api`. This uses Vite's proxy to redirect requests to your local backend at `http://localhost:4000`, avoiding CORS issues. This is configured in `vite.config.ts` and `.env.development`.
3.  **Production:** In a production build, it defaults to the deployed Azure Function URL specified in the GitHub Actions workflow (`https://flowledger-api-func.azurewebsites.net/api`).

This ensures a seamless development experience while maintaining a production-ready configuration for deployment.

---

## Deployment

This repository is configured for continuous deployment to **Azure Static Web Apps**.

- **Trigger:** A push or PR to the `main` branch will trigger the GitHub Actions workflow defined in `.github/workflows/azure-static-web-apps.yml`.
- **Process:** The workflow installs dependencies, runs tests and type checks, builds the application, and deploys the `/dist` folder to Azure.
- **API Connection:** The production `VITE_API_BASE_URL` is injected at build time via a GitHub Actions secret, linking the frontend to the live Azure Function API.

The `staticwebapp.config.json` file ensures that all routes are handled by the React application (SPA fallback).

---

## Troubleshooting

- **`net::ERR_NAME_NOT_RESOLVED` in Browser:**
  - **In Local Dev:** This error means the app is trying to call the production Azure API instead of your local proxy. Ensure you are running `npm run dev` and that your `.env.development` file is correctly setting `VITE_API_BASE_URL=/api`. Also, confirm your local backend is running on port 4000.
  - **In Production:** This indicates the Azure Function App hostname is incorrect, not running, or not publicly accessible. Verify the `VITE_API_BASE_URL` in the GitHub Actions workflow matches the URL of your deployed Azure Function.

- **Favicon 404 Error:**
  A default `favicon.svg` has been added to the `/public` directory and is referenced in `index.html`. This should resolve any 404 errors for the site icon.

- **Type Errors after `git pull`:**
  If you encounter type-related issues, regenerate the API types to sync with the latest backend changes:
  ```bash
  npm run gen:api
  ```
