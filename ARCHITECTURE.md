# Dashboard Tessa — Architecture

This document explains how the dashboard’s parts interact (UI, API routes, realtime stream, database, and external tooling).

## High-level diagram

```
 Browser (React client)
   |
   | 1) HTTP (JSON)
   v
 Next.js App Router
   - /app (pages)
   - /app/api/* (route handlers)
   |
   | 2) Prisma ORM
   v
 SQLite (dev.db)

 Browser (React client)
   |
   | 3) SSE (text/event-stream)
   v
 /api/stream  ---> in-process EventEmitter (lib/events.ts)
                         ^
                         |
                  API routes emit events
```

## Services / components

### 1) Web Client (React)
**Location:** `app/page.tsx`, `components/**`, `widgets/**`, `hooks/**`

Responsibilities:
- Renders the dashboard shell + widgets.
- Calls backend APIs for CRUD.
- Subscribes to realtime updates via Server-Sent Events (SSE).

Key pieces:
- **Dashboard runtime**
  - `config/dashboard-config.ts`: Dashboard config (widget instances).
  - `config/widget-registry.ts`: Widget registry (widgetId → React component).
  - `components/Dashboard/DashboardGrid.tsx`: Renders widgets from config; controls per-widget refresh.
  - `components/Dashboard/WidgetFrame.tsx`: Widget chrome (title, refresh, auto-refresh, status).

- **Mission Control widget**
  - `components/MissionControl/MissionControlWidget.tsx`: Mission Control UI packaged as a widget.
  - `hooks/useMissionControl.ts`: Fetches agents/tasks, listens to SSE, manages “connected” state.

### 2) Next.js API Routes (App Router route handlers)
**Location:** `app/api/**/route.ts`

Responsibilities:
- Provide JSON CRUD APIs for Agents/Tasks/Comments/Notifications.
- Emit activity events to the in-process event bus.
- Provide a realtime stream endpoint (`/api/stream`) consumed by the browser.

Endpoints:
- **Agents**
  - `GET /api/agents`: list agents + notification counts
  - `PATCH /api/agents/[id]`: update agent (e.g., `sessionKey`)

- **Tasks**
  - `GET /api/tasks`, `POST /api/tasks`
  - `PATCH /api/tasks/[id]`
  - `GET/POST /api/tasks/[id]/comments`

- **Notifications**
  - `GET /api/notifications?agentId=...&unread=true`
  - `PATCH /api/notifications` (mark read)

- **Seed & misc**
  - `POST /api/seed`: reset and populate sample data
  - `POST /api/sync/moltbot`: sync agent session keys from `moltbot-sessions.json`

### 3) Realtime Event Bus (in-process)
**Location:** `lib/events.ts`

Responsibilities:
- Provide a shared, in-memory pub/sub mechanism for the Node process.
- API routes emit events (activity/comment/notification), stream handler forwards them to connected clients.

Important constraints:
- This is **single-process** only (works for local dev / single server).
- For multi-instance deployments, replace with Redis pub/sub or a managed realtime service.

### 4) SSE Stream
**Location:** `app/api/stream/route.ts`

Responsibilities:
- Establish `text/event-stream` connection.
- Subscribe to `lib/events.ts` channels.
- Forward events as `data: <json>\n\n`.
- Send periodic `: heartbeat` keepalive comments.

Client behavior:
- `hooks/useMissionControl.ts` creates an `EventSource` to `/api/stream`.
- On each event:
  - add to activity feed
  - update `lastEvent`
  - refetch agents/tasks (MVP approach)

### 5) Database Layer (Prisma + SQLite)
**Locations:**
- Schema: `prisma/schema.prisma`
- Client: `lib/prisma.ts`
- DB file: `dev.db`

Responsibilities:
- Durable persistence of agents, tasks, comments, notifications.

Models:
- `Agent` (includes optional `sessionKey` for Moltbot mapping)
- `Task` (optional relation to `Agent`)
- `Comment` (belongs to `Task`, optional `Agent`)
- `Notification` (belongs to `Agent`, optional `TaskId`)
- `Activity` (log feed)

### 6) External integration: Moltbot session mapping
**Locations:**
- `app/api/sync/moltbot/route.ts`
- `moltbot-sessions.json`

Responsibilities:
- Map dashboard Agents to Moltbot session keys.
- Current implementation reads a local JSON file and updates Agents by name.

Notes:
- This is intentionally “manual / local-first” for now.
- Later we can swap the file for a real Moltbot API integration.

## Testing

- Runner: Vitest (`npm test`)
- Test DB: SQLite `test.db` created via Prisma migrations
- Environments:
  - `node` for API/lib/integration tests
  - `jsdom` for hooks and localStorage
- Setup code: `tests/setup-env.ts`, `tests/setup-db.ts`

## Key interaction flows

### A) Load dashboard
1. Browser loads `/`.
2. `DashboardGrid` renders widget(s) from `DEFAULT_DASHBOARD_CONFIG`.
3. Mission Control widget calls `useMissionControl()`.
4. Hook fetches:
   - `GET /api/agents`
   - `GET /api/tasks`
5. Hook also opens `EventSource` to `GET /api/stream`.

### B) Create or update a task
1. User creates/moves/assigns a task in the widget.
2. Browser calls `POST /api/tasks` or `PATCH /api/tasks/[id]`.
3. API route writes via Prisma to SQLite.
4. API route emits an event on `lib/events.ts`.
5. `/api/stream` pushes it to the browser.
6. Client updates activity feed and refetches tasks/agents.

### C) Comment + mentions
1. User posts comment: `POST /api/tasks/[id]/comments`.
2. API parses `@Name` mentions, creates Notifications for mentioned Agents.
3. API emits comment + notification events.
4. Clients listening via SSE update their UI and notification badges.

### D) Widget-local refresh
1. User hits Refresh (or auto-refresh ticks) in `WidgetFrame`.
2. `DashboardGrid` triggers widget refresh by bumping a `refreshKey`.
3. Widget hook refetches data and calls `onRefreshed(refreshKey)`.
4. `WidgetFrame` shows “Refreshing…” and updates “Last refreshed”.
5. If a refresh is requested while already refreshing, it is queued and runs immediately after.

## Non-goals (for now)
- Multi-user auth
- Server-side caching
- Multi-process realtime

## Next planned evolution
- Data Layer v1: local caching/deduping for widget fetches + mock data providers.
- Persistence v1: store dashboard config (widget list + layout) in localStorage.
- Core widgets: agenda, focus timer, weather, notes.
