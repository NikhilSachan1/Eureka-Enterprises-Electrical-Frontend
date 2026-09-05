# Eureka Enterprises Electrical Frontend

Angular 20 app for Eureka Enterprises (PrimeNG + Tailwind). Standalone components, lazy feature routes, Zod-validated API calls, and permission-gated pages.

## Prerequisites

- Node.js 22 (Angular 20 also supports current Node 20 LTS)
- npm 10+

## Environments

API URLs live in `src/environments/`. Angular file replacements pick the file at build/serve time.

| Command | Configuration | Environment file | Typical API |
| --- | --- | --- | --- |
| `npm start` / `npm run start:local` | `local` (default) | `environment.ts` | UAT API unless you point it at a local backend |
| `npm run start:dev` | `development` | `environment.dev.ts` | UAT (`https://api-uat.eurekaenterprises.org/api/v1`) |
| `npm run start:prod` | `production` | `environment.prod.ts` | Production API (local serve with prod bundle) |
| `npm run build:uat` | `development` | `environment.dev.ts` | UAT build |
| `npm run build:prod` | `production` | `environment.prod.ts` | Production build |

Flags in each file:

- `API_BASE_URL` — backend origin including `/api/v1`
- `ENABLE_LOGGING` — console logger; keep this `false` in production
- `ENVIRONMENT` — `local` \| `uat` \| `production` (see `EEnvironment`)

There is no `.env` file. Change the matching `environment*.ts` file, then restart the dev server.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Dev server, local configuration |
| `npm run start:dev` | Dev server against UAT environment file |
| `npm run start:local` | Same as `npm start` |
| `npm run start:prod` | Serve a production configuration locally |
| `npm run build:uat` | UAT/development build |
| `npm run build:prod` | Production build (CI uses this) |
| `npm run lint:check` | ESLint (no write) |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm run format:check` / `format:fix` | Prettier |
| `npm run gen:feature` | Scaffold a feature folder (see below) |
| `npm run find:empty` | Report empty files/folders |
| `npm test` | Karma unit tests (few/none today; `skipTests` is on for schematics) |

Husky runs lint-staged on commit (`lint:staged`).

## Feature recipe

Use this order so a new module matches existing features (leave, employee, asset, …).

1. **Scaffold**

   ```bash
   npm run gen:feature widget-management
   npm run gen:feature leave-management foo
   npm run gen:feature site-management/doc-management payment-advice
   ```

   Paths are under `src/app/features/`. The generator creates `components`, `config/{dialog,form,table}`, `resolvers`, `schemas`, `services`, `types`, plus a service and routes stub.

2. **Constants**

   - `src/app/core/constants/api.constants.ts` — `API_ROUTES`
   - `src/app/core/constants/app-permission.constant.ts` — `APP_PERMISSION`
   - `src/app/shared/constants/route.constants.ts` — `ROUTES` / `ROUTE_BASE_PATHS` when it is a new URL

3. **Contract**

   - Zod request/response schemas in `schemas/`
   - DTOs in `types/*.dto.ts` via `z.infer`
   - Re-export from `schemas/index.ts`

4. **UI config**

   - Form: `config/form/`
   - Table: `config/table/`
   - Dialogs: `config/dialog/`

5. **Service**

   - Inject `ApiService` and call `getValidated` / `postValidated` (etc.) with the schemas. Do not call `HttpClient` from the feature.

6. **Components**

   - Standalone, `ChangeDetectionStrategy.OnPush`, `app` prefix
   - List/get pages use the shared data table + search filter pattern where possible

7. **Routes**

   - `loadComponent` / `loadChildren` (keep the feature lazy)
   - `permissionGuard` + `data.permissions`
   - Register the new `*_ROUTES` on the parent `*.routes.ts` (and `app.routes.ts` only for a new top-level area)

8. **Menu**

   - Add a sidebar item in `src/app/core/config/menu.config.ts` with the same permission keys

## Architecture (short)

- `src/app/core` — API wrapper, interceptors, guards, env, permissions
- `src/app/shared` — form/table/dialog building blocks
- `src/app/features` — one folder per product area; lazy-loaded from `app.routes.ts`

Auth tokens are stored in `localStorage` / `sessionStorage`. Requests send `Authorization`, timezone, and active-role headers via interceptors.

## CI

Pull requests and pushes to `main` / `master` / `develop` run `.github/workflows/ci.yml`: `npm ci`, `lint:check`, `build:prod`.
