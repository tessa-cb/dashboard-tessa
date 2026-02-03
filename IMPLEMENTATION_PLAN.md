# Dashboard Tessa — Implementation Plan

## Stack (proposed, confirm)

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (optional) for quick dashboard primitives
- Zustand (or React context) for client state

## Architecture

- `/app` routes
- `components/` reusable UI
- `widgets/` each widget is a module: UI + data loader + settings
- `lib/` shared utilities (fetch, caching, types)
- `config/` widget registry + schema

## Iteration 0 checklist (scaffold)

- [x] Next.js app created
- [x] Tailwind configured
- [x] Basic dashboard page with grid
- [x] Widget registry with 1–2 sample widgets
- [x] Dev scripts (lint/format)

## Scaffold Notes

- initialized with Next.js 16 (Canary/Latest?) + React 19 + Tailwind 4 (via `@tailwindcss/postcss`).
- `widgets/` folder created for widget components.
- `config/widget-registry.ts` created for mapping IDs to components.
- Added `prettier` and `format` script.
- Used `app/page.tsx` for the main dashboard grid.
- NOTE: Tailwind v4 usage implies standard `postcss` config, might differ slightly from v3 `tailwind.config.js`. It uses CSS-first configuration.

## Feature 1: Mission Control MVP

- **Stack**: SQLite + Prisma, SSE for realtime.
- **Backend**:
  - `prisma/schema.prisma`: Models for `Agent`, `Task`, `Activity`.
  - `lib/prisma.ts`: Prisma Client singleton.
  - `lib/events.ts`: Global EventEmitter for SSE.
  - API Routes: `/api/agents`, `/api/tasks` (CRUD), `/api/stream` (SSE), `/api/seed`.
- **Frontend**:
  - `hooks/useMissionControl.ts`: Data fetching + SSE subscription.
  - Components: `AgentsPanel`, `KanbanBoard` (with Blocked column), `ActivityFeed`.
  - Used `EventSource` for realtime updates.
  - Used global variable for `EventEmitter` (MVP/Local dev approach; would need Redis for scale).
  - Database file `dev.db` ignored in git.

## Feature 2: Enhanced Mission Control

- **UI**:
  - `TaskDetailDrawer`: Slide-over for task details and comments.
  - `AgentsPanel`: Added session key editing and notification badges.
  - `KanbanBoard`: Added click handling to open drawer.
- **Backend**:
  - Updated Prisma Schema: Added `Comment`, `Notification`, and `sessionKey` to `Agent`.
  - New Routes:
    - `/api/tasks/[id]/comments` (GET/POST)
    - `/api/notifications` (GET/PATCH)
    - `/api/agents/[id]` (PATCH)
  - Updated SSE: Added `COMMENT` and `NOTIFICATION` channels.
- **Logic**:
  - Mentions (@Name) in comments trigger notifications for agents.
  - Session mapping supports manual edit + file sync endpoint.

## Iteration 4: Data Layer v1 (completed)

- Introduced **dashboard config** (`config/dashboard-config.ts`) and rendering runtime (`components/Dashboard/DashboardGrid.tsx`).
- Mission Control moved into a **single widget** (`components/MissionControl/MissionControlWidget.tsx`, `widgets/mission-control.tsx`).
- Added **widget frame** UI with manual refresh + auto-refresh (`components/Dashboard/WidgetFrame.tsx`).
- Implemented **widget-local refresh status** (refreshing/queued/last refreshed).
- Added lightweight **client-side caching + request de-duping** for API fetches:
  - `lib/cachedFetch.ts`
  - Used in `hooks/useMissionControl.ts` with short TTL.

## Interruption safety

- Keep tasks small and PR-like.
- Every batch ends with:
  - Updated ROADMAP.md checkmarks
  - Notes in IMPLEMENTATION_PLAN.md (decisions + next steps)

## Testing (added)

- Runner: Vitest
- Scope: API routes, hooks, lib utilities, and integration paths with SQLite + Prisma
- Test DB: `test.db` created via `prisma migrate deploy` in test setup
- Environments:
  - `node` for API/lib/integration tests
  - `jsdom` for hooks and localStorage usage

## Open questions to decide with Mamy

1. What are the **widgets** we want in the MVP?
2. Is the dashboard **local-only** (no auth) first, or do we integrate a provider immediately?
3. Preferred deployment target (or keep local)?
