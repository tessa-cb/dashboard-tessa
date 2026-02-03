# CODEX — Dashboard Tessa

## Purpose
Personal dashboard with a modular widget grid and a "Mission Control" area for tasks, agents, activity, and realtime updates.

## Stack
- Next.js App Router (React 19, TypeScript)
- Tailwind CSS v4
- Prisma + SQLite (local `dev.db`)
- Server-Sent Events (SSE) for realtime

## Quickstart
- Node.js 22 LTS
- `npm install`
- `npx prisma generate`
- `npx prisma migrate dev`
- `npm run dev`

Notes
- `.env` sets `DATABASE_URL="file:./dev.db"`
- Prisma config lives in `prisma.config.ts` and loads `dotenv/config`
- Dev DB file: `dev.db` (local only)

## Scripts
- `npm run dev` start dev server
- `npm run build` build
- `npm run start` run production server
- `npm run lint` eslint
- `npm run format` prettier
- `npm test` vitest run

## Architecture Snapshot
- UI renders the dashboard grid and widgets.
- API routes in `app/api/**/route.ts` provide CRUD for agents, tasks, comments, notifications.
- Realtime events are emitted via an in-process `EventEmitter` and streamed with SSE at `/api/stream`.
- Prisma talks to SQLite at `dev.db`.

## Key Directories
- `app` Next.js routes and API handlers
- `components` dashboard shell and Mission Control UI
- `widgets` widget implementations and registry entries
- `hooks` client data hooks (Mission Control, dashboard config)
- `lib` shared utilities, caching, events, prisma, localStorage
- `config` dashboard config and widget registry
- `prisma` schema and migrations

## Entry Points
- Page shell: `app/page.tsx`
- App layout: `app/layout.tsx`
- Global styles: `app/globals.css`
- Dashboard grid: `components/Dashboard/DashboardGrid.tsx`
- Widget chrome: `components/Dashboard/WidgetFrame.tsx`

## Runtime Flows
- Load dashboard
- `app/page.tsx` renders `DashboardGrid`.
- `DashboardGrid` reads config from `config/dashboard-config.ts` and localStorage via `hooks/useDashboardConfig.ts`.
- Mission Control widget fetches `/api/agents` and `/api/tasks` and opens `EventSource` to `/api/stream`.

- Task update
- Client `POST` or `PATCH` to `/api/tasks`.
- API writes via Prisma then emits an event through `lib/events.ts`.
- `/api/stream` forwards the event to clients; Mission Control refetches data.

- Comment + mentions
- Client `POST` to `/api/tasks/[id]/comments`.
- API parses @mentions and creates notifications; emits comment + notification events.

## API Endpoints
- `GET /api/agents` list agents + notification counts
- `PATCH /api/agents/[id]` update agent fields (e.g., `sessionKey`)
- `GET /api/tasks` list tasks
- `POST /api/tasks` create task
- `PATCH /api/tasks/[id]` update task
- `GET /api/tasks/[id]/comments` list comments
- `POST /api/tasks/[id]/comments` create comment (parses @mentions)
- `GET /api/notifications?agentId=...&unread=true` list notifications
- `PATCH /api/notifications` mark notifications read
- `POST /api/seed` reset and seed sample data
- `POST /api/sync/moltbot` sync session keys from `moltbot-sessions.json`
- `GET /api/stream` realtime SSE feed

## Data Model (Prisma)
- `Agent` has `sessionKey` for Moltbot mapping
- `Task` can be assigned to an `Agent`
- `Comment` belongs to `Task`, optional `Agent`
- `Notification` belongs to `Agent`, optional `Task`
- `Activity` stores log entries

## Widget System
- Widget registry: `config/widget-registry.ts`
- Default layout: `config/dashboard-config.ts`
- Widget chrome + refresh logic: `components/Dashboard/WidgetFrame.tsx`
- Widget refresh: `components/Dashboard/DashboardGrid.tsx` triggers per-widget refresh keys
- Mission Control widget entry: `widgets/mission-control.tsx`

## Local Persistence
- Dashboard layout and settings: `lib/dashboardStorage.ts` (localStorage key `dashboard-tessa:config:v1`)

## Testing
- Runner: Vitest
- Test DB: `test.db` created via Prisma migrations (`tests/setup-db.ts`)
- Environments:
  - `node` for API/lib/integration tests
  - `jsdom` for hooks and localStorage
- Entry points: `tests/**/*.test.ts`

## Realtime Details
- Event bus: `lib/events.ts` (in-process EventEmitter)
- Stream handler: `app/api/stream/route.ts`
- Client hookup: `hooks/useMissionControl.ts`
- Constraint: single-process only (no cross-instance pub/sub)

## Caching
- `lib/cachedFetch.ts` provides TTL-based request de-duping
- Used by Mission Control to reduce refetch churn after SSE events

## External Data
- Moltbot session mapping: `moltbot-sessions.json`
- Sync endpoint: `app/api/sync/moltbot/route.ts`

## Common Changes
- Add a widget
- Create component in `widgets/`
- Register in `config/widget-registry.ts`
- Add to default layout in `config/dashboard-config.ts`

- Add a Mission Control API field
- Update Prisma schema in `prisma/schema.prisma`
- Run `npx prisma migrate dev`
- Update API route in `app/api/**/route.ts`
- Update UI in `components/MissionControl/**`

## Related Docs
- Architecture overview: `ARCHITECTURE.md`
- Implementation notes: `IMPLEMENTATION_PLAN.md`
- Roadmap: `ROADMAP.md`
